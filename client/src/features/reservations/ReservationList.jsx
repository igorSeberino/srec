import { ReservationItem } from './ReservationItem';

export function ReservationList({ reservations, resources, loading, onStatusChange, onDelete }) {
  return (
    <>
      {loading && <p>Carregando...</p>}
      {!loading && reservations.length === 0 && <p>Nenhuma reserva registrada.</p>}
      <div className="item-list">
        {reservations.map((rev) => {
          const resource = resources.find((r) => r.id === rev.resource_id);
          return (
            <ReservationItem
              key={rev.id}
              reservation={rev}
              resourceName={resource ? resource.name : `Espaço #${rev.resource_id}`}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </>
  );
}
