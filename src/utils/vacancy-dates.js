const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
})

export const getTodayDateKey = (now = new Date()) => {
  const parts = formatter.formatToParts(now)
  const part = (type) => parts.find((item) => item.type === type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export const getVacancyDateKey = (vacancy) => {
  const value = vacancy.date
  if (typeof value !== 'string') return ''
  // ACIC supplies a calendar date, not a publication time. Never shift that day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) || vacancy.source === 'acic') {
    const key = value.slice(0, 10)
    const parsed = new Date(`${key}T12:00:00Z`)
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === key ? key : ''
  }
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? getTodayDateKey(parsed) : ''
}

export const getVacancyCounts = (vacancies, now = new Date()) => {
  const today = getTodayDateKey(now)
  const start = new Date(`${today}T12:00:00Z`)
  start.setUTCDate(start.getUTCDate() - 6)
  const firstDay = start.toISOString().slice(0, 10)
  return vacancies.reduce((counts, vacancy) => {
    const day = getVacancyDateKey(vacancy)
    if (day === today) counts.today += 1
    if (day && day >= firstDay && day <= today) counts.recent += 1
    return counts
  }, { active: vacancies.length, recent: 0, today: 0 })
}

export const formatVacancyDate = (vacancy) => {
  const day = getVacancyDateKey(vacancy)
  return day ? day.split('-').reverse().join('/') : 'Data não informada'
}
