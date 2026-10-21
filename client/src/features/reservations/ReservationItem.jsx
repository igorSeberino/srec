import { CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react';
import { formatDateTime } from '../../services/datetime';

export function ReservationItem({ reservation, resourceName, onStatusChange, onDelete }) {
  const { id, user_name, start_time, end_time, status } = reservation;

  return (
    <div className="item-card">
      <div className="item-details">
        <h4>{resourceName}</h4>
        <p>
          <strong>Responsável:</strong> {user_name}
        </p>
        <p>
          <Clock size={14} style={{ display: 'inline' }} /> {formatDateTime(start_time)} até{' '}
          {formatDateTime(end_time)}
        </p>
        <span className={`status-tag status-${status}`}>{status}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {status === 'scheduled' && (
          <>
            <button
              className="btn-outline-danger"
              style={{ borderColor: '#16a34a', color: '#16a34a' }}
              onClick={() => onStatusChange(id, 'completed')}
              title="Concluir"
              aria-label={`Concluir reserva de ${user_name} em ${resourceName}`}
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              className="btn-outline-danger"
              onClick={() => onStatusChange(id, 'cancelled')}
              title="Cancelar Reserva"
              aria-label={`Cancelar reserva de ${user_name} em ${resourceName}`}
            >
              <XCircle size={16} />
            </button>
          </>
        )}
        <button
          className="btn-outline-danger"
          onClick={() => onDelete(id)}
          title="Excluir Definitivamente"
          aria-label={`Excluir definitivamente a reserva de ${user_name} em ${resourceName}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
