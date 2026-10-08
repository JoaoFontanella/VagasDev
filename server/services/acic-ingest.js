import { ACIC_ORIGIN, parseAcicPage, parseAcicDetail } from './acic-parser.js'
import { getJobCutoffDate } from './job-retention.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const number = (value, fallback, min = 1) => Number.isFinite(Number(value)) && Number(value) >= min ? Number(value) : fallback

const fetchHtml = async (url, fetcher) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetcher(url, {
        headers: { Accept: 'text/html', 'User-Agent': 'VagasDev/1.0' },
        signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error(`ACIC_HTTP:${response.status}`)
      return await response.text()
    } catch (error) {
      const retry = /ACIC_HTTP:5\d\d/.test(error.message) || ['TimeoutError', 'AbortError'].includes(error.name) || error instanceof TypeError
      if (!retry || attempt === 2) throw error
      await sleep(1000 * 2 ** attempt)
    }
  }
}

export const collectAcicJobs = async (options = {}) => {
  const fetcher = options.fetcher || fetch
  const maxPages = number(options.maxPages ?? process.env.ACIC_MAX_PAGES, 100)
  const delay = number(options.delayMs ?? process.env.ACIC_REQUEST_DELAY_MS, 250, 0)
  const url = new URL('/vagas', ACIC_ORIGIN)
  url.searchParams.set('cidades[]', options.cityId || process.env.ACIC_CITY_ID || '54860')
  url.searchParams.set('order', '')
  url.searchParams.set('keyword', '')
  let next = url.href
  let complete = false
  let total = 0
  let pages = 0
  const seenPages = new Set()
  const jobs = new Map()
  while (next && pages < maxPages) {
    if (seenPages.has(next)) throw new Error('[acic] paginação repetida; coleta interrompida.')
    seenPages.add(next)
    const page = parseAcicPage(await fetchHtml(next, fetcher), next)
    pages += 1
    if (pages % 10 === 0) console.log(`[acic] ${pages} páginas consultadas.`)
    total = Math.max(total, page.total)
    let added = 0
    for (const job of page.jobs) {
      if (!jobs.has(job.external_id)) { jobs.set(job.external_id, job); added += 1 }
    }
    if (page.jobs.length && !added) throw new Error('[acic] página repetiu todas as vagas; coleta interrompida.')
    next = page.next
    if (!next) complete = jobs.size >= total
    if (next && pages < maxPages) await sleep(delay)
  }
  const cutoffDate = getJobCutoffDate(options)
  const retained = [...jobs.values()].filter((job) => job.date >= cutoffDate)
  let cursor = 0
  let detailed = 0
  // Two workers keep requests bounded; all details must succeed before persistence.
  const workers = Array.from({ length: Math.min(2, retained.length) }, async () => {
    while (cursor < retained.length) {
      const job = retained[cursor++]
      const detail = parseAcicDetail(await fetchHtml(job.link, fetcher))
      Object.assign(job, detail, { description: detail.description || job.description })
      detailed += 1
      if (detailed % 100 === 0) console.log(`[acic] detalhes: ${detailed}/${retained.length}.`)
      if (delay) await sleep(delay)
    }
  })
  await Promise.all(workers)
  return { jobs: retained, fetchedCount: jobs.size, expectedTotal: total, pages, complete, cutoffDate }
}

export const saveAcicJobs = async (db, result, options = {}) => {
  const collectedAt = new Date().toISOString()
  const expirationRuns = number(options.expirationRuns ?? process.env.ACIC_EXPIRATION_RUNS, 3)
  if (result.fetchedCount === 0) return { ...result, jobs: undefined, count: 0, collectedAt, skipped: true }
  const rows = result.jobs.map((job) => ({
    ...job, id: `acic-${job.external_id}`, source: 'acic',
    created_at: collectedAt, collected_at: collectedAt, missing_runs: 0, expired_at: null,
  }))
  for (let offset = 0; offset < rows.length; offset += 100) {
    const { error } = await db.from('vacancies').upsert(rows.slice(offset, offset + 100), { onConflict: 'source,external_id' })
    if (error) throw new Error(`[acic] falha ao salvar vagas: ${error.message}`)
  }
  // A capped or inconsistent snapshot must never expire unseen jobs.
  if (result.complete) {
    const { error } = await db.from('vacancies').update({ expired_at: collectedAt, missing_runs: expirationRuns })
      .eq('source', 'acic').is('expired_at', null).lt('date', result.cutoffDate)
    if (error) throw new Error(`[acic] falha na retenção: ${error.message}`)
    const existing = []
    for (let offset = 0; ; offset += 1000) {
      const { data, error: selectError } = await db.from('vacancies').select('id, external_id, missing_runs')
        .eq('source', 'acic').is('expired_at', null).order('id').range(offset, offset + 999)
      if (selectError) throw new Error(`[acic] falha ao consultar vagas existentes: ${selectError.message}`)
      existing.push(...data)
      if (data.length < 1000) break
    }
    const current = new Set(result.jobs.map((job) => job.external_id))
    for (const job of existing) {
      if (current.has(job.external_id)) continue
      const missingRuns = (job.missing_runs || 0) + 1
      const { error: updateError } = await db.from('vacancies').update({ missing_runs: missingRuns, expired_at: missingRuns >= expirationRuns ? collectedAt : null }).eq('id', job.id)
      if (updateError) throw new Error(`[acic] falha ao atualizar vaga ausente: ${updateError.message}`)
    }
  }
  return { ...result, jobs: undefined, count: rows.length, collectedAt }
}

let running = false
export const ingestAcicJobs = async (options = {}) => {
  if (running) throw new Error('ACIC_ALREADY_RUNNING')
  running = true
  try {
    const result = await collectAcicJobs(options)
    if (options.dryRun) return { ...result, count: result.jobs.length, dryRun: true }
    const db = options.db || (await import('../db.js')).default
    return await saveAcicJobs(db, result, options)
  } finally {
    running = false
  }
}
