import { api } from '../services/api';
import { useCollection } from './useCollection';

export function useResources(onError) {
  const { items, loading, reload } = useCollection(api.getResources, onError);
  return { resources: items, loading, reload };
}
