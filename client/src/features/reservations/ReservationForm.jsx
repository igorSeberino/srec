import { useId, useState } from 'react';
import { Calendar } from 'lucide-react';
import { FieldError } from '../../components/FieldError';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { validateReservation } from './validation';

export function ReservationForm({ resources, onSubmit }) {
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [userName, setUserName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errors, setErrors] = useState({});
  const { submitting, run } = useSubmitLock();
  const id = useId();

  // Sem escolha explicita, vale o primeiro espaco da lista (como o select exibe).
  const resourceId = selectedResourceId || resources[0]?.id || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      const found = validateReservation({ start_time: startTime, end_time: endTime });
      setErrors(found);
      if (Object.keys(found).length > 0) return;

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
    });
  };

  const timeField = (key, label, value, setValue) => (
    <div className="form-group">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <input
        id={`${id}-${key}`}
        type="datetime-local"
        className="form-control"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setErrors((prev) => ({ ...prev, [`${key}_time`]: undefined }));
        }}
        aria-invalid={Boolean(errors[`${key}_time`])}
        aria-describedby={errors[`${key}_time`] ? `${id}-${key}-error` : undefined}
        required
      />
      <FieldError id={`${id}-${key}-error`} message={errors[`${key}_time`]} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor={`${id}-resource`}>Selecione o Espaço</label>
        <select
          id={`${id}-resource`}
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
        <label htmlFor={`${id}-user`}>Nome do Responsável</label>
        <input
          id={`${id}-user`}
          type="text"
          className="form-control"
          placeholder="Ex: Carlos Silva"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>
      {timeField('start', 'Horário de Início', startTime, setStartTime)}
      {timeField('end', 'Horário de Término', endTime, setEndTime)}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        <Calendar size={18} /> {submitting ? 'Enviando...' : 'Confirmar Reserva'}
      </button>
    </form>
  );
}
