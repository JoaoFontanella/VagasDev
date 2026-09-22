import 'dotenv/config'
import { ingestGupyJobs } from '../server/services/gupy-ingest.js'

try {
  await ingestGupyJobs()
} catch (error) {
  console.error('[gupy] ingestão falhou:', error)
  process.exitCode = 1
}
