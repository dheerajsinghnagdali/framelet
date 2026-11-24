import type { Adjustments, FrameletAction, FrameletState, HistoryEntry, Transform } from './types';
import { DEFAULT_ADJUSTMENTS } from './types';

const DEFAULT_TRANSFORM: Transform = {
  rotation: 0,
  flipH: false,
  flipV: false,
  crop: null,
};

function snapshot(state: FrameletState): HistoryEntry {
  return {
    adjustments: { ...state.adjustments },
    filter: state.filter,
    transform: {
      ...state.transform,
      crop: state.transform.crop ? { ...state.transform.crop } : null,
    },
    working: state.working
      ? new ImageData(
          new Uint8ClampedArray(state.working.data),
          state.working.width,
          state.working.height,
        )
      : null,
  };
}

function applyEntry(state: FrameletState, entry: HistoryEntry): FrameletState {
  return {
    ...state,
    adjustments: { ...entry.adjustments },
    filter: entry.filter,
    transform: {
      ...entry.transform,
      crop: entry.transform.crop ? { ...entry.transform.crop } : null,
    },
    working: entry.working
      ? new ImageData(
          new Uint8ClampedArray(entry.working.data),
          entry.working.width,
          entry.working.height,
        )
      : state.working,
  };
}

export function createInitialState(): FrameletState {
  return {
    image: null,
    original: null,
    working: null,
    transform: { ...DEFAULT_TRANSFORM, crop: null },
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    filter: null,
    history: { past: [], future: [] },
    status: 'idle',
    error: null,
  };
}

export function reduce(
  state: FrameletState,
  action: FrameletAction,
  maxHistory = 50,
): FrameletState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS': {
      const data = action.payload.data;
      const clone = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
      return {
        ...createInitialState(),
        image: action.payload.source,
        original: clone,
        working: new ImageData(new Uint8ClampedArray(data.data), data.width, data.height),
        status: 'ready',
      };
    }
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'SET_FILTER': {
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      return {
        ...state,
        filter: action.payload,
        history: { past, future: [] },
      };
    }
    case 'SET_ADJUSTMENT': {
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      const adjustments: Adjustments = {
        ...state.adjustments,
        [action.payload.key]: action.payload.value,
      };
      return {
        ...state,
        adjustments,
        history: { past, future: [] },
      };
    }
    case 'SET_CROP': {
      return {
        ...state,
        transform: { ...state.transform, crop: action.payload ? { ...action.payload } : null },
      };
    }
    case 'CROP': {
      if (!state.working) return state;
      const rect = action.payload;
      const w = state.working.width;
      const h = state.working.height;
      const x = Math.max(0, Math.min(w, Math.round(rect.x)));
      const y = Math.max(0, Math.min(h, Math.round(rect.y)));
      const cw = Math.max(1, Math.min(w - x, Math.round(rect.width)));
      const ch = Math.max(1, Math.min(h - y, Math.round(rect.height)));
      const src = state.working.data;
      const out = new Uint8ClampedArray(cw * ch * 4);
      for (let row = 0; row < ch; row++) {
        for (let col = 0; col < cw; col++) {
          const si = ((y + row) * w + (x + col)) * 4;
          const di = (row * cw + col) * 4;
          out[di] = src[si]!;
          out[di + 1] = src[si + 1]!;
          out[di + 2] = src[si + 2]!;
          out[di + 3] = src[si + 3]!;
        }
      }
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      return {
        ...state,
        working: new ImageData(out, cw, ch),
        transform: { rotation: 0, flipH: false, flipV: false, crop: null },
        history: { past, future: [] },
      };
    }
    case 'APPLY_CROP': {
      if (!state.working || !state.transform.crop) return state;
      return reduce(state, { type: 'CROP', payload: state.transform.crop }, maxHistory);
    }
    case 'ROTATE': {
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      const rotation = ((state.transform.rotation + action.payload) % 360) as 0 | 90 | 180 | 270;
      return {
        ...state,
        transform: { ...state.transform, rotation },
        history: { past, future: [] },
      };
    }
    case 'FLIP': {
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      const transform: Transform = { ...state.transform };
      if (action.payload === 'h') transform.flipH = !transform.flipH;
      else transform.flipV = !transform.flipV;
      return {
        ...state,
        transform,
        history: { past, future: [] },
      };
    }
    case 'UNDO': {
      const [entry, ...rest] = state.history.past;
      if (!entry) return state;
      const current = snapshot(state);
      return applyEntry(
        { ...state, history: { past: rest, future: [current, ...state.history.future] } },
        entry,
      );
    }
    case 'REDO': {
      const [entry, ...rest] = state.history.future;
      if (!entry) return state;
      const current = snapshot(state);
      return applyEntry(
        { ...state, history: { past: [current, ...state.history.past], future: rest } },
        entry,
      );
    }
    case 'RESET': {
      if (!state.original) return state;
      const past = [snapshot(state), ...state.history.past].slice(0, maxHistory);
      return {
        ...state,
        working: new ImageData(
          new Uint8ClampedArray(state.original.data),
          state.original.width,
          state.original.height,
        ),
        transform: { rotation: 0, flipH: false, flipV: false, crop: null },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        filter: null,
        history: { past, future: [] },
      };
    }
    default:
      return state;
  }
}
