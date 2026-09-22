function VacancyCard({ vacancy }) {
  const vacancyDate = new Date(vacancy.date)
  const isRecent = Number.isFinite(vacancyDate.getTime()) &&
    new Date().getTime() - vacancyDate.getTime() <= 7 * 24 * 60 * 60 * 1000
  const dateClassName = isRecent ? 'date-badge date-badge-recent' : 'date-badge date-badge-old'

  return (
    <article className={`card vacancy-card ${isRecent ? 'vacancy-card-recent' : 'vacancy-card-old'}`}>
      <div className="vacancy-heading">
        <div className="vacancy-company-logo">
          {vacancy.company_logo_url ? (
            <img src={vacancy.company_logo_url} alt="" />
          ) : (
            <span aria-hidden="true">{vacancy.company?.charAt(0) || '?'}</span>
          )}
        </div>
        <div>
          <h2>{vacancy.title}</h2>
          <p className="muted">{vacancy.company}</p>
        </div>
      </div>
      <div className="meta-list">
        <span>{vacancy.location || 'Localizacao nao informada'}</span>
        <span>{vacancy.modality}</span>
        <span className={dateClassName}>
          {vacancyDate.toLocaleDateString('pt-BR')}
        </span>
      </div>
      {vacancy.tags.length > 0 && (
        <div className="tags-wrap">
          {vacancy.tags.map((tag) => (
            <span key={`${vacancy.id}-${tag}`} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <a href={vacancy.link} target="_blank" rel="noreferrer" className="btn btn-link full">
        Ver vaga
      </a>
    </article>
  )
}

export default VacancyCard
