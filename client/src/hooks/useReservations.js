import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useReservations(onError) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setReservations(await api.getReservations());
    } catch (err) {
      onError(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { reservations, loading, reload };
}
