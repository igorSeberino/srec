import { CheckCircle2, Clock, Trash2, XCircle } from 'lucide-react';

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
          <Clock size={14} style={{ display: 'inline' }} />{' '}
          {new Date(start_time).toLocaleString('pt-BR')} até{' '}
          {new Date(end_time).toLocaleString('pt-BR')}
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
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              className="btn-outline-danger"
              onClick={() => onStatusChange(id, 'cancelled')}
              title="Cancelar Reserva"
            >
              <XCircle size={16} />
            </button>
          </>
        )}
        <button
          className="btn-outline-danger"
          onClick={() => onDelete(id)}
          title="Excluir Definitivamente"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
