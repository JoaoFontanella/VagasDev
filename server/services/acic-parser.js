import { load } from 'cheerio'

export const ACIC_ORIGIN = 'https://www.rededetalentos.com.br'
const clean = (text) => text.replace(/\s+/g, ' ').trim()
const text = ($, element) => {
  const copy = $(element).clone()
  copy.find('br').replaceWith('\n')
  copy.find('li, tr').append('\n')
  copy.find('script, style, svg').remove()
  return copy.text().replace(/[^\S\n]+/g, ' ').replace(/\n\s*\n/g, '\n').trim()
}
export const safeAcicUrl = (href, pageUrl) => {
  const url = new URL(href, pageUrl)
  if (url.origin !== ACIC_ORIGIN || !/^\/vagas(?:\/|$)/.test(url.pathname)) {
    throw new Error('[acic] link fora da origem de vagas autorizada.')
  }
  return url.href
}

export const parseAcicPage = (html, pageUrl) => {
  const $ = load(html)
  const totalText = $('.s-searchUser__header h2').text() || $('h2').filter((_, el) => /vagas? encontrad/.test($(el).text())).text()
  const totalMatch = totalText.match(/([\d.]+)\s+vagas? encontrad/)
  if (!totalMatch) throw new Error('[acic] página sem contador de vagas; estrutura inesperada.')
  const total = Number(totalMatch[1].replaceAll('.', ''))
  const jobs = $('.c-cardJobMaster').map((_, el) => {
    const card = $(el)
    const heading = card.find('.c-cardJobMaster__title h3').clone()
    heading.find('.num').remove()
    const title = clean(heading.text())
    const href = card.find('a.btn_1[href]').attr('href')
    const code = card.find('.c-cardJobMaster__code').text()
    const id = code.match(/Cód\.?\s*(\d+)/i)?.[1]
    const dateMatch = code.match(/Cadastro em\s*(\d{2})\/(\d{2})\/(\d{4})/i)
    if (!id || !title || !href || !dateMatch) throw new Error('[acic] vaga sem título, código, link ou data.')
    const date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
    if (!Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('[acic] data inválida.')
    const link = safeAcicUrl(href, pageUrl)
    if (!link.endsWith(`/${id}`)) throw new Error('[acic] código da vaga diverge do link.')
    const topics = text($, card.find('.c-cardJobMaster__topics'))
    return {
      external_id: id, title,
      company: clean(card.find('.c-cardJobMaster__company').text()) || 'Empresa não informada (ACIC)',
      company_logo_url: null,
      location: clean(card.find('.c-cardJobMaster__places p').text()),
      description: [text($, card.find('.c-cardJobMaster__description')), topics].filter(Boolean).join('\n\n'),
      modality: '', level: '', tags: [], link, date, published_at: null,
    }
  }).get()
  if (total > 0 && jobs.length === 0) throw new Error('[acic] contador indica vagas mas nenhum cartão foi encontrado.')
  const nextHref = $('.c-pagination__next:not(.is-disabled)').attr('href')
  return { jobs, total, next: nextHref ? safeAcicUrl(nextHref, pageUrl) : null }
}

export const parseAcicDetail = (html) => {
  const $ = load(html)
  if (!$('.s-userPage__title h1').length) throw new Error('[acic] página de detalhe inválida.')
  const fields = new Map()
  $('.s-userPage__description > ul > li').each((_, el) => {
    fields.set(clean($(el).find('h3').first().text()).replace(/:\s*$/, '').toLowerCase(), text($, $(el).find('p, .c-listBenefits').first()))
  })
  const raw = fields.get('formato') || ''
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const modality = normalized.includes('hibrid') ? 'Hibrido' : /remot|home office/.test(normalized) ? 'Remoto' : normalized.includes('presencial') ? 'Presencial' : ''
  const tags = [fields.get('área de atuação'), fields.get('tipo de contrato')].filter(Boolean)
  const description = [...fields].map(([label, value]) => value ? `${label}: ${value}` : '').filter(Boolean).join('\n\n')
  return { modality, tags, description }
}
