function AppHeader({
  activeSource,
  canManage,
  isDarkMode,
  onToggleTheme,
  onChangeSource,
  onOpenCreate,
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <img className="brand-mark" src="/Logo.png" alt="VagasDev" />
        <div>
          <p className="eyebrow">Seu radar de oportunidades</p>
          <h1>VagasDev</h1>
        </div>
      </div>

      <nav className="main-nav" aria-label="Fontes de vagas">
        <button
          type="button"
          className={`tab ${activeSource === 'all' ? 'active' : ''}`}
          aria-current={activeSource === 'all' ? 'page' : undefined}
          onClick={() => onChangeSource('all')}
        >
          Todas as vagas
        </button>
        <button
          type="button"
          className={`tab ${activeSource === 'gupy' ? 'active' : ''}`}
          aria-current={activeSource === 'gupy' ? 'page' : undefined}
          onClick={() => onChangeSource('gupy')}
        >
          Gupy
        </button>
        <button
          type="button"
          className={`tab ${activeSource === 'acic' ? 'active' : ''}`}
          aria-current={activeSource === 'acic' ? 'page' : undefined}
          onClick={() => onChangeSource('acic')}
        >
          ACIC
        </button>
      </nav>

      {canManage && (
        <button type="button" className="btn btn-primary" onClick={onOpenCreate}>
          <span>+</span> Nova vaga
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

      <p className="header-note"><span className="status-dot" aria-hidden="true" /> Santa Catarina · Brasil</p>
    </header>
  )
}

export default AppHeader
