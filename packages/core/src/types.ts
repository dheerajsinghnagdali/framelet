export type FilterId =
  | 'none'
  | 'clarendon'
  | 'gingham'
  | 'moon'
  | 'lark'
  | 'reyes'
  | 'juno'
  | 'slumber'
  | 'crema'
  | 'ludwig'
  | 'aden'
  | 'perpetua'
  | 'amaro'
  | 'mayfair'
  | 'rise'
  | 'hudson'
  | 'valencia'
  | 'xpro2'
  | 'sierra'
  | 'willow'
  | 'lofi'
  | 'inkwell'
  | 'hefe'
  | 'nashville'
  | 'toaster'
  | 'walden'
  | '1977'
  | 'kelvin';

export interface Adjustments {
  brightness: number; // -100..100
  contrast: number;
  saturation: number;
  warmth: number;
  highlights: number;
  shadows: number;
  vignette: number;
  sharpness: number;
  fade: number;
  grain: number;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  sharpness: 0,
  fade: 0,
  grain: 0,
};

export interface Transform {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  crop: CropRect | null;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageSource = string | Blob | File | HTMLImageElement | HTMLCanvasElement | ImageData;

export interface ExportOptions {
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
}

export interface HistoryEntry {
  adjustments: Adjustments;
  filter: FilterId | null;
  transform: Transform;
  working: ImageData | null;
}

export interface FrameletState {
  image: ImageSource | null;
  original: ImageData | null;
  working: ImageData | null;
  transform: Transform;
  adjustments: Adjustments;
  filter: FilterId | null;
  history: { past: HistoryEntry[]; future: HistoryEntry[] };
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: Error | null;
}

export type FrameletAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { source: ImageSource; data: ImageData } }
  | { type: 'LOAD_ERROR'; payload: Error }
  | { type: 'SET_FILTER'; payload: FilterId | null }
  | { type: 'SET_ADJUSTMENT'; payload: { key: keyof Adjustments; value: number } }
  | { type: 'SET_CROP'; payload: CropRect | null }
  | { type: 'CROP'; payload: CropRect }
  | { type: 'APPLY_CROP' }
  | { type: 'ROTATE'; payload: 90 | 180 | 270 }
  | { type: 'FLIP'; payload: 'h' | 'v' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

export const DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'avif',
  'bmp',
] as const;

export interface ImageSizeLimit {
  width?: number;
  height?: number;
  pixels?: number;
}

export interface FrameletOptions {
  maxHistory?: number;
  onChange?: (state: FrameletState) => void;
  allowedExtensions?: readonly string[];
  maxFileSizeBytes?: number;
  maxImageSize?: ImageSizeLimit;
}

export interface FrameletEditor {
  getState(): FrameletState;
  subscribe(listener: (state: FrameletState) => void): () => void;
  dispatch(action: FrameletAction): void;
  loadImage(source: ImageSource): Promise<void>;
  setFilter(id: FilterId | null): void;
  setAdjustment(key: keyof Adjustments, value: number): void;
  setCrop(rect: CropRect | null): void;
  crop(rect: CropRect): void;
  applyCrop(): void;
  rotate(deg: 90 | 180 | 270): void;
  flip(axis: 'h' | 'v'): void;
  undo(): void;
  redo(): void;
  reset(): void;
  render(ctx: CanvasRenderingContext2D, width?: number, height?: number): void;
  export(options?: ExportOptions): Promise<Blob>;
  destroy(): void;
}
