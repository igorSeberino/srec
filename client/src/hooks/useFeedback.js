import { useCallback, useState } from 'react';

const EMPTY = { text: '', type: '' };

export function useFeedback() {
  const [message, setMessage] = useState(EMPTY);

  const showFeedback = useCallback((text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(EMPTY), 4000);
  }, []);

  return { message, showFeedback };
}
