import { describe, it, expect, vi } from 'vitest';
import { createStore } from './store';
import { createInitialState } from './reducer';

describe('store', () => {
  it('notifies subscribers on setState', () => {
    const store = createStore(createInitialState());
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    const next = { ...store.getState(), status: 'ready' as const };
    store.setState(next);
    expect(listener).toHaveBeenCalledWith(next);
    unsub();
    store.setState(store.getState());
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
