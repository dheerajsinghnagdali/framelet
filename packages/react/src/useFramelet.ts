import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  createFramelet,
  type FrameletEditor,
  type FrameletOptions,
  type FrameletState,
  type ImageSource,
  type CropRect,
  type Adjustments,
} from '@framelet/core';

export interface UseFrameletResult {
  state: FrameletState;
  editor: FrameletEditor;
  loadImage: (source: ImageSource) => Promise<void>;
  setFilter: (id: Parameters<FrameletEditor['setFilter']>[0]) => void;
  setAdjustment: (key: keyof Adjustments, value: number) => void;
  setCrop: (rect: CropRect | null) => void;
  crop: (rect: CropRect) => void;
  applyCrop: () => void;
  rotate: (deg: 90 | 180 | 270) => void;
  flip: (axis: 'h' | 'v') => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  render: FrameletEditor['render'];
  exportImage: FrameletEditor['export'];
}

export function useFramelet(options?: FrameletOptions): UseFrameletResult {
  const [editor] = useState<FrameletEditor>(() => createFramelet(options));

  const state = useSyncExternalStore(editor.subscribe, editor.getState, editor.getState);

  useEffect(() => {
    return () => {
      editor.destroy();
    };
  }, [editor]);

  const loadImage = useCallback((source: ImageSource) => editor.loadImage(source), [editor]);
  const setFilter = useCallback(
    (id: Parameters<FrameletEditor['setFilter']>[0]) => editor.setFilter(id),
    [editor],
  );
  const setAdjustment = useCallback(
    (key: keyof Adjustments, value: number) => editor.setAdjustment(key, value),
    [editor],
  );
  const setCrop = useCallback((rect: CropRect | null) => editor.setCrop(rect), [editor]);
  const crop = useCallback((rect: CropRect) => editor.crop(rect), [editor]);
  const applyCrop = useCallback(() => editor.applyCrop(), [editor]);
  const rotate = useCallback((deg: 90 | 180 | 270) => editor.rotate(deg), [editor]);
  const flip = useCallback((axis: 'h' | 'v') => editor.flip(axis), [editor]);
  const undo = useCallback(() => editor.undo(), [editor]);
  const redo = useCallback(() => editor.redo(), [editor]);
  const reset = useCallback(() => editor.reset(), [editor]);
  const render = useCallback<FrameletEditor['render']>(
    (ctx, w, h) => editor.render(ctx, w, h),
    [editor],
  );
  const exportImage = useCallback<FrameletEditor['export']>(
    (opts) => editor.export(opts),
    [editor],
  );

  return {
    state,
    editor,
    loadImage,
    setFilter,
    setAdjustment,
    setCrop,
    crop,
    applyCrop,
    rotate,
    flip,
    undo,
    redo,
    reset,
    render,
    exportImage,
  };
}
