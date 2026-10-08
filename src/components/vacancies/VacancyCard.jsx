import { formatVacancyDate, getVacancyCounts } from '../../utils/vacancy-dates'

function VacancyCard({ vacancy }) {
  const companyName = (vacancy.company || '').trim()
  const hasCompany = Boolean(companyName) && !/^empresa n[aã]o informada(?:\s*\([^)]*\))?$/i.test(companyName)
  const isRecent = getVacancyCounts([vacancy]).recent === 1
  const dateClassName = isRecent ? 'date-badge date-badge-recent' : 'date-badge date-badge-old'

  return (
    <article className={`card vacancy-card ${isRecent ? 'vacancy-card-recent' : 'vacancy-card-old'}`}>
      <div className="vacancy-topline"><span className="vacancy-source">{vacancy.source === 'gupy' ? 'GUPY' : vacancy.source === 'acic' ? 'ACIC' : 'OPORTUNIDADE'}</span><span className={dateClassName}>{formatVacancyDate(vacancy)}</span></div>
      <div className="vacancy-heading">
        {hasCompany && <div className="vacancy-company-logo">
          {vacancy.company_logo_url ? (
            <img src={vacancy.company_logo_url} alt="" />
          ) : (
            <span aria-hidden="true">{companyName.charAt(0)}</span>
          )}
        </div>}
        <div>
          <h2>{vacancy.title}</h2>
          {hasCompany && <p className="muted">{companyName}</p>}
        </div>
      </div>
      <div className="meta-list">
        <span>{vacancy.location || 'Localização não informada'}</span>
        <span>{vacancy.modality}</span>
      </div>
      {vacancy.tags?.length > 0 && (
        <div className="tags-wrap">
          {vacancy.tags.map((tag) => (
            <span key={`${vacancy.id}-${tag}`} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <a href={vacancy.link} target="_blank" rel="noreferrer" className="btn btn-link full">
        Ver oportunidade <span aria-hidden="true">↗</span>
      </a>
    </article>
  )
}

export default VacancyCard
