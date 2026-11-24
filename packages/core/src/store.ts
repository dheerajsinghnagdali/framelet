import type { FrameletState } from './types';

export interface Store {
  getState(): FrameletState;
  setState(next: FrameletState): void;
  subscribe(listener: (state: FrameletState) => void): () => void;
}

export function createStore(initial: FrameletState): Store {
  let state = initial;
  const listeners = new Set<(s: FrameletState) => void>();

  return {
    getState: () => state,
    setState: (next) => {
      state = next;
      for (const l of listeners) l(state);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
