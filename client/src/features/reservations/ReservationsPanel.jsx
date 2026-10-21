import { api } from '../../services/api';
import { ReservationForm } from './ReservationForm';
import { ReservationList } from './ReservationList';

export function ReservationsPanel({
  resources,
  reservations,
  loading,
  reloadReservations,
  notify,
}) {
  const run = async (action, successText) => {
    try {
      await action();
      notify(successText);
      reloadReservations();
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  const handleCreate = (data) =>
    run(() => api.createReservation(data), 'Reserva confirmada com sucesso!');

  const handleStatusChange = (id, status) =>
    run(() => api.updateReservationStatus(id, status), 'Status da reserva atualizado!');

  const handleDelete = (id) => {
    if (!window.confirm('Deseja cancelar esta reserva permanentemente?')) return;
    return run(() => api.deleteReservation(id), 'Reserva removida!');
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 className="card-title">Novo Agendamento</h3>
        <ReservationForm resources={resources} onSubmit={handleCreate} />
      </div>
      <div className="card">
        <h3 className="card-title">Reservas Realizadas</h3>
        <ReservationList
          reservations={reservations}
          resources={resources}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
