export const filterCompanies = (companies, query) => {
  const normalizedSearch = query.trim().toLowerCase()

  return companies.filter((company) => {
    const name = company.name.toLowerCase()

    return name.includes(normalizedSearch)
  })
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

const getLocalDateKey = (date) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  const parsedDate = new Date(date)
  if (!Number.isFinite(parsedDate.getTime())) {
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getTodayDateKey = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

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
  const isTodayFilter = vacancyFilters.sort === 'today'
  const todayDateKey = isTodayFilter ? getTodayDateKey() : ''

  const result = vacancies.filter((vacancy) => {
    const matchesKeyword =
      !normalizedKeyword ||
      vacancy.title.toLowerCase().includes(normalizedKeyword) ||
      vacancy.company.toLowerCase().includes(normalizedKeyword) ||
      vacancy.description.toLowerCase().includes(normalizedKeyword) ||
      vacancy.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))

    const matchesModality =
      !vacancyFilters.modality || vacancy.modality === vacancyFilters.modality

    const matchesArea = !normalizedArea || normalizeText(getVacancyArea(vacancy)) === normalizedArea
    const matchesDate =
      !isTodayFilter ||
      getLocalDateKey(vacancy.date) === todayDateKey

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
