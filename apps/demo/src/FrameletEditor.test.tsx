import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FrameletEditor } from './FrameletEditor';
import { frameletParts } from '@framelet/react';

describe('FrameletEditor', () => {
  it('renders a canvas and controls', () => {
    const { container } = render(<FrameletEditor width={320} height={240} />);
    expect(screen.getByRole('button', { name: /rotate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBe(320);
    expect(canvas?.height).toBe(240);
    expect(container.querySelector(frameletParts.root.selector)).not.toBeNull();
  });
});
