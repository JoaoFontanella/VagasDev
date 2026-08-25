function CompanyModal({ isOpen, editingCompanyId, form, onChangeForm, onClose, onSubmit }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>{editingCompanyId ? 'Editar empresa' : 'Adicionar empresa'}</h2>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Nome da empresa
            <input
              type="text"
              value={form.name}
              onChange={(event) => onChangeForm({ name: event.target.value })}
              required
            />
          </label>

          <label>
            Logo
            <input
              type="url"
              placeholder="https://"
              value={form.logo}
              onChange={(event) => onChangeForm({ logo: event.target.value })}
            />
          </label>

          <label>
            Segmento
            <input
              type="text"
              value={form.segment}
              onChange={(event) => onChangeForm({ segment: event.target.value })}
            />
          </label>

          <label>
            Site
            <input
              type="url"
              placeholder="https://"
              value={form.site}
              onChange={(event) => onChangeForm({ site: event.target.value })}
            />
          </label>

          <label>
            Pagina de carreiras / Trabalhe Conosco
            <input
              type="url"
              placeholder="https://"
              value={form.careers}
              onChange={(event) => onChangeForm({ careers: event.target.value })}
            />
          </label>

          <label>
            LinkedIn
            <input
              type="url"
              placeholder="https://"
              value={form.linkedin}
              onChange={(event) => onChangeForm({ linkedin: event.target.value })}
            />
          </label>

          <label className="full-width">
            Observacoes
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => onChangeForm({ notes: event.target.value })}
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyModal
