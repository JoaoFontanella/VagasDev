import { areas, modalities } from '../../constants/options'
import VacancyCard from './VacancyCard'

function VacanciesPage({ filters, onChangeFilters, companyOptions, vacancies, isLoading }) {
  return (
    <>
      <section className="toolbar vacancies-toolbar">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Palavra-chave"
            value={filters.keyword}
            onChange={(event) => onChangeFilters({ keyword: event.target.value })}
          />

          <select
            value={filters.company}
            onChange={(event) => onChangeFilters({ company: event.target.value })}
          >
            <option value="">Empresa</option>
            {companyOptions.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

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
          </select>
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
