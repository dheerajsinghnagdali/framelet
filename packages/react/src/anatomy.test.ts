import { describe, expect, it } from 'vitest';
import { createAnatomy, frameletAnatomy, frameletParts } from './anatomy';

describe('createAnatomy', () => {
  it('builds scoped selectors and attributes', () => {
    expect(frameletAnatomy.scope).toBe('framelet');
    expect(frameletParts.canvas.name).toBe('canvas');
    expect(frameletParts.canvas.selector).toBe('[data-scope="framelet"][data-part="canvas"]');
    expect(frameletParts.canvas.attrs).toEqual({
      'data-scope': 'framelet',
      'data-part': 'canvas',
    });
  });

  it('supports custom scopes and part lists', () => {
    const anatomy = createAnatomy('custom').parts('root', 'trigger');
    const parts = anatomy.build();

    expect(parts.trigger.selector).toBe('[data-scope="custom"][data-part="trigger"]');
  });
});
