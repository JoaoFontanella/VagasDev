import { useEffect, useMemo, useState } from 'react'
import AppHeader from './components/layout/AppHeader'
import CompanyModal from './components/modals/CompanyModal'
import VacancyModal from './components/modals/VacancyModal'
import SitesPage from './components/sites/SitesPage'
import VacanciesPage from './components/vacancies/VacanciesPage'
import { createInitialVacancyForm, initialCompanyForm } from './constants/forms'
import { apiRequest } from './services/api'
import {
  filterCompanies,
  filterVacancies,
  getCompanyFilterOptions,
} from './utils/filters'
import './App.css'

function App() {
  const canManage = import.meta.env.VITE_ENABLE_ADMIN === 'true'
  const adminToken = import.meta.env.VITE_ADMIN_TOKEN || ''

  const [activePage, setActivePage] = useState('vacancies')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem('vagasdev-theme')
    return savedTheme === 'dark'
  })
  const [companies, setCompanies] = useState([])
  const [vacancies, setVacancies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [companySearch, setCompanySearch] = useState('')
  const [vacancyFilters, setVacancyFilters] = useState({
    keyword: '',
    company: '',
    modality: '',
    area: '',
    sort: 'recent',
  })

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false)

  const [editingCompanyId, setEditingCompanyId] = useState(null)
  const [companyForm, setCompanyForm] = useState(initialCompanyForm)
  const [vacancyForm, setVacancyForm] = useState(createInitialVacancyForm)

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    window.localStorage.setItem('vagasdev-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, vacanciesData] = await Promise.all([
          apiRequest('/api/companies'),
          apiRequest('/api/vacancies'),
        ])
        setCompanies(companiesData)
        setVacancies(vacanciesData)
      } catch (error) {
        window.alert(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredCompanies = useMemo(
    () => filterCompanies(companies, companySearch),
    [companies, companySearch],
  )

  const companyFilterOptions = useMemo(
    () => getCompanyFilterOptions(companies, vacancies),
    [companies, vacancies],
  )

  const filteredVacancies = useMemo(
    () => filterVacancies(vacancies, vacancyFilters),
    [vacancies, vacancyFilters],
  )

  const activeCount = vacancies.length
  const [now] = useState(() => Date.now())
  const recentCount = useMemo(() => {
    return vacancies.filter((vacancy) => {
      const date = new Date(vacancy.date).getTime()
      return Number.isFinite(date) && now - date <= 7 * 24 * 60 * 60 * 1000
    }).length
  }, [now, vacancies])

  const openAddCompanyModal = () => {
    setEditingCompanyId(null)
    setCompanyForm(initialCompanyForm)
    setIsCompanyModalOpen(true)
  }

  const openEditCompanyModal = (company) => {
    setEditingCompanyId(company.id)
    setCompanyForm({
      name: company.name,
      site: company.site,
      careers: company.careers,
      linkedin: company.linkedin,
      notes: company.notes,
    })
    setIsCompanyModalOpen(true)
  }

  const updateCompanyForm = (partialForm) => {
    setCompanyForm((current) => ({ ...current, ...partialForm }))
  }

  const updateVacancyForm = (partialForm) => {
    setVacancyForm((current) => ({ ...current, ...partialForm }))
  }

  const updateVacancyFilters = (partialFilters) => {
    setVacancyFilters((current) => ({ ...current, ...partialFilters }))
  }

  const saveCompany = async (event) => {
    event.preventDefault()

    if (!canManage) {
      window.alert('Modo publico: cadastro desabilitado.')
      return
    }

    const payload = {
      ...companyForm,
      name: companyForm.name.trim(),
      site: companyForm.site.trim(),
      careers: companyForm.careers.trim(),
      linkedin: companyForm.linkedin.trim(),
      notes: companyForm.notes.trim(),
    }

    if (!payload.name) {
      return
    }

    try {
      if (editingCompanyId) {
        const updatedCompany = await apiRequest(`/api/companies/${editingCompanyId}`, {
          method: 'PUT',
          headers: { 'x-admin-token': adminToken },
          body: JSON.stringify(payload),
        })

        setCompanies((current) =>
          current.map((company) =>
            company.id === editingCompanyId ? updatedCompany : company,
          ),
        )
      } else {
        const createdCompany = await apiRequest('/api/companies', {
          method: 'POST',
          headers: { 'x-admin-token': adminToken },
          body: JSON.stringify(payload),
        })

        setCompanies((current) => [createdCompany, ...current])
      }

      setIsCompanyModalOpen(false)
      setEditingCompanyId(null)
      setCompanyForm(initialCompanyForm)
    } catch (error) {
      window.alert(error.message)
    }
  }

  const deleteCompany = async (companyId) => {
    if (!canManage) {
      window.alert('Modo publico: exclusao desabilitada.')
      return
    }

    const shouldDelete = window.confirm('Tem certeza que deseja excluir esta empresa?')
    if (!shouldDelete) {
      return
    }

    try {
      await apiRequest(`/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken },
      })
      setCompanies((current) => current.filter((company) => company.id !== companyId))
    } catch (error) {
      window.alert(error.message)
    }
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
        activePage={activePage}
        canManage={canManage}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((current) => !current)}
        onChangePage={setActivePage}
        onOpenCreate={
          activePage === 'sites'
            ? openAddCompanyModal
            : () => setIsVacancyModalOpen(true)
        }
      />

      <main className="workspace">
        <section className="workspace-head">
          <div>
            <p className="section-kicker">{activePage === 'sites' ? 'Radar de empresas' : 'Curadoria de oportunidades'}</p>
            <h2>{activePage === 'sites' ? 'Onde a próxima oportunidade começa.' : 'Vagas que merecem sua atenção.'}</h2>
            <p className="workspace-lede">
              {activePage === 'sites'
                ? 'Uma visão limpa das empresas que estão movimentando a cena tech da região.'
                : 'Pesquise, compare e encontre seu próximo movimento profissional.'}
            </p>
          </div>
          <div className="workspace-stats" aria-label="Resumo">
            <div>
              <strong>{activePage === 'sites' ? companies.length : activeCount}</strong>
              <span>{activePage === 'sites' ? 'empresas mapeadas' : 'vagas abertas'}</span>
            </div>
            <div className="stat-accent">
              <strong>{recentCount}</strong>
              <span>publicadas em 7 dias</span>
            </div>
          </div>
        </section>

        <section className="content">
        {activePage === 'sites' ? (
          <SitesPage
            companySearch={companySearch}
            onCompanySearchChange={setCompanySearch}
            companies={filteredCompanies}
            isLoading={isLoading}
            canManage={canManage}
            onEditCompany={openEditCompanyModal}
            onDeleteCompany={deleteCompany}
          />
        ) : (
          <VacanciesPage
            filters={vacancyFilters}
            onChangeFilters={updateVacancyFilters}
            companyOptions={companyFilterOptions}
            vacancies={filteredVacancies}
            isLoading={isLoading}
          />
        )}
        </section>
      </main>

      {canManage && (
        <CompanyModal
          isOpen={isCompanyModalOpen}
          editingCompanyId={editingCompanyId}
          form={companyForm}
          onChangeForm={updateCompanyForm}
          onClose={() => setIsCompanyModalOpen(false)}
          onSubmit={saveCompany}
        />
      )}

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
