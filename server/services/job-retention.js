const getNumberEnv = (name, fallback, minimum) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value >= minimum ? value : fallback
}

export const getRetentionMonths = (overrides = {}) =>
  getNumberEnv(
    'JOB_RETENTION_MONTHS',
    overrides.retentionMonths || 2,
    1,
  )

export const getJobCutoffDate = (overrides = {}) => {
  const retentionMonths = getRetentionMonths(overrides)
  const cutoff = new Date()
  cutoff.setDate(1)
  cutoff.setMonth(cutoff.getMonth() - retentionMonths + 1)
  return cutoff.toISOString().slice(0, 10)
}
