function AppHeader({
  activePage,
  canManage,
  isDarkMode,
  onToggleTheme,
  onChangePage,
  onOpenCreate,
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <img className="brand-mark" src="/Logo.png" alt="VagasDev" />
        <div>
          <p className="eyebrow">Radar profissional</p>
          <h1>VagasDev</h1>
        </div>
      </div>

      <nav className="main-nav" aria-label="Paginas principais">
        <button
          type="button"
          className={`tab ${activePage === 'vacancies' ? 'active' : ''}`}
          onClick={() => onChangePage('vacancies')}
        >
          <span className="nav-index">01</span> Vagas
        </button>
        <button
          type="button"
          className={`tab ${activePage === 'sites' ? 'active' : ''}`}
          onClick={() => onChangePage('sites')}
        >
          <span className="nav-index">02</span> Empresas
        </button>
      </nav>

      {canManage && (
        <button type="button" className="btn btn-primary" onClick={onOpenCreate}>
          <span>+</span> {activePage === 'sites' ? 'Nova empresa' : 'Nova vaga'}
        </button>
      )}

      <button
        type="button"
        className="theme-toggle"
        aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
        aria-pressed={isDarkMode}
        onClick={onToggleTheme}
      >
        <span className="theme-toggle-icon" aria-hidden="true">{isDarkMode ? '☼' : '☾'}</span>
        {isDarkMode ? 'Modo claro' : 'Modo escuro'}
      </button>

      <p className="header-note">SC · BR<br /><span>Atualizado agora</span></p>
    </header>
  )
}

export default AppHeader
