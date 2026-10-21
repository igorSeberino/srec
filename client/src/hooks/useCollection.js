import { useCallback, useEffect, useState } from 'react';

// Carrega uma colecao da API. `fetcher` e `onError` precisam ser estaveis.
// O setState so acontece no callback da promise e e ignorado se o efeito ja
// foi limpo (desmontagem ou recarga mais nova), sem supressao de lint (CS-12).
export function useCollection(fetcher, onError) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => active && setItems(data))
      .catch((err) => active && onError(err.message, 'error'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [fetcher, onError, version]);

  const reload = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  return { items, loading, reload };
}
