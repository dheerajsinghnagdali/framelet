import { describe, it, expect } from 'vitest';
import { reduce, createInitialState } from './reducer';

describe('reducer', () => {
  it('initial state is idle', () => {
    const s = createInitialState();
    expect(s.status).toBe('idle');
    expect(s.history.past.length).toBe(0);
  });

  it('SET_FILTER pushes history', () => {
    const s = createInitialState();
    const next = reduce(s, { type: 'SET_FILTER', payload: 'clarendon' });
    expect(next.filter).toBe('clarendon');
    expect(next.history.past.length).toBe(1);
  });

  it('UNDO restores previous', () => {
    const s = createInitialState();
    const s1 = reduce(s, { type: 'SET_FILTER', payload: 'moon' });
    const s2 = reduce(s1, { type: 'UNDO' });
    expect(s2.filter).toBeNull();
  });

  it('CROP reduces working dimensions', () => {
    const data = new ImageData(10, 10);
    const s = reduce(createInitialState(), {
      type: 'LOAD_SUCCESS',
      payload: { source: 'x', data },
    });
    const next = reduce(s, { type: 'CROP', payload: { x: 2, y: 2, width: 4, height: 4 } });
    expect(next.working?.width).toBe(4);
    expect(next.working?.height).toBe(4);
  });
});
