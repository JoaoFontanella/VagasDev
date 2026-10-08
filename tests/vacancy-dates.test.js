import test from 'node:test'
import assert from 'node:assert/strict'
import { getTodayDateKey, getVacancyDateKey, getVacancyCounts, formatVacancyDate } from '../src/utils/vacancy-dates.js'
import { filterVacancies } from '../src/utils/filters.js'
const now = new Date('2026-10-08T01:00:00Z') // Still October 7 in Brasília.
const job = (id, source, date) => ({ id, source, date, title: 'Teste', company: 'Empresa', description: '', tags: [], modality: 'Presencial' })
const jobs = [
  job(1, 'acic', '2026-10-07'),
  job(2, 'acic', '2026-10-07T00:00:00Z'),
  job(3, 'acic', '2026-10-06'),
  job(4, 'gupy', '2026-10-08T01:00:00Z'),
  job(5, 'gupy', '2026-10-07T01:00:00Z'),
  job(6, 'acic', '2026-10-08'),
]

test('today follows Brasília even when UTC has changed days', () => {
  assert.equal(getTodayDateKey(now), '2026-10-07')
})
test('ACIC calendar dates never shift to the previous day', () => {
  assert.equal(getVacancyDateKey(jobs[0]), '2026-10-07')
  assert.equal(getVacancyDateKey(jobs[1]), '2026-10-07')
  assert.equal(getVacancyDateKey(jobs[4]), '2026-10-06')
  assert.equal(getVacancyDateKey(job(7, 'acic', '2026-02-30')), '')
})
test('today count and today filter agree for each tab', () => {
  for (const source of ['all', 'acic', 'gupy']) {
    const rows = source === 'all' ? jobs : jobs.filter((item) => item.source === source)
    const filtered = filterVacancies(rows, { keyword: '', modality: '', area: '', sort: 'today' }, now)
    assert.equal(filtered.length, getVacancyCounts(rows, now).today)
    assert.deepEqual(filtered.map((item) => item.id).sort(), source === 'acic' ? [1, 2] : source === 'gupy' ? [4] : [1, 2, 4])
  }
})
test('seven-day count excludes future dates and dates outside the calendar window', () => {
  const rows = [...jobs, job(7, 'acic', '2026-09-30'), job(8, 'acic', '2026-10-01')]
  assert.equal(getVacancyCounts(rows, now).recent, 6)
})

test('card displays the same calendar day used by the ACIC today filter', () => {
  assert.equal(formatVacancyDate(jobs[0]), '07/10/2026')
  assert.equal(formatVacancyDate(jobs[1]), '07/10/2026')
  assert.equal(formatVacancyDate(jobs[4]), '06/10/2026')
  assert.equal(formatVacancyDate(job(9, 'acic', 'invalid')), 'Data não informada')
})
