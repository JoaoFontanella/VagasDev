import 'dotenv/config'
import { ingestAcicJobs } from '../server/services/acic-ingest.js'

try {
  const result = await ingestAcicJobs({ dryRun: process.argv.includes('--dry-run') })
  console.log(JSON.stringify({ ...result, jobs: result.jobs?.slice(0, 3) }, null, 2))
} catch (error) {
  console.error('[acic] coleta falhou:', error.message)
  process.exitCode = 1
}
