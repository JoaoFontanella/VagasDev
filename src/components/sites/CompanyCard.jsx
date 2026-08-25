function CompanyCard({ company, canManage, onEdit, onDelete }) {
  return (
    <article className="card company-card">
      <div className="card-header">
        <div className="logo-wrap" aria-hidden="true">
          {company.logo ? (
            <img src={company.logo} alt={`Logo da ${company.name}`} />
          ) : (
            <span>{company.name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h2>{company.name}</h2>
          <p className="muted">{company.segment || 'Sem segmento informado'}</p>
        </div>
      </div>

      <div className="links-row">
        {company.site && (
          <a href={company.site} target="_blank" rel="noreferrer" className="btn btn-link">
            Site
          </a>
        )}
        {company.careers && (
          <a href={company.careers} target="_blank" rel="noreferrer" className="btn btn-link">
            Trabalhe Conosco
          </a>
        )}
        {company.linkedin && (
          <a href={company.linkedin} target="_blank" rel="noreferrer" className="btn btn-link">
            LinkedIn
          </a>
        )}
      </div>

      {company.notes && <p className="notes">{company.notes}</p>}

      {canManage && (
        <div className="card-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onEdit(company)}>
            Editar
          </button>
          <button type="button" className="btn btn-ghost danger" onClick={() => onDelete(company.id)}>
            Excluir
          </button>
        </div>
      )}
    </article>
  )
}

export default CompanyCard
