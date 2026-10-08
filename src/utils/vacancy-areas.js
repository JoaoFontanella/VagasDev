export const normalizeAreaText = (value = '') => String(value).normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Specific job functions win over incidental requirements or the employer's sector.
const rules = [
  ['Tecnologia', ['engenheiro de software', 'engenharia de software', 'analista de sistemas', 'analista de ti', 'assistente de ti', 'analista de t i', 'assistente de t i', 'analista de suporte', 'rpa', 'bi e dados', 'ti', 'analista de dados', 'cientista de dados', 'suporte tecnico', 'suporte de ti', 'suporte ti', 'help desk', 'service desk', 'desenvolvedor', 'desenvolvedora', 'programador', 'programadora', 'software', 'frontend', 'backend', 'full stack', 'devops', 'infraestrutura de ti', 'tecnologia da informacao', 'informatica', 'qa', 'ux', 'ui']],
  ['Marketing e Design', ['comunicacao visual', 'social media', 'marketing', 'markerting', 'designer', 'design', 'copywriter', 'publicidade', 'publicitario', 'branding', 'merchandising', 'eventos', 'estilista', 'fotografo', 'videomaker']],
  ['Vendas e Comercial', ['representante comercial', 'executivo de contas', 'consultor comercial', 'agente de negocios', 'e commerce', 'marketplace', 'consultor de vendas', 'pre vendedor', 'vendedor', 'vendedora', 'vendas', 'comercial', 'televendas', 'sdr', 'bdr', 'sales', 'balconista', 'promotor de vendas']],
  ['Atendimento e Varejo', ['operador de caixa', 'operadora de caixa', 'fiscal de caixa', 'frente de caixa', 'fiscal de loja', 'servicos de loja', 'sucesso do cliente', 'customer success', 'atendimento ao cliente', 'atendimento ao publico', 'sac', 'atendente', 'atendimento', 'recepcionista', 'recepcao', 'frentista', 'repositor', 'repositora', 'empacotador', 'empacotadora', 'caixa']],
  ['Administrativo', ['auxiliar administrativo', 'assistente administrativo', 'analista administrativo', 'administrativo', 'administrativa', 'administracao', 'secretaria', 'secretario', 'auxiliar de escritorio']],
  ['Financeiro e Contabilidade', ['contas a receber', 'contas a pagar', 'departamento contabil', 'analista fiscal', 'auxiliar fiscal', 'assistente fiscal', 'financeiro', 'financeira', 'contabil', 'contabilidade', 'contador', 'contadora', 'faturamento', 'cobranca', 'tesouraria', 'controladoria', 'auditoria', 'auditorias']],
  ['Recursos Humanos', ['recursos humanos', 'departamento pessoal', 'folha de pagamento', 'recrutamento', 'gestao de pessoas', 'rh', 'dp', 'people']],
  ['Logística e Transporte', ['almoxarifado', 'almoxarife', 'estoquista', 'estoque', 'expedicao', 'logistica', 'motorista', 'motoboy', 'entregador', 'transporte', 'empilhadeira', 'carga e descarga', 'armazenagem', 'deposito', 'expedidor']],
  ['Compras e Suprimentos', ['comprador', 'compradora', 'compras', 'suprimentos', 'supply chain', 'importacao', 'sourcing']],
  ['Produção e Indústria', ['operador de producao', 'auxiliar de producao', 'producao', 'industrial', 'operador de maquina', 'operador de maquinas', 'costureira', 'costureiro', 'passadeira', 'confeccao', 'auxiliar de corte', 'cortador', 'torneiro', 'soldador', 'serigrafia', 'embalador', 'metalurgica', 'qualidade textil', 'conferente de corte']],
  ['Manutenção e Instalação', ['manutencao', 'mecanico', 'mecanica', 'eletricista', 'eletro eletronica', 'eletroeletronica', 'eletromecanico', 'instalador', 'instaladora', 'montador', 'montadora', 'refrigeracao', 'automotivo', 'aplicador peliculas']],
  ['Engenharia e Construção', ['mestre de obras', 'tecnico de obras', 'engenheiro', 'engenheira', 'engenharia', 'construcao', 'pedreiro', 'servente de obras', 'servente', 'seguranca do trabalho', 'carpinteiro', 'arquiteto', 'arquitetura', 'topografia', 'impermeabilizante', 'maquinas pesadas']],
  ['Saúde', ['enfermagem', 'enfermeiro', 'enfermeira', 'farmaceutico', 'farmaceutica', 'fisioterapeuta', 'odontologia', 'dentista', 'medico', 'medica', 'nutricionista', 'instrumentador', 'instrumentadora', 'veterinario', 'veterinaria', 'psicologo', 'psicologa']],
  ['Educação', ['professor', 'professora', 'instrutor', 'instrutora', 'pedagogia', 'pedagogo', 'pedagoga', 'educador', 'educadora', 'docente']],
  ['Jurídico', ['advogado', 'advogada', 'juridico', 'juridica', 'direito', 'cartorio', 'paralegal']],
  ['Alimentação e Hotelaria', ['cozinheiro', 'cozinheira', 'auxiliar de cozinha', 'garcom', 'garconete', 'confeiteiro', 'confeiteira', 'padeiro', 'padeira', 'copeira', 'copeiro', 'camareira', 'camareiro', 'hotelaria', 'gastronomia', 'confeitaria', 'acougue', 'acougueiro', 'churrasqueiro', 'pizzaiolo']],
  ['Serviços Gerais e Segurança', ['servicos gerais', 'limpeza', 'higienizacao', 'zelador', 'zeladora', 'porteiro', 'portaria', 'vigilante', 'seguranca patrimonial', 'jardineiro', 'jardinagem', 'faxineiro', 'faxineira', 'higienizador', 'vigia', 'monitor de sistema eletronico de seguranca']],
]

