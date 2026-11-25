import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { DEFAULT_ALLOWED_EXTENSIONS } from '@framelet/core';
import { useFramelet, type UseFrameletResult } from './useFramelet';

describe('useFramelet', () => {
  it('returns initial idle state', () => {
    const { result } = renderHook(() => useFramelet());
    expect(result.current.state.status).toBe('idle');
    expect(typeof result.current.loadImage).toBe('function');
  });

  it('exposes actions and meta alongside the flat api', () => {
    const { result } = renderHook(() => useFramelet());
    expect(result.current.actions.rotate).toBe(result.current.rotate);
    expect(result.current.meta.canvasRef.current).toBeNull();
    expect(result.current.meta.canCrop).toBe(false);
  });

  it('prop getters apply anatomy attributes and merge consumer props', () => {
    const { result } = renderHook(() => useFramelet());
    const props = result.current.getRootProps({
      id: 'root',
      className: 'custom',
      style: { color: 'red' },
    });

    expect(props['data-scope']).toBe('framelet');
    expect(props['data-part']).toBe('root');
    expect(props.id).toBe('root');
    expect(props.className).toContain('custom');
    expect(props.style).toEqual({ display: 'inline-block', color: 'red' });
  });

  it('composes consumer refs with internal refs', () => {
    const ref = createRef<HTMLDivElement>();

    function Harness() {
      const api = useFramelet();
      return <div {...api.getRootProps({ ref, 'aria-label': 'root' })} />;
    }

    render(<Harness />);
    expect(ref.current).toBe(screen.getByLabelText('root'));
  });

  it('chains consumer handlers before internal handlers', () => {
    const calls: string[] = [];
    let api!: UseFrameletResult;

    function Harness() {
      api = useFramelet();
      return (
        <button
          {...api.getRotateTriggerProps({
            onClick: () => calls.push('consumer'),
          })}
        >
          Rotate
        </button>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }));

    expect(calls).toEqual(['consumer']);
    expect(api.state.transform.rotation).toBe(90);
  });

  it('lets a consumer handler prevent the internal handler', () => {
    let api!: UseFrameletResult;

    function Harness() {
      api = useFramelet();
      return (
        <button
          {...api.getRotateTriggerProps({
            onClick: (event) => event.preventDefault(),
          })}
        >
          Rotate
        </button>
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }));

    expect(api.state.transform.rotation).toBe(0);
  });

  it('wires filter and adjustment getters to editor actions', () => {
    let api!: UseFrameletResult;

    function Harness() {
      api = useFramelet();
      return (
        <>
          <select aria-label="filter" {...api.getFilterSelectProps()}>
            <option value="none">none</option>
            <option value="moon">moon</option>
          </select>
          <input
            aria-label="brightness"
            {...api.getAdjustmentSliderProps({ adjustment: 'brightness' })}
          />
        </>
      );
    }

    render(<Harness />);
    fireEvent.change(screen.getByLabelText('filter'), { target: { value: 'moon' } });
    fireEvent.change(screen.getByLabelText('brightness'), { target: { value: '25' } });

    expect(api.state.filter).toBe('moon');
    expect(api.state.adjustments.brightness).toBe(25);
  });

  it('derives the file input accept attribute from allowedExtensions', () => {
    const { result } = renderHook(() => useFramelet({ allowedExtensions: ['.PNG', 'jpeg'] }));
    expect(result.current.getFileInputProps().accept).toBe('.png,.jpeg');
  });

  it('uses the default extension list for accept when none is configured', () => {
    const { result } = renderHook(() => useFramelet());
    expect(result.current.getFileInputProps().accept).toBe(
      DEFAULT_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(','),
    );
  });

  it('surfaces a rejected file through error state instead of ignoring it', () => {
    let api!: UseFrameletResult;

    function Harness() {
      api = useFramelet({ allowedExtensions: ['png'] });
      return <input aria-label="file" {...api.getFileInputProps()} />;
    }

    render(<Harness />);
    const input = screen.getByLabelText('file');
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['x'], 'notes.txt', { type: 'text/plain' })],
    });
    fireEvent.change(input);

    expect(api.state.status).toBe('error');
    expect(api.state.error?.message).toContain('.txt');
  });
});
