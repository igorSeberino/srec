import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCollection } from './useCollection';

describe('useCollection', () => {
  it('carrega os itens e desliga o loading', async () => {
    const fetcher = vi.fn().mockResolvedValue([1, 2]);
    const onError = vi.fn();
    const { result } = renderHook(() => useCollection(fetcher, onError));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([1, 2]);
  });

  it('reload busca de novo', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([1]).mockResolvedValueOnce([1, 2]);
    const onError = vi.fn();
    const { result } = renderHook(() => useCollection(fetcher, onError));
    await waitFor(() => expect(result.current.items).toEqual([1]));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.items).toEqual([1, 2]));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('repassa a mensagem de erro', async () => {
    const onError = vi.fn();
    const fetcher = vi.fn().mockRejectedValue(new Error('fora do ar'));
    renderHook(() => useCollection(fetcher, onError));
    await waitFor(() => expect(onError).toHaveBeenCalledWith('fora do ar', 'error'));
  });

  it('ignora a resposta que chega depois da desmontagem', async () => {
    let reject;
    const onError = vi.fn();
    const fetcher = vi.fn(() => new Promise((_, r) => (reject = r)));
    const { unmount } = renderHook(() => useCollection(fetcher, onError));

    unmount();
    reject(new Error('tarde demais'));
    await Promise.resolve();
    expect(onError).not.toHaveBeenCalled();
  });
});
