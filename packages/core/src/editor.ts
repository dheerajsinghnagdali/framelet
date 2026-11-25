import { createStore, type Store } from './store';
import { reduce, createInitialState } from './reducer';
import { sourceToImageData } from './image';
import { combinedCssFilter } from './filters';
import { createValidationOptions, validateFileSource, validateImageSize } from './validation';
import type { ExportOptions, FrameletEditor, FrameletOptions, ImageSource } from './types';

export function createFramelet(options: FrameletOptions = {}): FrameletEditor {
  const maxHistory = options.maxHistory ?? 50;
  const validation = createValidationOptions(options);
  const store: Store = createStore(createInitialState());

  const dispatch = (action: Parameters<FrameletEditor['dispatch']>[0]) => {
    const next = reduce(store.getState(), action, maxHistory);
    store.setState(next);
    options.onChange?.(next);
  };

  const loadImage = async (source: ImageSource) => {
    dispatch({ type: 'LOAD_START' });
    try {
      validateFileSource(source, validation);
      const data = await sourceToImageData(source);
      validateImageSize(data, validation);
      dispatch({ type: 'LOAD_SUCCESS', payload: { source, data } });
    } catch (err) {
      dispatch({
        type: 'LOAD_ERROR',
        payload: err instanceof Error ? err : new Error(String(err)),
      });
      throw err;
    }
  };

  const render = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
    const state = store.getState();
    if (!state.working) return;
    const w = width ?? state.working.width;
    const h = height ?? state.working.height;
    const canvas = ctx.canvas;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.filter = combinedCssFilter(state.filter, state.adjustments);
    const srcW = state.working.width;
    const srcH = state.working.height;
    const scale = Math.min(w / srcW, h / srcH);
    const dw = srcW * scale;
    const dh = srcH * scale;
    const ox = (w - dw) / 2;
    const oy = (h - dh) / 2;
    ctx.save();
    ctx.translate(ox + dw / 2, oy + dh / 2);
    if (state.transform.rotation) ctx.rotate((state.transform.rotation * Math.PI) / 180);
    if (state.transform.flipH) ctx.scale(-1, 1);
    if (state.transform.flipV) ctx.scale(1, -1);
    ctx.drawImage(imageDataToCanvas(state.working), -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    ctx.restore();
  };

  const exportImage = async (opts: ExportOptions = {}) => {
    const state = store.getState();
    if (!state.working) throw new Error('No image loaded');
    const format = opts.format ?? 'image/png';
    const quality = opts.quality ?? 0.92;
    const canvas = document.createElement('canvas');
    const rot = state.transform.rotation;
    const swapped = rot === 90 || rot === 270;
    const baseW = swapped ? state.working.height : state.working.width;
    const baseH = swapped ? state.working.width : state.working.height;
    let crop = state.transform.crop;
    const outW = crop ? crop.width : baseW;
    const outH = crop ? crop.height : baseH;
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2d context');
    ctx.filter = combinedCssFilter(state.filter, state.adjustments);
    ctx.save();
    const tmp = document.createElement('canvas');
    tmp.width = state.working.width;
    tmp.height = state.working.height;
    const tctx = tmp.getContext('2d');
    if (!tctx) throw new Error('Unable to get 2d context');
    tctx.putImageData(state.working, 0, 0);
    ctx.translate(outW / 2, outH / 2);
    if (crop) {
    }
    if (rot) ctx.rotate((rot * Math.PI) / 180);
    if (state.transform.flipH) ctx.scale(-1, 1);
    if (state.transform.flipV) ctx.scale(1, -1);
    ctx.drawImage(tmp, -state.working.width / 2, -state.working.height / 2);
    ctx.restore();
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), format, quality);
    });
  };

  const api: FrameletEditor = {
    getState: () => store.getState(),
    subscribe: (l) => store.subscribe(l),
    dispatch,
    loadImage,
    setFilter: (id) => dispatch({ type: 'SET_FILTER', payload: id }),
    setAdjustment: (key, value) => dispatch({ type: 'SET_ADJUSTMENT', payload: { key, value } }),
    setCrop: (rect) => dispatch({ type: 'SET_CROP', payload: rect }),
    crop: (rect) => dispatch({ type: 'CROP', payload: rect }),
    applyCrop: () => dispatch({ type: 'APPLY_CROP' }),
    rotate: (deg) => dispatch({ type: 'ROTATE', payload: deg }),
    flip: (axis) => dispatch({ type: 'FLIP', payload: axis }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    reset: () => dispatch({ type: 'RESET' }),
    render,
    export: exportImage,
    destroy: () => {},
  };

  return api;
}

function imageDataToCanvas(data: ImageData): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = data.width;
  c.height = data.height;
  const ctx = c.getContext('2d');
  if (ctx) ctx.putImageData(data, 0, 0);
  return c;
}