export const vacancyAreas = [...rules.map(([label]) => label), 'Outras áreas']
const aliases = {
  tecnologia: 'Tecnologia', 'tecnologia da informacao': 'Tecnologia', 'informatica': 'Tecnologia', 'telecomunicacoes': 'Tecnologia',
  marketing: 'Marketing e Design', comunicacao: 'Marketing e Design', design: 'Marketing e Design',
  vendas: 'Vendas e Comercial', comercial: 'Vendas e Comercial', varejo: 'Atendimento e Varejo', atendimento: 'Atendimento e Varejo',
  administracao: 'Administrativo', financeiro: 'Financeiro e Contabilidade', financas: 'Financeiro e Contabilidade', 'contabilidade e auditoria': 'Financeiro e Contabilidade',
  'medicina e saude': 'Saúde', 'recursos humanos': 'Recursos Humanos', transporte: 'Logística e Transporte', logistica: 'Logística e Transporte',
  industrial: 'Produção e Indústria', confeccao: 'Produção e Indústria', operacoes: 'Produção e Indústria', engenharia: 'Engenharia e Construção',
  direito: 'Jurídico', educacao: 'Educação',
}
const knownArea = (value) => {
  const normalized = normalizeAreaText(value)
  return vacancyAreas.find((label) => normalizeAreaText(label) === normalized) || aliases[normalized] || ''
}
const classify = (value) => {
  const text = ` ${normalizeAreaText(value)} `
  let winner = ''
  let best = 0
  for (const [label, terms] of rules) {
    const matches = terms.filter((term) => text.includes(` ${term} `))
    // Long phrases beat generic words; single short acronyms must match whole tokens.
    const genericPenalty = ['Administrativo', 'Atendimento e Varejo'].includes(label) ? 3 : 0
    const score = matches.length ? Math.max(...matches.map((term) => term.split(' ').length * 10)) + Math.min(matches.length, 3) - genericPenalty : 0
    if (score > best) { winner = label; best = score }
  }
  return winner
}

export const getVacancyArea = (vacancy) => {
  const explicit = knownArea(vacancy.area)
  if (explicit && explicit !== 'Outras áreas') return explicit
  const title = normalizeAreaText(vacancy.title)
  if (/^(instrutor|instrutora|professor|professora|docente)\b/.test(title)) return 'Educação'
  if (/^(instalador|instaladora|montador|montadora|mecanico|eletricista)\b/.test(title)) return 'Manutenção e Instalação'
  const titleArea = classify(vacancy.title)
  if (titleArea) return titleArea
  const tags = Array.isArray(vacancy.tags) ? vacancy.tags : []
  const sourceArea = tags.map(knownArea).find((area) => area && area !== 'Outras áreas')
  if (sourceArea) return sourceArea
  // Do not infer a profession from company slogans, perks or generic skill lists.
  const description = String(vacancy.description || '')
  const stated = description.match(/(?:area de atuacao|área de atuação)\s*:\s*([^\n]+)/i)?.[1]
  return knownArea(stated) || 'Outras áreas'
}

export const getAreaCounts = (vacancies) => vacancies.reduce((counts, vacancy) => {
  const area = getVacancyArea(vacancy)
  counts[area] = (counts[area] || 0) + 1
  return counts
}, {})
