import { useState } from 'react';
import { Calendar } from 'lucide-react';

export function ReservationForm({ resources, onSubmit }) {
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [userName, setUserName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Sem escolha explicita, vale o primeiro espaco da lista (como o select exibe).
  const resourceId = selectedResourceId || resources[0]?.id || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onSubmit({
      resource_id: resourceId,
      user_name: userName,
      start_time: startTime,
      end_time: endTime,
    });
    if (ok) {
      setUserName('');
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Selecione o Espaço</label>
        <select
          className="form-control"
          value={resourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
          required
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Nome do Responsável</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex: Carlos Silva"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Horário de Início</label>
        <input
          type="datetime-local"
          className="form-control"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Horário de Término</label>
        <input
          type="datetime-local"
          className="form-control"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        <Calendar size={18} /> Confirmar Reserva
      </button>
    </form>
  );
}
