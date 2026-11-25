import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type {
  ChangeEvent,
  ComponentPropsWithRef,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import {
  createFramelet,
  normalizeAllowedExtensions,
  DEFAULT_ALLOWED_EXTENSIONS,
  type Adjustments,
  type CropRect,
  type FilterId,
  type FrameletEditor,
  type FrameletOptions,
  type FrameletState,
  type ImageSource,
} from '@framelet/core';
import { frameletParts } from './anatomy';
import { mergeProps, type AnatomyAttributes, type PropGetter } from './prop-getter-utils';

type DivProps = ComponentPropsWithRef<'div'>;
type ButtonProps = ComponentPropsWithRef<'button'>;
type InputProps = ComponentPropsWithRef<'input'>;
type LabelProps = ComponentPropsWithRef<'label'>;
type CanvasProps = ComponentPropsWithRef<'canvas'>;
type SelectProps = ComponentPropsWithRef<'select'>;
type OptionProps = ComponentPropsWithRef<'option'>;
type SpanProps = ComponentPropsWithRef<'span'>;
type AdjustmentProps<P> = P & { adjustment: keyof Adjustments };

export type CropHandleCorner = 'nw' | 'ne' | 'sw' | 'se';
type DragMode = CropHandleCorner | 'move';

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  startRect: CropRect;
}

export interface UseFrameletOptions extends FrameletOptions {
  src?: ImageSource;
  width?: number;
  height?: number;
}

export interface FrameletActions {
  loadImage: (source: ImageSource) => Promise<void>;
  setFilter: (id: FilterId | null) => void;
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
  openFilePicker: () => void;
  handleFiles: (files: FileList | null) => void;
  startCrop: () => void;
  commitCrop: () => void;
  cancelCrop: () => void;
  setCropRect: (rect: CropRect | null) => void;
}

export interface FrameletMeta {
  rootRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  width: number;
  height: number;
  scale: number;
  displayWidth: number;
  displayHeight: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  cropMode: boolean;
  cropRect: CropRect | null;
  canCrop: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export interface FrameletGetters {
  getRootProps: PropGetter<DivProps>;
  getViewportProps: (
    props?: DivProps & { width?: number; height?: number },
  ) => DivProps & AnatomyAttributes;
  getCanvasProps: PropGetter<CanvasProps>;
  getDropIndicatorProps: PropGetter<DivProps>;
  getEmptyStateProps: PropGetter<DivProps>;
  getControlsProps: PropGetter<DivProps>;
  getFileInputProps: PropGetter<InputProps>;
  getUploadTriggerProps: PropGetter<ButtonProps>;
  getCropTriggerProps: PropGetter<ButtonProps>;
  getApplyCropTriggerProps: PropGetter<ButtonProps>;
  getCancelCropTriggerProps: PropGetter<ButtonProps>;
  getRotateTriggerProps: (
    props?: ButtonProps & { degrees?: 90 | 180 | 270 },
  ) => ButtonProps & AnatomyAttributes;
  getFlipHorizontalTriggerProps: PropGetter<ButtonProps>;
  getFlipVerticalTriggerProps: PropGetter<ButtonProps>;
  getUndoTriggerProps: PropGetter<ButtonProps>;
  getRedoTriggerProps: PropGetter<ButtonProps>;
  getResetTriggerProps: PropGetter<ButtonProps>;
  getFilterControlProps: PropGetter<LabelProps>;
  getFilterSelectProps: PropGetter<SelectProps>;
  getFilterOptionProps: (props: OptionProps & { id: FilterId }) => OptionProps & AnatomyAttributes;
  getAdjustmentListProps: PropGetter<DivProps>;
  getAdjustmentControlProps: (props: AdjustmentProps<DivProps>) => DivProps & AnatomyAttributes;
  getAdjustmentLabelProps: (props: AdjustmentProps<SpanProps>) => SpanProps & AnatomyAttributes;
  getAdjustmentSliderProps: (props: AdjustmentProps<InputProps>) => InputProps & AnatomyAttributes;
  getAdjustmentValueProps: (props: AdjustmentProps<SpanProps>) => SpanProps & AnatomyAttributes;
  getCropOverlayProps: PropGetter<DivProps>;
  getCropSelectionProps: PropGetter<DivProps>;
  getCropHandleProps: (
    props: ComponentPropsWithRef<'span'> & { corner: CropHandleCorner },
  ) => SpanProps & AnatomyAttributes;
}

export interface UseFrameletResult extends FrameletGetters {
  state: FrameletState;
  editor: FrameletEditor;
  actions: FrameletActions;
  meta: FrameletMeta;
  loadImage: FrameletActions['loadImage'];
  setFilter: FrameletActions['setFilter'];
  setAdjustment: FrameletActions['setAdjustment'];
  setCrop: FrameletActions['setCrop'];
  crop: FrameletActions['crop'];
  applyCrop: FrameletActions['applyCrop'];
  rotate: FrameletActions['rotate'];
  flip: FrameletActions['flip'];
  undo: FrameletActions['undo'];
  redo: FrameletActions['redo'];
  reset: FrameletActions['reset'];
  render: FrameletActions['render'];
  exportImage: FrameletActions['exportImage'];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useFramelet(options: UseFrameletOptions = {}): UseFrameletResult {
  const { src, width = 480, height = 480 } = options;
  const accept = normalizeAllowedExtensions(options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS)
    .map((extension) => `.${extension}`)
    .join(',');

  const [editor] = useState(() => {
    const coreOptions: FrameletOptions = {};
    if (options.maxHistory !== undefined) coreOptions.maxHistory = options.maxHistory;
    if (options.onChange !== undefined) coreOptions.onChange = options.onChange;
    if (options.allowedExtensions !== undefined) {
      coreOptions.allowedExtensions = options.allowedExtensions;
    }
    if (options.maxFileSizeBytes !== undefined) {
      coreOptions.maxFileSizeBytes = options.maxFileSizeBytes;
    }
    if (options.maxImageSize !== undefined) coreOptions.maxImageSize = options.maxImageSize;
    return createFramelet(coreOptions);
  });

  const state = useSyncExternalStore(editor.subscribe, editor.getState, editor.getState);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const loadImage = useCallback((source: ImageSource) => editor.loadImage(source), [editor]);
  const setFilter = useCallback((id: FilterId | null) => editor.setFilter(id), [editor]);
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

  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      void loadImage(file)
        .then(() => {
          setCropRect(null);
          setCropMode(false);
        })
        .catch(() => {});
    },
    [loadImage],
  );

