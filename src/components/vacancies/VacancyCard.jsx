function VacancyCard({ vacancy }) {
  return (
    <article className="card vacancy-card">
      <h2>{vacancy.title}</h2>
      <p className="muted">{vacancy.company}</p>
      <div className="meta-list">
        <span>{vacancy.location || 'Localizacao nao informada'}</span>
        <span>{vacancy.modality}</span>
        <span>{vacancy.level}</span>
        <span>{new Date(vacancy.date).toLocaleDateString('pt-BR')}</span>
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
