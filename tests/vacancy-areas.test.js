import test from 'node:test'
import assert from 'node:assert/strict'
import { getVacancyArea, getAreaCounts, vacancyAreas } from '../src/utils/vacancy-areas.js'
import { filterVacancies } from '../src/utils/filters.js'

const job = (title, tags = [], description = '') => ({ title, tags, description, company: 'Empresa', date: '2026-10-07', source: 'acic', modality: 'Presencial' })
const examples = [
  ['Auxiliar de Limpeza Também para PCD', ['Industrial'], 'Serviços Gerais e Segurança'],
  ['Auxiliar de Almoxarifado', ['Telecomunicações'], 'Logística e Transporte'],
  ['ASSISTENTE FINANCEIRO – CONTAS A PAGAR', ['Administração'], 'Financeiro e Contabilidade'],
  ['Auxiliar Administrativo - Contas a Receber', ['Administração'], 'Financeiro e Contabilidade'],
  ['AUXILIAR DE RH', ['Industrial'], 'Recursos Humanos'],
  ['Assistente Administrativo e de Recursos Humanos', [], 'Recursos Humanos'],
  ['Comprador(a) Internacional', ['Comercial'], 'Compras e Suprimentos'],
  ['TISCOSKI - Vendedor Externo Farma', [], 'Vendas e Comercial'],
  ['TÉCNICO DE ENFERMAGEM - PRONTO ATENDIMENTO', ['Medicina e Saúde'], 'Saúde'],
  ['INSTRUTOR (A) CURSOS DE INFORMÁTICA E DESIGNER', [], 'Educação'],
  ['Instalador de Comunicação Visual', ['Industrial'], 'Manutenção e Instalação'],
  ['MECÂNICO ELETRICISTA', ['Confecção'], 'Manutenção e Instalação'],
  ['Engenheiro de Software', [], 'Tecnologia'],
  ['Engenheiro Civil', [], 'Engenharia e Construção'],
  ['VAGA DE ESTÁGIO | CARTÓRIO CRICIÚMA', ['Direito'], 'Jurídico'],
  ['Costureira Piloteira', [], 'Produção e Indústria'],
  ['Operadora de Caixa', ['Comercial'], 'Atendimento e Varejo'],
  ['Auxiliar de Cozinha', [], 'Alimentação e Hotelaria'],
  ['Analista de Marketing', [], 'Marketing e Design'],
  ['Banco de Talentos', [], 'Outras áreas'],
]
for (const [title, tags, expected] of examples) {
  test(`classifies the function: ${title}`, () => assert.equal(getVacancyArea(job(title, tags)), expected))
}

test('incidental requirements and short substrings cannot turn an administrative role into IT or HR', () => {
  assert.equal(getVacancyArea(job('Assistente Administrativo', [], 'Conhecimento de sistemas, dados, Office, qualidade e RH.')), 'Administrativo')
  assert.equal(getVacancyArea(job('Cargo a definir', [], 'Dados no sistema de qualidade.')), 'Outras áreas')
})
test('normalizes explicit source areas and accents', () => {
  assert.equal(getVacancyArea({ ...job('Cargo a definir'), area: 'Finanças' }), 'Financeiro e Contabilidade')
  assert.equal(getVacancyArea(job('Cargo a definir', ['Medicina e Saúde'])), 'Saúde')
})
test('each vacancy belongs to one offered area and counts match filtered results', () => {
  const rows = examples.map(([title, tags]) => job(title, tags))
  const counts = getAreaCounts(rows)
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), rows.length)
  for (const area of vacancyAreas) {
    const filtered = filterVacancies(rows, { keyword: '', modality: '', area, sort: 'recent' })
    assert.equal(filtered.length, counts[area] || 0)
  }
})
