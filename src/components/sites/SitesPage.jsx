import CompanyCard from './CompanyCard'

function SitesPage({
  companySearch,
  onCompanySearchChange,
  companies,
  isLoading,
  canManage,
  onEditCompany,
  onDeleteCompany,
}) {
  return (
    <>
      <section className="toolbar">
        <div className="toolbar-search">
          <label htmlFor="company-search">Pesquisar empresas</label>
          <input
            id="company-search"
            type="text"
            placeholder="Nome ou segmento"
            value={companySearch}
            onChange={(event) => onCompanySearchChange(event.target.value)}
          />
        </div>
      </section>

      {companies.length === 0 ? (
        <section className="empty-state">
          <p>{isLoading ? 'Carregando empresas...' : 'Nenhuma empresa adicionada ainda.'}</p>
        </section>
      ) : (
        <section className="grid companies-grid">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              canManage={canManage}
              onEdit={onEditCompany}
              onDelete={onDeleteCompany}
            />
          ))}
        </section>
      )}
    </>
  )
}

export default SitesPage
