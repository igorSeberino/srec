import { toApiDateTime } from './datetime';
import { request } from './http';

export const api = {
  // Resources
  getResources: () => request('/resources', { fallback: 'Falha ao carregar recursos' }),

  createResource: (data) =>
    request('/resources', { method: 'POST', body: data, fallback: 'Erro ao criar recurso' }),

  updateResource: (id, data) =>
    request(`/resources/${id}`, {
      method: 'PUT',
      body: data,
      fallback: 'Erro ao atualizar recurso',
    }),

  deleteResource: (id) =>
    request(`/resources/${id}`, { method: 'DELETE', fallback: 'Erro ao deletar recurso' }),

  // Reservations
  getReservations: () => request('/reservations', { fallback: 'Falha ao carregar reservas' }),

  createReservation: (data) =>
    request('/reservations', {
      method: 'POST',
      body: {
        ...data,
        start_time: toApiDateTime(data.start_time),
        end_time: toApiDateTime(data.end_time),
      },
      fallback: 'Erro ao criar reserva',
    }),

  updateReservationStatus: (id, status) =>
    request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: { status },
      fallback: 'Erro ao atualizar status',
    }),

  deleteReservation: (id) =>
    request(`/reservations/${id}`, { method: 'DELETE', fallback: 'Erro ao cancelar reserva' }),
};
