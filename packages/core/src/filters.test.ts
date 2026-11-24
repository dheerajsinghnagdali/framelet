import { describe, it, expect } from 'vitest';
import { adjustmentsToCss, combinedCssFilter } from './filters';
import type { Adjustments } from './types';
import { DEFAULT_ADJUSTMENTS } from './types';

describe('filters', () => {
  it('returns none for default adjustments', () => {
    expect(adjustmentsToCss(DEFAULT_ADJUSTMENTS)).toBe('none');
  });

  it('produces brightness for brightness adjustment', () => {
    const a: Adjustments = { ...DEFAULT_ADJUSTMENTS, brightness: 50 };
    expect(adjustmentsToCss(a)).toContain('brightness(1.5)');
  });

  it('combinedCssFilter includes filter and adjustments', () => {
    const a: Adjustments = { ...DEFAULT_ADJUSTMENTS, contrast: 20 };
    const css = combinedCssFilter('moon', a);
    expect(css).toContain('grayscale(1)');
    expect(css).toContain('contrast(1.2)');
  });

  it('combinedCssFilter returns none when nothing applied', () => {
    expect(combinedCssFilter('none', DEFAULT_ADJUSTMENTS)).toBe('none');
  });
});
