import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parseAcicPage, parseAcicDetail } from '../server/services/acic-parser.js'
import { collectAcicJobs, saveAcicJobs } from '../server/services/acic-ingest.js'

const listing = await readFile(new URL('./fixtures/acic-listing.html', import.meta.url), 'utf8')
const detail = await readFile(new URL('./fixtures/acic-detail.html', import.meta.url), 'utf8')
const url = 'https://www.rededetalentos.com.br/vagas?cidades%5B%5D=54860'
const singlePage = listing.replace('882 vagas encontradas', '1 vaga encontrada').replace(/<div class="c-pagination[\s\S]*/, '')
const response = (html) => ({ ok: true, text: async () => html })

test('extracts actual ACIC title, publication date and canonical application link', () => {
  const page = parseAcicPage(listing, url)
  assert.equal(page.total, 882)
  assert.equal(page.jobs[0].external_id, '239800')
  assert.equal(page.jobs[0].title, 'ESTOQUISTA (Auto Center)')
  assert.equal(page.jobs[0].date, '2026-10-07')
  assert.equal(page.jobs[0].location, 'Criciúma - SC')
  assert.equal(page.jobs[0].link, 'https://www.rededetalentos.com.br/vagas/estoquista-auto-center/239800')
  assert.equal(new URL(page.next).searchParams.get('cidades[]'), '54860')
  assert.equal(new URL(page.next).searchParams.get('page'), '1')
})

test('detail preserves modality, contract and separated benefits', () => {
  const job = parseAcicDetail(detail)
  assert.equal(job.modality, 'Presencial')
  assert.ok(job.tags.includes('Indeterminado (CLT)'))
  assert.match(job.description, /Refeitório\nVale alimentação/)
})

test('fails closed on changed markup, invalid dates and off-site pagination', () => {
  assert.throws(() => parseAcicPage('<html>maintenance</html>', url))
  assert.throws(() => parseAcicPage(listing.replace('07/10/2026', '31/02/2026'), url))
  assert.throws(() => parseAcicPage(listing.replace(/href="vagas\?page=1[^"]*" class="c-pagination__next"/, 'href="https://example.com/vagas" class="c-pagination__next"'), url))
})

test('collects details and recognizes a complete snapshot', async () => {
  const result = await collectAcicJobs({ delayMs: 0, fetcher: async (request) => response(request.endsWith('/239800') ? detail : singlePage) })
  assert.equal(result.complete, true)
  assert.equal(result.jobs[0].modality, 'Presencial')
})

test('page cap cannot mark a snapshot complete', async () => {
  const result = await collectAcicJobs({ delayMs: 0, maxPages: 1, fetcher: async (request) => response(request.endsWith('/239800') ? detail : listing) })
  assert.equal(result.complete, false)
})

test('blocked detail aborts collection rather than silently saving partial metadata', async () => {
  await assert.rejects(collectAcicJobs({ delayMs: 0, fetcher: async (request) => request.endsWith('/239800') ? { ok: false, status: 403 } : response(singlePage) }), /ACIC_HTTP:403/)
})

const fakeDb = () => {
  const calls = []
  return { calls, from: () => {
    const query = {
      upsert: (rows) => { calls.push(['upsert', rows]); return Promise.resolve({ error: null }) },
      update: (payload) => { calls.push(['update', payload]); return query },
      select: () => query, eq: () => query, is: () => query, lt: () => query, order: () => query,
      range: () => Promise.resolve({ data: [], error: null }),
      then: (resolve) => Promise.resolve({ error: null }).then(resolve),
    }
    return query
  } }
}

test('incomplete snapshots save ACIC rows without expiring unseen jobs', async () => {
  const db = fakeDb()
  const result = { jobs: parseAcicPage(listing, url).jobs, fetchedCount: 1, complete: false, cutoffDate: '2026-09-01' }
  await saveAcicJobs(db, result)
  assert.equal(db.calls.length, 1)
  assert.equal(db.calls[0][1][0].source, 'acic')
  assert.equal(db.calls[0][1][0].id, 'acic-239800')
})

test('empty result never mutates the database', async () => {
  const db = fakeDb()
  const r = await saveAcicJobs(db, { jobs: [], fetchedCount: 0, complete: true })
  assert.equal(r.skipped, true)
  assert.equal(db.calls.length, 0)
})

test('complete collection expires a missing job only at its confirmation threshold', async () => {
  const updates = []
  const filters = []
  const db = { from: () => {
    let payload
    const query = {
      upsert: async () => ({ error: null }),
      update: (value) => { payload = value; return query },
      select: () => query, is: () => query, lt: () => query, order: () => query,
      eq: (key, value) => { filters.push([key, value]); return query },
      range: async () => ({ data: [{ id: 'acic-old', external_id: 'old', missing_runs: 2 }], error: null }),
      then: (resolve) => { updates.push(payload); return Promise.resolve({ error: null }).then(resolve) },
    }
    return query
  } }
  await saveAcicJobs(db, { jobs: parseAcicPage(listing, url).jobs, fetchedCount: 1, complete: true, cutoffDate: '2026-09-01' }, { expirationRuns: 3 })
  assert.equal(updates[1].missing_runs, 3)
  assert.ok(updates[1].expired_at)
  assert.ok(filters.some(([key, value]) => key === 'source' && value === 'acic'))
  assert.ok(filters.some(([key, value]) => key === 'id' && value === 'acic-old'))
})

test('failed upsert stops before expiration', async () => {
  const db = { from: () => ({ upsert: async () => ({ error: { message: 'offline' } }), update: () => { throw new Error('expiration must not run') } }) }
  await assert.rejects(saveAcicJobs(db, { jobs: parseAcicPage(listing, url).jobs, fetchedCount: 1, complete: true }), /offline/)
})
