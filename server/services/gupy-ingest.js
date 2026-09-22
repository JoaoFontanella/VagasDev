import db from '../db.js'

const GUPY_URL = 'https://portal.gupy.io/api/job-search/jobs'
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36'

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const getNumberEnv = (name, fallback, minimum) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value >= minimum ? value : fallback
}

const getConfig = (overrides = {}) => ({
  city: overrides.city || process.env.GUPY_CITY || 'Criciúma',
  state: overrides.state || process.env.GUPY_STATE || 'Santa Catarina',
  limit: getNumberEnv('GUPY_PAGE_LIMIT', overrides.limit || 12, 1),
  maxPages: getNumberEnv('GUPY_MAX_PAGES', overrides.maxPages || 10, 1),
  expirationRuns: getNumberEnv('GUPY_EXPIRATION_RUNS', overrides.expirationRuns || 3, 1),
  retries: getNumberEnv('GUPY_RETRIES', overrides.retries || 3, 1),
})

const buildUrl = ({ city, state, limit, offset }) => {
  const url = new URL(GUPY_URL)
  url.search = new URLSearchParams({
    city,
    state,
    limit: String(limit),
    offset: String(offset),
    sortBy: 'publishedDate',
    sortOrder: 'desc',
  })
  return url
}

const fetchPage = async (url, retries, isFirstRequest) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': process.env.GUPY_USER_AGENT || DEFAULT_USER_AGENT,
        },
        signal: AbortSignal.timeout(15000),
      })

      if (response.status === 403 || response.status === 429) {
        throw new Error(`GUPY_BLOCKED:${response.status}`)
      }

      if (!response.ok && response.status < 500) {
        throw new Error(`GUPY_HTTP:${response.status}`)
      }

      if (!response.ok) {
        throw new Error(`GUPY_RETRYABLE_HTTP:${response.status}`)
      }

      const rawBody = await response.text()
      if (isFirstRequest) {
        console.log(`[gupy] resposta bruta da primeira chamada: ${rawBody}`)
      }

      try {
        return JSON.parse(rawBody)
      } catch (error) {
        throw new Error(`GUPY_INVALID_JSON:${error.message}`)
      }
    } catch (error) {
      if (error.message.startsWith('GUPY_BLOCKED:')) {
        console.error(`[gupy] acesso bloqueado ou rate limited (status ${error.message.slice(13)}).`)
        throw error
      }

      const canRetry = attempt < retries && (
        error.message.startsWith('GUPY_RETRYABLE_HTTP:') ||
        error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error instanceof TypeError
      )

      if (!canRetry) {
        throw error
      }

      const delay = 2 ** (attempt - 1) * 1000
      console.warn(`[gupy] tentativa ${attempt}/${retries} falhou; nova tentativa em ${delay}ms.`)
      await sleep(delay)
    }
  }

  throw new Error('[gupy] falha inesperada ao buscar página.')
}

const normalizeWorkplaceType = (workplaceType) => ({
  remote: 'Remoto',
  hybrid: 'Hibrido',
  onsite: 'Presencial',
}[workplaceType] || workplaceType || '')

const parseJobs = (payload) => {
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error('[gupy] resposta sem o array data esperado.')
  }

  return payload.data.map((job) => {
    if (job.id === undefined || !job.name || !job.jobUrl) {
      throw new Error('[gupy] vaga sem id, name ou jobUrl; ingestão interrompida.')
    }

    return {
      external_id: String(job.id),
      title: job.name,
      company: job.careerPageName || 'Empresa não informada',
      company_logo_url: job.careerPageLogo || null,
      location: [job.city, job.state].filter(Boolean).join(', '),
      modality: normalizeWorkplaceType(job.workplaceType),
      description: job.description || '',
      link: job.jobUrl,
      date: job.publishedDate || new Date().toISOString().split('T')[0],
      published_at: job.publishedDate || null,
    }
  })
}

const saveJobs = async (jobs, collectedAt, expirationRuns) => {
  const rows = jobs.map((job) => ({
    id: `gupy-${job.external_id}`,
    ...job,
    tags: [],
    level: '',
    source: 'gupy',
    created_at: collectedAt,
    collected_at: collectedAt,
    missing_runs: 0,
    expired_at: null,
  }))

  const { error: upsertError } = await db
    .from('vacancies')
    .upsert(rows, { onConflict: 'source,external_id' })
  if (upsertError) {
    throw new Error(`[gupy] falha ao salvar vagas: ${upsertError.message}`)
  }

  const { data: existingJobs, error: selectError } = await db
    .from('vacancies')
    .select('id, external_id, missing_runs, expired_at')
    .eq('source', 'gupy')
    .is('expired_at', null)

  if (selectError) {
    throw new Error(`[gupy] falha ao consultar vagas antigas: ${selectError.message}`)
  }

  const currentIds = new Set(jobs.map((job) => job.external_id))
  for (const job of existingJobs || []) {
    if (currentIds.has(job.external_id)) {
      continue
    }

    const missingRuns = (job.missing_runs || 0) + 1
    const { error: updateError } = await db
      .from('vacancies')
      .update({
        missing_runs: missingRuns,
        expired_at: missingRuns >= expirationRuns ? collectedAt : null,
      })
      .eq('id', job.id)

    if (updateError) {
      throw new Error(`[gupy] falha ao expirar vaga: ${updateError.message}`)
    }
  }
}

export const ingestGupyJobs = async (overrides = {}) => {
  const config = getConfig(overrides)
  const jobs = []
  let offset = 0

  for (let page = 0; page < config.maxPages; page += 1) {
    const payload = await fetchPage(buildUrl({ ...config, offset }), config.retries, page === 0)
    const pageJobs = parseJobs(payload)
    jobs.push(...pageJobs)

    if (pageJobs.length === 0 || pageJobs.length < config.limit) {
      break
    }

    offset += config.limit
  }

  const collectedAt = new Date().toISOString()
  await saveJobs(jobs, collectedAt, config.expirationRuns)
  console.log(`[gupy] ingestão concluída: ${jobs.length} vagas salvas.`)
  return { count: jobs.length, collectedAt }
}
