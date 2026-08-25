function AppHeader({ activePage, canManage, onChangePage, onOpenCreate }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Ainda em Implementação 😆</p>
        <h1>VagasDev</h1>
      </div>

      <nav className="main-nav" aria-label="Paginas principais">
        <button
          type="button"
          className={`tab ${activePage === 'sites' ? 'active' : ''}`}
          onClick={() => onChangePage('sites')}
        >
          Sites
        </button>
        <button
          type="button"
          className={`tab ${activePage === 'vacancies' ? 'active' : ''}`}
          onClick={() => onChangePage('vacancies')}
        >
          Vagas
        </button>
      </nav>

      {canManage && (
        <button type="button" className="btn btn-primary" onClick={onOpenCreate}>
          {activePage === 'sites' ? '+ Adicionar empresa' : '+ Adicionar vaga'}
        </button>
      )}
    </header>
  )
}

export default AppHeader
