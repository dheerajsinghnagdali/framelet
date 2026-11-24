import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFramelet } from './useFramelet';

describe('useFramelet', () => {
  it('returns initial idle state', () => {
    const { result } = renderHook(() => useFramelet());
    expect(result.current.state.status).toBe('idle');
    expect(typeof result.current.loadImage).toBe('function');
  });
});
