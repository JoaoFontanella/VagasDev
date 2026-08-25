import { levels, modalities } from '../../constants/options'

function VacancyModal({ isOpen, form, onChangeForm, onClose, onSubmit }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>Adicionar vaga</h2>

        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Cargo
            <input
              type="text"
              value={form.title}
              onChange={(event) => onChangeForm({ title: event.target.value })}
              required
            />
          </label>

          <label>
            Empresa
            <input
              type="text"
              value={form.company}
              onChange={(event) => onChangeForm({ company: event.target.value })}
              required
            />
          </label>

          <label>
            Localizacao
            <input
              type="text"
              value={form.location}
              onChange={(event) => onChangeForm({ location: event.target.value })}
            />
          </label>

          <label>
            Modalidade
            <select
              value={form.modality}
              onChange={(event) => onChangeForm({ modality: event.target.value })}
            >
              {modalities.map((modality) => (
                <option key={modality} value={modality}>
                  {modality}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nivel
            <select value={form.level} onChange={(event) => onChangeForm({ level: event.target.value })}>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label>
            Link da vaga
            <input
              type="url"
              placeholder="https://"
              value={form.link}
              onChange={(event) => onChangeForm({ link: event.target.value })}
              required
            />
          </label>

          <label>
            Data
            <input
              type="date"
              value={form.date}
              onChange={(event) => onChangeForm({ date: event.target.value })}
            />
          </label>

          <label>
            Tags
            <input
              type="text"
              placeholder="React, Frontend, Node"
              value={form.tags}
              onChange={(event) => onChangeForm({ tags: event.target.value })}
            />
          </label>

          <label className="full-width">
            Descricao
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => onChangeForm({ description: event.target.value })}
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

export default VacancyModal
