import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FEEDBACK_TIMEOUT_MS, useFeedback } from './useFeedback';

describe('useFeedback (BUG-14)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('apaga a mensagem depois do tempo limite', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.showFeedback('ok'));
    expect(result.current.message.text).toBe('ok');

    act(() => vi.advanceTimersByTime(FEEDBACK_TIMEOUT_MS));
    expect(result.current.message.text).toBe('');
  });

  it('o timer da primeira mensagem não apaga a segunda antes da hora', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => result.current.showFeedback('primeira'));
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.showFeedback('segunda', 'error'));

    // 4 s depois da primeira: a segunda ainda tem que estar na tela.
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.message).toEqual({ text: 'segunda', type: 'error' });

    act(() => vi.advanceTimersByTime(FEEDBACK_TIMEOUT_MS));
    expect(result.current.message.text).toBe('');
  });

  it('limpa o timer pendente ao desmontar', () => {
    const { result, unmount } = renderHook(() => useFeedback());
    act(() => result.current.showFeedback('tchau'));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
