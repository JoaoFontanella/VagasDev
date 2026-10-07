import { areas, modalities } from '../../constants/options'
import VacancyCard from './VacancyCard'

function VacanciesPage({
  filters,
  onChangeFilters,
  onResetFilters,
  vacancies,
  isLoading,
}) {
  const areFiltersClear =
    filters.keyword === '' &&
    filters.modality === '' &&
    filters.area === '' &&
    filters.sort === 'recent'

  return (
    <>
      <section className="toolbar vacancies-toolbar">
        <div className="filters-toolbar-row">
          <div className="filters-grid">
            <input
              type="text"
              placeholder="Palavra-chave"
              value={filters.keyword}
              onChange={(event) => onChangeFilters({ keyword: event.target.value })}
            />

            <select
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
              value={filters.area}
              onChange={(event) => onChangeFilters({ area: event.target.value })}
            >
              <option value="">Área</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select value={filters.sort} onChange={(event) => onChangeFilters({ sort: event.target.value })}>
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

      {vacancies.length === 0 ? (
        <section className="empty-state">
          <p>{isLoading ? 'Carregando vagas...' : 'Nenhuma vaga cadastrada ainda.'}</p>
        </section>
      ) : (
        <section className="grid vacancies-grid">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </section>
      )}
    </>
  )
}

export default VacanciesPage
