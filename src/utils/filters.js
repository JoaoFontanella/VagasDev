import { getVacancyArea, normalizeAreaText } from './vacancy-areas.js'
export { getVacancyArea } from './vacancy-areas.js'
import { getTodayDateKey, getVacancyDateKey } from './vacancy-dates.js'

export const filterCompanies = (companies, query) => {
  const normalizedSearch = query.trim().toLowerCase()

  return companies.filter((company) => {
    const name = company.name.toLowerCase()

    return name.includes(normalizedSearch)
  })
}

export const filterVacancies = (vacancies, vacancyFilters, now = new Date()) => {
  const normalizedKeyword = vacancyFilters.keyword.trim().toLowerCase()
  const normalizedArea = normalizeAreaText(vacancyFilters.area)
  const isTodayFilter = vacancyFilters.sort === 'today'
  const todayDateKey = isTodayFilter ? getTodayDateKey(now) : ''

  const result = vacancies.filter((vacancy) => {
    const matchesKeyword =
      !normalizedKeyword ||
      vacancy.title.toLowerCase().includes(normalizedKeyword) ||
      vacancy.company.toLowerCase().includes(normalizedKeyword) ||
      vacancy.description.toLowerCase().includes(normalizedKeyword) ||
      vacancy.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))

    const matchesModality =
      !vacancyFilters.modality || vacancy.modality === vacancyFilters.modality

    const matchesArea = !normalizedArea || normalizeAreaText(getVacancyArea(vacancy)) === normalizedArea
    const matchesDate =
      !isTodayFilter ||
      getVacancyDateKey(vacancy) === todayDateKey

    return (
      matchesKeyword &&
      matchesModality &&
      matchesArea &&
      matchesDate
    )
  })

  result.sort((a, b) => {
    const firstDate = new Date(a.date).getTime()
    const secondDate = new Date(b.date).getTime()

    if (vacancyFilters.sort === 'oldest') {
      return firstDate - secondDate
    }

    return secondDate - firstDate
  })

  return result
}
