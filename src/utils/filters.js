export const filterCompanies = (companies, query) => {
  const normalizedSearch = query.trim().toLowerCase()

  return companies.filter((company) => {
    const name = company.name.toLowerCase()

    return name.includes(normalizedSearch)
  })
}

export const getCompanyFilterOptions = (companies, vacancies) => {
  const options = new Set()
  companies.forEach((company) => options.add(company.name))
  vacancies.forEach((vacancy) => {
    if (vacancy.company) {
      options.add(vacancy.company)
    }
  })

  return [...options].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export const filterVacancies = (vacancies, vacancyFilters) => {
  const normalizedKeyword = vacancyFilters.keyword.trim().toLowerCase()
  const normalizedLocation = vacancyFilters.location.trim().toLowerCase()

  const result = vacancies.filter((vacancy) => {
    const matchesKeyword =
      !normalizedKeyword ||
      vacancy.title.toLowerCase().includes(normalizedKeyword) ||
      vacancy.company.toLowerCase().includes(normalizedKeyword) ||
      vacancy.description.toLowerCase().includes(normalizedKeyword) ||
      vacancy.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))

    const matchesCompany =
      !vacancyFilters.company || vacancy.company === vacancyFilters.company

    const matchesModality =
      !vacancyFilters.modality || vacancy.modality === vacancyFilters.modality

    const matchesLevel = !vacancyFilters.level || vacancy.level === vacancyFilters.level

    const matchesLocation =
      !normalizedLocation || vacancy.location.toLowerCase().includes(normalizedLocation)

    return (
      matchesKeyword &&
      matchesCompany &&
      matchesModality &&
      matchesLevel &&
      matchesLocation
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
