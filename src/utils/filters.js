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

const areaKeywords = {
  Tecnologia: ['tecnologia', 'software', 'desenvolvedor', 'desenvolvimento', 'programador', 'sistema', 'dados', 'cloud', 'produto digital', 'qa', 'devops', 'frontend', 'backend'],
  Marketing: ['marketing', 'comunicacao', 'publicidade', 'conteudo', 'social media', 'branding', 'seo'],
  Vendas: ['vendas', 'comercial', 'business development', 'account executive', 'sales', 'representante'],
  Administrativo: ['administrativo', 'administracao', 'secretaria', 'assistente', 'recepcionista', 'office'],
  Financeiro: ['financeiro', 'financas', 'contabil', 'contabilidade', 'controladoria', 'fiscal', 'tesouraria'],
  'Recursos Humanos': ['recursos humanos', 'rh', 'people', 'recrutamento', 'selecao', 'talentos', 'dp'],
  Operacoes: ['operacoes', 'logistica', 'compras', 'suprimentos', 'estoque', 'atendimento', 'producao'],
  Engenharia: ['engenharia', 'engenheiro', 'civil', 'mecanica', 'eletrica', 'processos'],
}

const normalizeText = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const getVacancyArea = (vacancy) => {
  if (vacancy.area) {
    return vacancy.area
  }

  const text = normalizeText([
    vacancy.title,
    vacancy.description,
    ...(Array.isArray(vacancy.tags) ? vacancy.tags : []),
  ]
    .filter(Boolean)
    .join(' '))

  return Object.entries(areaKeywords).find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword)),
  )?.[0] || ''
}

export const filterVacancies = (vacancies, vacancyFilters) => {
  const normalizedKeyword = vacancyFilters.keyword.trim().toLowerCase()
  const normalizedArea = vacancyFilters.area.trim().toLowerCase()

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

    const matchesArea = !normalizedArea || normalizeText(getVacancyArea(vacancy)) === normalizedArea

    return (
      matchesKeyword &&
      matchesCompany &&
      matchesModality &&
      matchesArea
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
