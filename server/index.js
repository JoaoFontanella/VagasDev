import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import db from './db.js'
import { ingestGupyJobs } from './services/gupy-ingest.js'

const app = express()
const port = process.env.PORT || 8787
const adminToken = process.env.ADMIN_TOKEN || ''

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '')
const configuredOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://vagasdev.vercel.app',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.RENDER_EXTERNAL_URL,
  ...((process.env.ALLOWED_ORIGINS || '').split(',')),
]
  .filter(Boolean)
  .map(normalizeOrigin)
const allowedOrigins = new Set(
  configuredOrigins,
)

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : ''
      if (!origin || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true)
        return
      }

      console.error(`[cors] origem rejeitada: ${origin}`)
      callback(new Error('Origin not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-token'],
  }),
)
app.options(/.*/, cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? normalizeOrigin(origin) : ''
    if (!origin || allowedOrigins.has(normalizedOrigin)) {
      callback(null, true)
      return
    }

    console.error(`[cors] origem rejeitada: ${origin}`)
    callback(new Error('Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token'],
}))
app.use(express.json())

const mapVacancy = (row) => ({
  ...row,
  tags: Array.isArray(row.tags) ? row.tags : [],
})

const requireAdminWrite = (req, res, next) => {
  if (!adminToken) {
    res.status(403).json({ message: 'Modo somente leitura ativo no servidor.' })
    return
  }

  const requestToken = req.get('x-admin-token') || ''
  if (requestToken !== adminToken) {
    res.status(401).json({ message: 'Token admin invalido.' })
    return
  }

  next()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/companies', async (_req, res) => {
  const { data: companies, error } = await db
    .from('companies')
    .select('id, name, segment, site, careers, linkedin, notes')
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ message: 'Falha ao carregar empresas.', error: error.message })
    return
  }

  res.json(companies)
})

app.post('/api/companies', requireAdminWrite, async (req, res) => {
  const payload = req.body
  const name = (payload.name || '').trim()

  if (!name) {
    res.status(400).json({ message: 'Nome da empresa e obrigatorio.' })
    return
  }

  const company = {
    id: crypto.randomUUID(),
    name,
    segment: (payload.segment || '').trim(),
    site: (payload.site || '').trim(),
    careers: (payload.careers || '').trim(),
    linkedin: (payload.linkedin || '').trim(),
    notes: (payload.notes || '').trim(),
    created_at: new Date().toISOString(),
  }

  const { error } = await db.from('companies').insert(company)
  if (error) {
    res.status(500).json({ message: 'Falha ao criar empresa.', error: error.message })
    return
  }

  res.status(201).json(company)
})

app.put('/api/companies/:id', requireAdminWrite, async (req, res) => {
  const payload = req.body
  const name = (payload.name || '').trim()

  if (!name) {
    res.status(400).json({ message: 'Nome da empresa e obrigatorio.' })
    return
  }

  const company = {
    id: req.params.id,
    name,
    segment: (payload.segment || '').trim(),
    site: (payload.site || '').trim(),
    careers: (payload.careers || '').trim(),
    linkedin: (payload.linkedin || '').trim(),
    notes: (payload.notes || '').trim(),
  }

  const { data, error } = await db
    .from('companies')
    .update(company)
    .eq('id', company.id)
    .select()
    .maybeSingle()

  if (error) {
    res.status(500).json({ message: 'Falha ao atualizar empresa.', error: error.message })
    return
  }

  if (!data) {
    res.status(404).json({ message: 'Empresa nao encontrada.' })
    return
  }

  res.json(company)
})

app.delete('/api/companies/:id', requireAdminWrite, async (req, res) => {
  const { data, error } = await db
    .from('companies')
    .delete()
    .eq('id', req.params.id)
    .select('id')

  if (error) {
    res.status(500).json({ message: 'Falha ao excluir empresa.', error: error.message })
    return
  }

  if (!data || data.length === 0) {
    res.status(404).json({ message: 'Empresa nao encontrada.' })
    return
  }

  res.status(204).send()
})

app.get('/api/vacancies', async (_req, res) => {
  const { data, error } = await db
    .from('vacancies')
    .select('id, title, company, company_logo_url, location, modality, level, description, link, date, tags')
    .is('expired_at', null)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ message: 'Falha ao carregar vagas.', error: error.message })
    return
  }

  res.json((data || []).map(mapVacancy))
})

app.post('/api/vacancies', requireAdminWrite, async (req, res) => {
  const payload = req.body
  const title = (payload.title || '').trim()
  const company = (payload.company || '').trim()
  const link = (payload.link || '').trim()

  if (!title || !company || !link) {
    res.status(400).json({ message: 'Cargo, empresa e link da vaga sao obrigatorios.' })
    return
  }

  const vacancy = {
    id: crypto.randomUUID(),
    title,
    company,
    company_logo_url: (payload.company_logo_url || '').trim() || null,
    location: (payload.location || '').trim(),
    modality: (payload.modality || '').trim(),
    level: (payload.level || '').trim(),
    description: (payload.description || '').trim(),
    link,
    date: payload.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    created_at: new Date().toISOString(),
  }

  const { error } = await db.from('vacancies').insert(vacancy)
  if (error) {
    res.status(500).json({ message: 'Falha ao criar vaga.', error: error.message })
    return
  }

  res.status(201).json({
    ...vacancy,
  })
})

let gupyIngestRunning = false

app.post('/api/admin/ingest/gupy', requireAdminWrite, async (_req, res) => {
  if (gupyIngestRunning) {
    res.status(409).json({ message: 'A ingestao da Gupy ja esta em andamento.' })
    return
  }

  gupyIngestRunning = true
  try {
    const result = await ingestGupyJobs()
    res.json(result)
  } catch (error) {
    console.error('[gupy] ingestão falhou:', error)
    res.status(502).json({ message: 'Falha na ingestao da Gupy.', error: error.message })
  } finally {
    gupyIngestRunning = false
  }
})

const distPath = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get('/{*any}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)

  if (process.env.GUPY_INGEST_ENABLED === 'true') {
    const intervalHours = Number(process.env.GUPY_INTERVAL_HOURS || 6)
    const intervalMs = (Number.isFinite(intervalHours) ? intervalHours : 6) * 60 * 60 * 1000
    const runIngest = async () => {
      if (gupyIngestRunning) {
        console.warn('[gupy] execução ignorada porque outra ingestão está em andamento.')
        return
      }

      gupyIngestRunning = true
      try {
        await ingestGupyJobs()
      } catch (error) {
        console.error('[gupy] ingestão agendada falhou:', error)
      } finally {
        gupyIngestRunning = false
      }
    }

    void runIngest()
    setInterval(() => void runIngest(), intervalMs)
    console.log(`[gupy] agendamento habilitado a cada ${intervalHours}h.`)
  }
})
