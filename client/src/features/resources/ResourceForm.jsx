import { useId, useState } from 'react';
import { PlusCircle, Save } from 'lucide-react';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { RESOURCE_TYPES } from './resourceTypes';

const EMPTY = { name: '', type: 'workstation', capacity: 1 };

// Sem `initialValues` e um formulario de cadastro (limpa ao salvar);
// com `initialValues` e de edicao (mantem os valores e oferece Cancelar).
export function ResourceForm({ initialValues, onSubmit, onCancel }) {
  const isEdit = Boolean(initialValues);
  const start = initialValues ?? EMPTY;
  const [name, setName] = useState(start.name);
  const [type, setType] = useState(start.type);
  const [capacity, setCapacity] = useState(start.capacity);

  const { submitting, run } = useSubmitLock();
  const id = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      const ok = await onSubmit({ name, type, capacity: Number(capacity) });
      if (ok && !isEdit) {
        setName(EMPTY.name);
        setCapacity(EMPTY.capacity);
      }
    });
  };

  const Icon = isEdit ? Save : PlusCircle;
  const label = isEdit ? 'Salvar Alterações' : 'Cadastrar Espaço';

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor={`${id}-name`}>Nome do Espaço / Estação</label>
        <input
          id={`${id}-name`}
          type="text"
          className="form-control"
          placeholder="Ex: Sala de Reunião Alpha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${id}-type`}>Tipo</label>
        <select
          id={`${id}-type`}
          className="form-control"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={`${id}-capacity`}>Capacidade (pessoas)</label>
        <input
          id={`${id}-capacity`}
          type="number"
          min="1"
          className="form-control"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <Icon size={18} /> {submitting ? 'Enviando...' : label}
        </button>
        {isEdit && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
