import { useRef } from 'react'
import { areas, modalities } from '../../constants/options'
import VacancyCard from './VacancyCard'

function VacanciesPage({
  page,
  onChangePage,
  sourceLabel,
  areaCounts,
  areaTotal,
  filters,
  onChangeFilters,
  onResetFilters,
  vacancies,
  isLoading,
}) {
  const pageSize = 100
  const listStart = useRef(null)
  const totalPages = Math.max(1, Math.ceil(vacancies.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const firstIndex = (currentPage - 1) * pageSize
  const visibleVacancies = vacancies.slice(firstIndex, firstIndex + pageSize)
  const changePage = (nextPage) => {
    onChangePage(nextPage)
    listStart.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const pagination = totalPages > 1 && (
    <nav className="vacancies-pagination" aria-label="Páginas de vagas">
      <button type="button" className="pagination-arrow" disabled={currentPage === 1}
        aria-label="Página anterior de vagas" onClick={() => changePage(currentPage - 1)}>
        <span aria-hidden="true">←</span>
      </button>
      <span className="pagination-summary" aria-live="polite">
        <span className="pagination-sr-only">Página </span>{currentPage} / {totalPages}
      </span>
      <button type="button" className="pagination-arrow" disabled={currentPage === totalPages}
        aria-label="Próxima página de vagas" onClick={() => changePage(currentPage + 1)}>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  )

  const areFiltersClear =
    filters.keyword === '' &&
    filters.modality === '' &&
    filters.area === '' &&
    filters.sort === 'recent'

  return (
    <>
      <section ref={listStart} className="toolbar vacancies-toolbar">
        <div className="toolbar-heading"><div><p className="section-kicker">EXPLORE O RADAR</p><h3>Uma busca. Novas possibilidades.</h3></div><span className="source-pill">{sourceLabel === 'todas as fontes' ? 'Gupy + ACIC' : sourceLabel}</span></div>
        <div className="filters-toolbar-row">
          <div className="filters-grid">
            <input
              type="text"
              aria-label="Buscar vagas por palavra-chave"
              placeholder="Cargo, empresa ou palavra-chave"
              value={filters.keyword}
              onChange={(event) => onChangeFilters({ keyword: event.target.value })}
            />

            <select
              aria-label="Filtrar por modalidade"
              value={filters.modality}
              onChange={(event) => onChangeFilters({ modality: event.target.value })}
            >
              <option value="">Modalidade</option>
              {modalities.map((modality) => (
                <option key={modality} value={modality}>
                  {modality}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar vagas por área"
              value={filters.area}
              onChange={(event) => onChangeFilters({ area: event.target.value })}
            >
              <option value="">Todas as áreas ({areaTotal})</option>
              {areas.map((area) => (
                <option key={area} value={area} disabled={!areaCounts[area] && filters.area !== area}>
                  {area} ({areaCounts[area] || 0})
                </option>
              ))}
            </select>

            <select aria-label="Ordenar vagas" value={filters.sort} onChange={(event) => onChangeFilters({ sort: event.target.value })}>
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigas</option>
              <option value="today">Publicadas hoje</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-ghost reset-filters-button"
            aria-label="Limpar todos os filtros"
            disabled={areFiltersClear}
            onClick={onResetFilters}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <div className="results-heading"><p aria-live="polite">{isLoading ? 'Buscando oportunidades…' : <><strong>{vacancies.length}</strong> {vacancies.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}</>}</p>{pagination}</div>

      {vacancies.length === 0 ? (
        <section className="empty-state">
          <span className={`empty-symbol ${isLoading ? 'is-loading' : ''}`} aria-hidden="true">{isLoading ? '◌' : '↗'}</span>
          <h3>{isLoading ? 'Seu radar está carregando.' : 'Vamos tentar outro caminho?'}</h3>
          <p>{isLoading ? 'Buscando as oportunidades disponíveis.' : `Nenhuma vaga encontrada em ${sourceLabel}. Experimente outra palavra-chave ou limpe os filtros.`}</p>
          {!isLoading && !areFiltersClear && <button type="button" className="btn btn-ghost" onClick={onResetFilters}>Limpar filtros</button>}
        </section>
      ) : (
        <section className="grid vacancies-grid">
          {visibleVacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </section>
      )}
      {pagination}
    </>
  )
}

export default VacanciesPage
