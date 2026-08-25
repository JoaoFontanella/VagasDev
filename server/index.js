import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import db from './db.js'

const app = express()
const port = process.env.PORT || 8787
const adminToken = process.env.ADMIN_TOKEN || ''
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
    ...((process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)),
  ].filter(Boolean),
)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-token'],
  }),
)
app.options(/.*/, cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token'],
}))
app.use(express.json())

const mapVacancy = (row) => ({
  ...row,
  tags: row.tags ? JSON.parse(row.tags) : [],
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

app.get('/api/companies', (_req, res) => {
  const companies = db
    .prepare('SELECT id, name, logo, segment, site, careers, linkedin, notes FROM companies ORDER BY created_at DESC')
    .all()

  res.json(companies)
})

app.post('/api/companies', requireAdminWrite, (req, res) => {
  const payload = req.body
  const name = (payload.name || '').trim()

  if (!name) {
    res.status(400).json({ message: 'Nome da empresa e obrigatorio.' })
    return
  }

  const company = {
    id: crypto.randomUUID(),
    name,
    logo: (payload.logo || '').trim(),
    segment: (payload.segment || '').trim(),
    site: (payload.site || '').trim(),
    careers: (payload.careers || '').trim(),
    linkedin: (payload.linkedin || '').trim(),
    notes: (payload.notes || '').trim(),
    created_at: new Date().toISOString(),
  }

  db.prepare(
    `INSERT INTO companies (id, name, logo, segment, site, careers, linkedin, notes, created_at)
     VALUES (@id, @name, @logo, @segment, @site, @careers, @linkedin, @notes, @created_at)`,
  ).run(company)

  res.status(201).json(company)
})

app.put('/api/companies/:id', requireAdminWrite, (req, res) => {
  const payload = req.body
  const name = (payload.name || '').trim()

  if (!name) {
    res.status(400).json({ message: 'Nome da empresa e obrigatorio.' })
    return
  }

  const company = {
    id: req.params.id,
    name,
    logo: (payload.logo || '').trim(),
    segment: (payload.segment || '').trim(),
    site: (payload.site || '').trim(),
    careers: (payload.careers || '').trim(),
    linkedin: (payload.linkedin || '').trim(),
    notes: (payload.notes || '').trim(),
  }

  const result = db.prepare(
    `UPDATE companies
     SET name = @name,
         logo = @logo,
         segment = @segment,
         site = @site,
         careers = @careers,
         linkedin = @linkedin,
         notes = @notes
     WHERE id = @id`,
  ).run(company)

  if (result.changes === 0) {
    res.status(404).json({ message: 'Empresa nao encontrada.' })
    return
  }

  res.json(company)
})

app.delete('/api/companies/:id', requireAdminWrite, (req, res) => {
  const result = db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id)

  if (result.changes === 0) {
    res.status(404).json({ message: 'Empresa nao encontrada.' })
    return
  }

  res.status(204).send()
})

app.get('/api/vacancies', (_req, res) => {
  const vacancies = db
    .prepare(
      'SELECT id, title, company, location, modality, level, description, link, date, tags FROM vacancies ORDER BY date DESC, created_at DESC',
    )
    .all()
    .map(mapVacancy)

  res.json(vacancies)
})

app.post('/api/vacancies', requireAdminWrite, (req, res) => {
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
    location: (payload.location || '').trim(),
    modality: (payload.modality || '').trim(),
    level: (payload.level || '').trim(),
    description: (payload.description || '').trim(),
    link,
    date: payload.date || new Date().toISOString().split('T')[0],
    tags: JSON.stringify(Array.isArray(payload.tags) ? payload.tags : []),
    created_at: new Date().toISOString(),
  }

  db.prepare(
    `INSERT INTO vacancies (id, title, company, location, modality, level, description, link, date, tags, created_at)
     VALUES (@id, @title, @company, @location, @modality, @level, @description, @link, @date, @tags, @created_at)`,
  ).run(vacancy)

  res.status(201).json({
    ...vacancy,
    tags: JSON.parse(vacancy.tags),
  })
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
})
