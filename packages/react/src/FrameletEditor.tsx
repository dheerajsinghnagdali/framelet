import { useEffect, useRef, useState } from 'react';
import { useFramelet } from './useFramelet';
import { FILTER_IDS } from '@framelet/core';
import type { CropRect, FilterId, FrameletOptions, ImageSource } from '@framelet/core';

export interface FrameletEditorProps extends FrameletOptions {
  src?: ImageSource;
  width?: number;
  height?: number;
  className?: string;
}

interface DragState {
  mode: 'move' | 'nw' | 'ne' | 'sw' | 'se';
  startX: number;
  startY: number;
  startRect: CropRect;
}

export function FrameletEditor(props: FrameletEditorProps) {
  const { src, width = 480, height = 480, className, ...options } = props;
  const api = useFramelet(options);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    if (src) void api.loadImage(src);
  }, [src, api]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    api.render(ctx, width, height);
  }, [api, api.state, width, height]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) {
      void api.loadImage(file);
      setCropRect(null);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const img = api.state.working;
  const scale = img ? Math.min(width / img.width, height / img.height) : 1;
  const dispW = img ? img.width * scale : width;
  const dispH = img ? img.height * scale : height;
  const offsetX = (width - dispW) / 2;
  const offsetY = (height - dispH) / 2;

  const startDrag = (mode: DragState['mode'], e: React.PointerEvent) => {
    if (!cropRect) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ mode, startX: e.clientX, startY: e.clientY, startRect: { ...cropRect } });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || !img || !cropRect) return;
    const dx = (e.clientX - drag.startX) / scale;
    const dy = (e.clientY - drag.startY) / scale;
    const r = drag.startRect;
    let next = { ...r };
    if (drag.mode === 'move') {
      next.x = Math.max(0, Math.min(img.width - r.width, r.x + dx));
      next.y = Math.max(0, Math.min(img.height - r.height, r.y + dy));
    } else {
      if (drag.mode.includes('w')) {
        const nx = Math.max(0, Math.min(r.x + r.width - 10, r.x + dx));
        next.width = r.width + (r.x - nx);
        next.x = nx;
      }
      if (drag.mode.includes('e')) {
        next.width = Math.max(10, Math.min(img.width - r.x, r.width + dx));
      }
      if (drag.mode.includes('n')) {
        const ny = Math.max(0, Math.min(r.y + r.height - 10, r.y + dy));
        next.height = r.height + (r.y - ny);
        next.y = ny;
      }
      if (drag.mode.includes('s')) {
        next.height = Math.max(10, Math.min(img.height - r.y, r.height + dy));
      }
    }
    // clamp
    next.x = Math.max(0, Math.min(img.width - next.width, next.x));
    next.y = Math.max(0, Math.min(img.height - next.height, next.y));
    next.width = Math.max(10, Math.min(img.width - next.x, next.width));
    next.height = Math.max(10, Math.min(img.height - next.y, next.height));
    setCropRect(next);
  };

  const endDrag = () => setDrag(null);

  const btnStyle: React.CSSProperties = {
    background: '#e8dcc8',
    color: '#3a2f25',
    border: '1px solid #d4b896',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 13,
  };

  const applyCrop = () => {
    if (cropRect) api.crop(cropRect);
    setCropMode(false);
    setCropRect(null);
  };

  return (
    <div className={className} style={{ display: 'inline-block' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width,
          height,
          background: '#f5efe6',
          borderRadius: 12,
          overflow: 'hidden',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
      >
        <canvas ref={canvasRef} width={width} height={height} />
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px dashed #4f8cff',
              pointerEvents: 'none',
            }}
          />
        )}
        {cropMode && cropRect && img && (
          <>
            <div
              style={{
                position: 'absolute',
                left: offsetX + cropRect.x * scale,
                top: offsetY + cropRect.y * scale,
                width: cropRect.width * scale,
                height: cropRect.height * scale,
                border: '2px solid #fff',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                cursor: 'move',
              }}
              onPointerDown={(e) => startDrag('move', e)}
            >
              {(['nw', 'ne', 'sw', 'se'] as const).map((c) => (
                <span
                  key={c}
                  onPointerDown={(e) => startDrag(c, e)}
                  style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    background: '#fff',
                    border: '1px solid #000',
                    ...(c.includes('n') ? { top: -6 } : { bottom: -6 }),
                    ...(c.includes('w') ? { left: -6 } : { right: -6 }),
                    cursor: `${c}-resize`,
                  }}
                />
              ))}
            </div>
          </>
        )}
        {api.state.status !== 'ready' && !cropMode && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9aa0a6',
              fontSize: 14,
              pointerEvents: 'none',
            }}
          >
            Drop an image here or use Upload
          </div>
        )}
      </div>
      <div
        style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button type="button" style={btnStyle} onClick={() => fileInputRef.current?.click()}>
          Upload
        </button>
        {!cropMode ? (
          <button
            type="button"
            style={btnStyle}
            onClick={() => {
              if (!cropRect && api.state.working) {
                setCropRect({
                  x: 0,
                  y: 0,
                  width: api.state.working.width,
                  height: api.state.working.height,
                });
              }
              setCropMode(true);
            }}
            disabled={api.state.status !== 'ready'}
          >
            Crop
          </button>
        ) : (
          <>
            <button type="button" style={btnStyle} onClick={applyCrop}>
              Apply Crop
            </button>
            <button type="button" style={btnStyle} onClick={() => setCropMode(false)}>
              Cancel
            </button>
          </>
        )}
        <button type="button" style={btnStyle} onClick={() => api.rotate(90)}>
          Rotate
        </button>
        <button type="button" style={btnStyle} onClick={() => api.flip('h')}>
          Flip H
        </button>
        <button type="button" style={btnStyle} onClick={() => api.flip('v')}>
          Flip V
        </button>
        <button type="button" style={btnStyle} onClick={api.undo}>
          Undo
        </button>
        <button type="button" style={btnStyle} onClick={api.redo}>
          Redo
        </button>
        <button type="button" style={btnStyle} onClick={api.reset}>
          Reset
        </button>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13 }}>
          Filter
          <select
            value={api.state.filter ?? 'none'}
            onChange={(e) =>
              api.setFilter(e.target.value === 'none' ? null : (e.target.value as FilterId))
            }
            style={{
              marginLeft: 8,
              background: '#faf6f1',
              border: '1px solid #d4b896',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#3a2f25',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {FILTER_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        {Object.keys(api.state.adjustments).map((key) => (
          <label key={key} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 90, textTransform: 'capitalize' }}>{key}</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={api.state.adjustments[key as keyof typeof api.state.adjustments]}
              onChange={(e) =>
                api.setAdjustment(key as keyof typeof api.state.adjustments, Number(e.target.value))
              }
              style={{ flex: 1 }}
            />
            <span style={{ width: 32, textAlign: 'right' }}>
              {api.state.adjustments[key as keyof typeof api.state.adjustments]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