  const startCrop = useCallback(() => {
    const image = editor.getState().working;
    if (!image) return;
    if (!cropRect) {
      setCropRect({ x: 0, y: 0, width: image.width, height: image.height });
    }
    setCropMode(true);
  }, [editor, cropRect]);

  const commitCrop = useCallback(() => {
    if (cropRect) editor.crop(cropRect);
    setCropMode(false);
    setCropRect(null);
  }, [editor, cropRect]);

  const cancelCrop = useCallback(() => setCropMode(false), []);

  const startDrag = useCallback(
    (mode: DragMode, event: ReactPointerEvent<HTMLElement>) => {
      if (!cropRect) return;
      event.stopPropagation();
      (event.target as Element).setPointerCapture?.(event.pointerId);
      setDrag({
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startRect: { ...cropRect },
      });
    },
    [cropRect],
  );

  const image = state.working;
  const scale = image ? Math.min(width / image.width, height / image.height) : 1;
  const displayWidth = image ? image.width * scale : width;
  const displayHeight = image ? image.height * scale : height;
  const offsetX = (width - displayWidth) / 2;
  const offsetY = (height - displayHeight) / 2;

  const moveCrop = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!drag || !image || !cropRect) return;
      const dx = (event.clientX - drag.startX) / scale;
      const dy = (event.clientY - drag.startY) / scale;
      const start = drag.startRect;
      const next: CropRect = { ...start };

      if (drag.mode === 'move') {
        next.x = clamp(start.x + dx, 0, image.width - start.width);
        next.y = clamp(start.y + dy, 0, image.height - start.height);
      } else {
        if (drag.mode.includes('w')) {
          const nx = clamp(start.x + dx, 0, start.x + start.width - 10);
          next.width = start.width + (start.x - nx);
          next.x = nx;
        }
        if (drag.mode.includes('e')) {
          next.width = clamp(start.width + dx, 10, image.width - start.x);
        }
        if (drag.mode.includes('n')) {
          const ny = clamp(start.y + dy, 0, start.y + start.height - 10);
          next.height = start.height + (start.y - ny);
          next.y = ny;
        }
        if (drag.mode.includes('s')) {
          next.height = clamp(start.height + dy, 10, image.height - start.y);
        }
      }

      next.x = clamp(next.x, 0, image.width - next.width);
      next.y = clamp(next.y, 0, image.height - next.height);
      next.width = clamp(next.width, 10, image.width - next.x);
      next.height = clamp(next.height, 10, image.height - next.y);
      setCropRect(next);
    },
    [cropRect, drag, image, scale],
  );

  const endDrag = useCallback(() => setDrag(null), []);

  useEffect(() => {
    return () => {
      editor.destroy();
    };
  }, [editor]);

  useEffect(() => {
    if (src === undefined) return;
    void loadImage(src).catch(() => {});
  }, [loadImage, src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    editor.render(ctx, width, height);
  }, [editor, height, state, width]);

  const actions = useMemo<FrameletActions>(
    () => ({
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
      openFilePicker,
      handleFiles,
      startCrop,
      commitCrop,
      cancelCrop,
      setCropRect,
    }),
    [
      applyCrop,
      cancelCrop,
      commitCrop,
      crop,
      exportImage,
      flip,
      handleFiles,
      loadImage,
      openFilePicker,
      redo,
      render,
      reset,
      rotate,
      setAdjustment,
      setCrop,
      setCropRect,
      setFilter,
      startCrop,
      undo,
    ],
  );

  const meta = useMemo<FrameletMeta>(
    () => ({
      rootRef,
      viewportRef,
      canvasRef,
      fileInputRef,
      width,
      height,
      scale,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      isDragging,
      cropMode,
      cropRect,
      canCrop: state.status === 'ready' && state.working !== null,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
    }),
    [
      cropMode,
      cropRect,
      displayHeight,
      displayWidth,
      height,
      isDragging,
      offsetX,
      offsetY,
      scale,
      state.history.future.length,
      state.history.past.length,
      state.status,
      state.working,
      width,
    ],
  );

  const getters = useMemo<FrameletGetters>(() => {
    const withPart = <P>(
      part: AnatomyAttributes,
      internal: object,
      user?: object,
    ): P & AnatomyAttributes =>
      mergeProps(part, internal, user) as unknown as P & AnatomyAttributes;

    return {
      getRootProps: (props) =>
        withPart(
          frameletParts.root.attrs,
          { ref: rootRef, style: { display: 'inline-block' } },
          props,
        ),

      getViewportProps: (props) => {
        const { width: propWidth, height: propHeight, ...rest } = props ?? {};
        return withPart(
          frameletParts.viewport.attrs,
          {
            ref: viewportRef,
            style: {
              position: 'relative',
              width: propWidth ?? width,
              height: propHeight ?? height,
            },
            onDragOver: (event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setIsDragging(true);
            },
            onDragLeave: () => setIsDragging(false),
            onDrop: (event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setIsDragging(false);
              handleFiles(event.dataTransfer.files);
            },
            onPointerMove: moveCrop,
            onPointerUp: endDrag,
          },
          rest,
        );
      },

      getCanvasProps: (props) =>
        withPart(frameletParts.canvas.attrs, { ref: canvasRef, width, height }, props),

      getDropIndicatorProps: (props) =>
        withPart(
          frameletParts['drop-indicator'].attrs,
          {
            style: {
              position: 'absolute',
              inset: 0,
              border: '2px dashed #4f8cff',
              pointerEvents: 'none',
            },
          },
          props,
        ),

      getEmptyStateProps: (props) =>
        withPart(
          frameletParts['empty-state'].attrs,
          {
            style: {
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9aa0a6',
              fontSize: 14,
              pointerEvents: 'none',
            },
          },
          props,
        ),

      getControlsProps: (props) =>
        withPart(
          frameletParts.controls.attrs,
          {
            style: {
              marginTop: 8,
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              alignItems: 'center',
            },
          },
          props,
        ),

      getFileInputProps: (props) =>
        withPart(
          frameletParts['file-input'].attrs,
          {
            ref: fileInputRef,
            type: 'file',
            accept,
            style: { display: 'none' },
            onChange: (event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files),
          },
          props,
        ),

      getUploadTriggerProps: (props) =>
        withPart(
          frameletParts['upload-trigger'].attrs,
          { type: 'button', onClick: openFilePicker },
          props,
        ),

      getCropTriggerProps: (props) =>
        withPart(
          frameletParts['crop-trigger'].attrs,
          { type: 'button', onClick: startCrop, disabled: !meta.canCrop },
          props,
        ),

      getApplyCropTriggerProps: (props) =>
        withPart(
          frameletParts['apply-crop-trigger'].attrs,
          { type: 'button', onClick: commitCrop, disabled: !cropRect },
          props,
        ),

      getCancelCropTriggerProps: (props) =>
        withPart(
          frameletParts['cancel-crop-trigger'].attrs,
          { type: 'button', onClick: cancelCrop, disabled: !cropMode },
          props,
        ),

      getRotateTriggerProps: (props) => {
        const { degrees = 90, ...rest } = props ?? {};
        return withPart(
          frameletParts['rotate-trigger'].attrs,
          { type: 'button', onClick: () => rotate(degrees) },
          rest,
        );
      },

      getFlipHorizontalTriggerProps: (props) =>
        withPart(
          frameletParts['flip-horizontal-trigger'].attrs,
          { type: 'button', onClick: () => flip('h') },
          props,
        ),

      getFlipVerticalTriggerProps: (props) =>
        withPart(
          frameletParts['flip-vertical-trigger'].attrs,
          { type: 'button', onClick: () => flip('v') },
          props,
        ),

      getUndoTriggerProps: (props) =>
        withPart(
          frameletParts['undo-trigger'].attrs,
          { type: 'button', onClick: undo, disabled: !meta.canUndo },
          props,
        ),

      getRedoTriggerProps: (props) =>
        withPart(
          frameletParts['redo-trigger'].attrs,
          { type: 'button', onClick: redo, disabled: !meta.canRedo },
          props,
        ),

      getResetTriggerProps: (props) =>
        withPart(
          frameletParts['reset-trigger'].attrs,
          { type: 'button', onClick: reset, disabled: state.original === null },
          props,
        ),

      getFilterControlProps: (props) =>
        withPart(frameletParts['filter-control'].attrs, { style: { fontSize: 13 } }, props),

      getFilterSelectProps: (props) =>
        withPart(
          frameletParts['filter-select'].attrs,
          {
            value: state.filter ?? 'none',
            onChange: (event: ChangeEvent<HTMLSelectElement>) =>
              setFilter(event.target.value === 'none' ? null : (event.target.value as FilterId)),
          },
          props,
        ),

      getFilterOptionProps: ({ id, ...props }) =>
        withPart(frameletParts['filter-option'].attrs, { value: id, children: id }, props),

      getAdjustmentListProps: (props) =>
        withPart(
          frameletParts['adjustment-list'].attrs,
          { style: { display: 'grid', gap: 8 } },
          props,
        ),

      getAdjustmentControlProps: ({ adjustment: _adjustment, ...props }) =>
        withPart(
          frameletParts['adjustment-control'].attrs,
          { style: { fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 } },
          props,
        ),

      getAdjustmentLabelProps: ({ adjustment, ...props }) =>
        withPart(
          frameletParts['adjustment-label'].attrs,
          { children: adjustment, style: { width: 90, textTransform: 'capitalize' } },
          props,
        ),

      getAdjustmentSliderProps: ({ adjustment, ...props }) =>
        withPart(
          frameletParts['adjustment-slider'].attrs,
          {
            type: 'range',
            min: -100,
            max: 100,
            value: state.adjustments[adjustment],
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setAdjustment(adjustment, Number(event.target.value)),
          },
          props,
        ),

      getAdjustmentValueProps: ({ adjustment, ...props }) =>
        withPart(
          frameletParts['adjustment-value'].attrs,
          { children: state.adjustments[adjustment], style: { width: 32, textAlign: 'right' } },
          props,
        ),

      getCropOverlayProps: (props) =>
        withPart(
          frameletParts['crop-overlay'].attrs,
          { style: { position: 'absolute', inset: 0, pointerEvents: 'none' } },
          props,
        ),

      getCropSelectionProps: (props) =>
        withPart(
          frameletParts['crop-selection'].attrs,
          {
            style: {
              position: 'absolute',
              left: offsetX + (cropRect?.x ?? 0) * scale,
              top: offsetY + (cropRect?.y ?? 0) * scale,
              width: (cropRect?.width ?? displayWidth) * scale,
              height: (cropRect?.height ?? displayHeight) * scale,
              border: '2px solid #fff',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
              cursor: 'move',
              pointerEvents: 'auto',
              ...(cropMode && cropRect && image ? {} : { display: 'none' }),
            },
            onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => startDrag('move', event),
          },
          props,
        ),

      getCropHandleProps: ({ corner, ...props }) =>
        withPart(
          frameletParts['crop-handle'].attrs,
          {
            style: {
              position: 'absolute',
              width: 12,
              height: 12,
              background: '#fff',
              border: '1px solid #000',
              ...(corner.includes('n') ? { top: -6 } : { bottom: -6 }),
              ...(corner.includes('w') ? { left: -6 } : { right: -6 }),
              cursor: `${corner}-resize`,
            },
            onPointerDown: (event: ReactPointerEvent<HTMLSpanElement>) => startDrag(corner, event),
          },
          props,
        ),
    };
  }, [
    accept,
    cancelCrop,
    commitCrop,
    cropMode,
    cropRect,
    displayHeight,
    displayWidth,
    endDrag,
    fileInputRef,
    flip,
    handleFiles,
    height,
    image,
    meta.canCrop,
    meta.canRedo,
    meta.canUndo,
    moveCrop,
    offsetX,
    offsetY,
    openFilePicker,
    redo,
    reset,
    rotate,
    scale,
    setAdjustment,
    setFilter,
    startCrop,
    startDrag,
    state.adjustments,
    state.filter,
    state.original,
    undo,
    width,
  ]);

  return useMemo(
    () => ({
      state,
      editor,
      actions,
      meta,
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
      ...getters,
    }),
    [
      actions,
      applyCrop,
      crop,
      editor,
      exportImage,
      flip,
      getters,
      loadImage,
      meta,
      redo,
      render,
      reset,
      rotate,
      setAdjustment,
      setCrop,
      setFilter,
      state,
      undo,
    ],
  );
}
