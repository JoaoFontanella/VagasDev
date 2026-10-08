import { useEffect, useMemo, useState } from 'react'
import AppHeader from './components/layout/AppHeader'
import VacancyModal from './components/modals/VacancyModal'
import VacanciesPage from './components/vacancies/VacanciesPage'
import { createInitialVacancyForm } from './constants/forms'
import { apiRequest } from './services/api'
import { filterVacancies } from './utils/filters'
import { getAreaCounts } from './utils/vacancy-areas'
import { getVacancyCounts } from './utils/vacancy-dates'
import './App.css'

const initialVacancyFilters = {
  keyword: '',
  modality: '',
  area: '',
  sort: 'recent',
}

const sourceTitles = {
  all: 'Seu próximo capítulo começa aqui.',
  gupy: 'Um novo caminho. Uma vaga na Gupy.',
  acic: 'Grandes oportunidades. Perto de você.',
}

const sourceDescriptions = {
  all: 'Pesquise, compare e encontre seu próximo movimento profissional.',
  gupy: 'Explore vagas publicadas na Gupy e encontre oportunidades para seu próximo passo profissional.',
  acic: 'Encontre oportunidades em Criciúma na Rede de Talentos da ACIC e candidate-se pelo anúncio oficial.',
}

function App() {
  const canManage = import.meta.env.VITE_ENABLE_ADMIN === 'true'
  const adminToken = import.meta.env.VITE_ADMIN_TOKEN || ''

  const [activeSource, setActiveSource] = useState('all')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem('vagasdev-theme')
    return savedTheme === 'dark'
  })
  const [vacancies, setVacancies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [vacancyFilters, setVacancyFilters] = useState(initialVacancyFilters)
  const [vacancyPage, setVacancyPage] = useState(1)

  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false)

  const [vacancyForm, setVacancyForm] = useState(createInitialVacancyForm)

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    window.localStorage.setItem('vagasdev-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    const loadData = async () => {
      try {
        setVacancies(await apiRequest('/api/vacancies'))
      } catch (error) {
        window.alert(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const sourceVacancies = useMemo(
    () => activeSource === 'all'
      ? vacancies
      : vacancies.filter((vacancy) => vacancy.source === activeSource),
    [activeSource, vacancies],
  )

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const filteredVacancies = useMemo(
    () => filterVacancies(sourceVacancies, vacancyFilters, now),
    [sourceVacancies, vacancyFilters, now],
  )
  const areaCandidates = useMemo(
    () => filterVacancies(sourceVacancies, { ...vacancyFilters, area: '' }, now),
    [sourceVacancies, vacancyFilters, now],
  )
  const areaCounts = useMemo(() => getAreaCounts(areaCandidates), [areaCandidates])
  const counts = useMemo(() => getVacancyCounts(sourceVacancies, now), [sourceVacancies, now])

  const updateVacancyForm = (partialForm) => {
    setVacancyForm((current) => ({ ...current, ...partialForm }))
  }

  const updateVacancyFilters = (partialFilters) => {
    setVacancyFilters((current) => ({ ...current, ...partialFilters }))
    setVacancyPage(1)
  }

  const resetVacancyFilters = () => {
    setVacancyFilters(initialVacancyFilters)
    setVacancyPage(1)
  }

  const saveVacancy = async (event) => {
    event.preventDefault()

    if (!canManage) {
      window.alert('Modo publico: cadastro desabilitado.')
      return
    }

    const payload = {
      title: vacancyForm.title.trim(),
      company: vacancyForm.company.trim(),
      location: vacancyForm.location.trim(),
      modality: vacancyForm.modality,
      level: vacancyForm.level,
      description: vacancyForm.description.trim(),
      link: vacancyForm.link.trim(),
      date: vacancyForm.date,
      tags: vacancyForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    if (!payload.title || !payload.company || !payload.link) {
      return
    }

    try {
      const createdVacancy = await apiRequest('/api/vacancies', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: JSON.stringify(payload),
      })

      setVacancies((current) => [createdVacancy, ...current])

      setIsVacancyModalOpen(false)
      setVacancyForm(createInitialVacancyForm())
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <div className="app-shell">
      <AppHeader
        activeSource={activeSource}
        canManage={canManage}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
        onChangeSource={(source) => {
          setActiveSource(source)
          setVacancyFilters(initialVacancyFilters)
          setVacancyPage(1)
        }}
        onOpenCreate={() => setIsVacancyModalOpen(true)}
      />

      <a className="skip-link" href="#oportunidades">Pular para as vagas</a>
      <main className="workspace">
        <section className="workspace-head">
          <div className="hero-copy">
            <p className="section-kicker"><span className="kicker-rule" /> CONEXÕES LOCAIS. NOVAS POSSIBILIDADES.</p>
            <h2>{sourceTitles[activeSource]}</h2>
            <p className="workspace-lede">
              {sourceDescriptions[activeSource]}
            </p>
            <a className="hero-action" href="#oportunidades">Encontre sua oportunidade <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-axis" />
            <span className="art-label">UM NOVO<br />HORIZONTE.</span>
            <span className="art-arrow">↗</span>
            <span className="art-coordinate">28°40′ S / 49°22′ O · CRICIÚMA</span>
          </div>
        </section>
          <div className="workspace-stats" aria-label="Resumo">
            <div>
              <strong>{isLoading ? '—' : counts.active}</strong>
              <span>vagas abertas</span>
            </div>
            <div className="stat-accent">
              <strong>{isLoading ? '—' : counts.recent}</strong>
              <span>publicadas em 7 dias</span>
            </div>
            <button
              type="button"
              className={`stat-today ${vacancyFilters.sort === 'today' ? 'is-selected' : ''}`}
              aria-pressed={vacancyFilters.sort === 'today'}
              aria-label={`Filtrar ${counts.today} vagas publicadas hoje`}
              onClick={() => updateVacancyFilters({ sort: vacancyFilters.sort === 'today' ? 'recent' : 'today' })}
            >
              <strong>{isLoading ? '—' : counts.today}</strong>
              <span>publicadas hoje</span>
            </button>
          </div>

        <section className="content" id="oportunidades" aria-label="Explorar oportunidades">
          <VacanciesPage
            key={activeSource}
            page={vacancyPage}
            onChangePage={setVacancyPage}
            areaCounts={areaCounts}
            areaTotal={areaCandidates.length}
            sourceLabel={activeSource === 'all' ? 'todas as fontes' : activeSource === 'gupy' ? 'Gupy' : 'ACIC'}
            filters={vacancyFilters}
            onChangeFilters={updateVacancyFilters}
            onResetFilters={resetVacancyFilters}
            vacancies={filteredVacancies}
            isLoading={isLoading}
          />
        </section>
        <footer className="workspace-footer"><strong>VagasDev<span>.</span></strong><p>Seu próximo passo, mais perto.</p><span>Gupy + ACIC · Candidatura no site oficial</span></footer>
      </main>

      {canManage && (
        <VacancyModal
          isOpen={isVacancyModalOpen}
          form={vacancyForm}
          onChangeForm={updateVacancyForm}
          onClose={() => setIsVacancyModalOpen(false)}
          onSubmit={saveVacancy}
        />
      )}
    </div>
  )
}

export default App
