import { useCallback, useEffect, useState } from 'react';

const EMPTY = { text: '', type: '' };
export const FEEDBACK_TIMEOUT_MS = 4000;

export function useFeedback() {
  const [message, setMessage] = useState(EMPTY);

  const showFeedback = useCallback((text, type = 'success') => {
    setMessage({ text, type });
  }, []);

  // Cada mensagem nova cancela o timer da anterior; desmontar cancela o pendente (BUG-14).
  useEffect(() => {
    if (!message.text) return undefined;
    const timer = setTimeout(() => setMessage(EMPTY), FEEDBACK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return { message, showFeedback };
}
