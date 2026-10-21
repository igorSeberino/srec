import { api } from '../services/api';
import { useCollection } from './useCollection';

export function useReservations(onError) {
  const { items, loading, reload } = useCollection(api.getReservations, onError);
  return { reservations: items, loading, reload };
}
