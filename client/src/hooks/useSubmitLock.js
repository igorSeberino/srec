import { useCallback, useRef, useState } from 'react';

// Garante um envio por vez. O ref barra o segundo clique ainda no mesmo
// tick, antes de o estado `submitting` re-renderizar o botao desabilitado.
export function useSubmitLock() {
  const lockRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const run = useCallback(async (action) => {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    setSubmitting(true);
    try {
      return await action();
    } finally {
      lockRef.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submitting, run };
}
