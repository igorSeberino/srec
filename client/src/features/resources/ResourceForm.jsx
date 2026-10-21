import { useId, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { RESOURCE_TYPES } from './resourceTypes';

export function ResourceForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('workstation');
  const [capacity, setCapacity] = useState(1);

  const id = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSubmit({ name, type, capacity: Number(capacity) });
    if (ok) {
      setName('');
      setCapacity(1);
    }
  };

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
      <button type="submit" className="btn btn-primary">
        <PlusCircle size={18} /> Cadastrar Espaço
      </button>
    </form>
  );
}
