import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FILTER_IDS, type Adjustments, type FilterId } from '@framelet/core';
import { FrameletContext, useFrameletContext } from './framelet-context';
import { useFramelet, type CropHandleCorner, type UseFrameletOptions } from './useFramelet';
import type { AnatomyAttributes } from './prop-getter-utils';

type DivProps = ComponentPropsWithRef<'div'>;
type ButtonProps = ComponentPropsWithRef<'button'>;
type InputProps = ComponentPropsWithRef<'input'>;
type LabelProps = ComponentPropsWithRef<'label'>;
type CanvasProps = ComponentPropsWithRef<'canvas'>;
type SelectProps = ComponentPropsWithRef<'select'>;
type OptionProps = ComponentPropsWithRef<'option'>;
type SpanProps = ComponentPropsWithRef<'span'>;

type ButtonGetter = (props?: ButtonProps) => ButtonProps & AnatomyAttributes;

interface FrameletButtonProps extends ButtonProps {
  children?: ReactNode;
}

export interface FrameletRootProps extends UseFrameletOptions {
  children?: ReactNode;
  className?: string;
  style?: DivProps['style'];
}

export interface FrameletViewportProps extends Omit<DivProps, 'width' | 'height'> {
  width?: number;
  height?: number;
}

export interface FrameletRotateTriggerProps extends FrameletButtonProps {
  degrees?: 90 | 180 | 270;
}

export interface FrameletAdjustmentProps {
  adjustment: keyof Adjustments;
}

export type FrameletAdjustmentControlProps = FrameletAdjustmentProps & DivProps;
export type FrameletAdjustmentLabelProps = FrameletAdjustmentProps & SpanProps;
export type FrameletAdjustmentSliderProps = FrameletAdjustmentProps & InputProps;
export type FrameletAdjustmentValueProps = FrameletAdjustmentProps & SpanProps;
export type FrameletCropHandleProps = ComponentPropsWithRef<'span'> & { corner: CropHandleCorner };

function FrameletButton({
  getter,
  children,
  ...props
}: FrameletButtonProps & { getter: ButtonGetter }) {
  return <button {...getter(props)}>{children}</button>;
}

export function FrameletRoot({ children, className, style, ...options }: FrameletRootProps) {
  const api = useFramelet(options);
  const rootProps: DivProps = {};
  if (className !== undefined) rootProps.className = className;
  if (style !== undefined) rootProps.style = style;

  return (
    <FrameletContext.Provider value={api}>
      <div {...api.getRootProps(rootProps)}>{children}</div>
    </FrameletContext.Provider>
  );
}

export function FrameletViewport({ children, width, height, ...props }: FrameletViewportProps) {
  const api = useFrameletContext();
  const getterProps: DivProps & { width?: number; height?: number } = { ...props };
  if (width !== undefined) getterProps.width = width;
  if (height !== undefined) getterProps.height = height;
  return <div {...api.getViewportProps(getterProps)}>{children}</div>;
}

export function FrameletCanvas(props: CanvasProps) {
  const api = useFrameletContext();
  return <canvas {...api.getCanvasProps(props)} />;
}

export function FrameletDropIndicator(props: DivProps) {
  const api = useFrameletContext();
  if (!api.meta.isDragging) return null;
  return <div {...api.getDropIndicatorProps(props)} />;
}

export function FrameletEmptyState({ children, ...props }: DivProps) {
  const api = useFrameletContext();
  if (api.state.status === 'ready' || api.meta.cropMode) return null;
  return (
    <div
      {...api.getEmptyStateProps({
        ...props,
        children: children ?? 'Drop an image here or use Upload',
      })}
    />
  );
}

export function FrameletControls({ children, ...props }: DivProps) {
  const api = useFrameletContext();
  return <div {...api.getControlsProps(props)}>{children}</div>;
}

export function FrameletFileInput(props: InputProps) {
  const api = useFrameletContext();
  return <input {...api.getFileInputProps(props)} />;
}

export function FrameletUploadTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getUploadTriggerProps}>
      {children ?? 'Upload'}
    </FrameletButton>
  );
}

export function FrameletCropTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  if (api.meta.cropMode) return null;
  return (
    <FrameletButton {...props} getter={api.getCropTriggerProps}>
      {children ?? 'Crop'}
    </FrameletButton>
  );
}

export function FrameletApplyCropTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  if (!api.meta.cropMode) return null;
  return (
    <FrameletButton {...props} getter={api.getApplyCropTriggerProps}>
      {children ?? 'Apply Crop'}
    </FrameletButton>
  );
}

export function FrameletCancelCropTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  if (!api.meta.cropMode) return null;
  return (
    <FrameletButton {...props} getter={api.getCancelCropTriggerProps}>
      {children ?? 'Cancel'}
    </FrameletButton>
  );
}

export function FrameletRotateTrigger({ degrees, children, ...props }: FrameletRotateTriggerProps) {
  const api = useFrameletContext();
  const getter: ButtonGetter = (getterProps) =>
    api.getRotateTriggerProps({ ...getterProps, ...(degrees === undefined ? {} : { degrees }) });
  return (
    <FrameletButton {...props} getter={getter}>
      {children ?? 'Rotate'}
    </FrameletButton>
  );
}

export function FrameletFlipHorizontalTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getFlipHorizontalTriggerProps}>
      {children ?? 'Flip H'}
    </FrameletButton>
  );
}

export function FrameletFlipVerticalTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getFlipVerticalTriggerProps}>
      {children ?? 'Flip V'}
    </FrameletButton>
  );
}

export function FrameletUndoTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getUndoTriggerProps}>
      {children ?? 'Undo'}
    </FrameletButton>
  );
}

export function FrameletRedoTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getRedoTriggerProps}>
      {children ?? 'Redo'}
    </FrameletButton>
  );
}

export function FrameletResetTrigger({ children, ...props }: FrameletButtonProps) {
  const api = useFrameletContext();
  return (
    <FrameletButton {...props} getter={api.getResetTriggerProps}>
      {children ?? 'Reset'}
    </FrameletButton>
  );
}

export function FrameletFilterControl({ children, ...props }: LabelProps) {
  const api = useFrameletContext();
  return (
    <label {...api.getFilterControlProps(props)}>
      {children ?? (
        <>
          Filter
          <FrameletFilterSelect />
        </>
      )}
    </label>
  );
}

export function FrameletFilterSelect({ children, ...props }: SelectProps) {
  const api = useFrameletContext();
  return (
    <select {...api.getFilterSelectProps(props)}>
      {children ?? FILTER_IDS.map((id) => <FrameletFilterOption key={id} id={id} />)}
    </select>
  );
}

export function FrameletFilterOption({ id, ...props }: OptionProps & { id: FilterId }) {
  const api = useFrameletContext();
  return <option {...api.getFilterOptionProps({ id, ...props })} />;
}

export function FrameletAdjustmentList({ children, ...props }: DivProps) {
  const api = useFrameletContext();
  const keys = Object.keys(api.state.adjustments) as Array<keyof Adjustments>;
  return (
    <div {...api.getAdjustmentListProps(props)}>
      {children ??
        keys.map((adjustment) => (
          <FrameletAdjustmentControl key={adjustment} adjustment={adjustment} />
        ))}
    </div>
  );
}

export function FrameletAdjustmentControl({
  adjustment,
  children,
  ...props
}: FrameletAdjustmentControlProps) {
  const api = useFrameletContext();
  return (
    <div {...api.getAdjustmentControlProps({ adjustment, ...props })}>
      {children ?? (
        <>
          <FrameletAdjustmentLabel adjustment={adjustment} />
          <FrameletAdjustmentSlider adjustment={adjustment} />
          <FrameletAdjustmentValue adjustment={adjustment} />
        </>
      )}
    </div>
  );
}

export function FrameletAdjustmentLabel({
  adjustment,
  children,
  ...props
}: FrameletAdjustmentLabelProps) {
  const api = useFrameletContext();
  return (
    <span
      {...api.getAdjustmentLabelProps({
        adjustment,
        ...props,
        children: children ?? adjustment,
      })}
    />
  );
}

export function FrameletAdjustmentSlider({ adjustment, ...props }: FrameletAdjustmentSliderProps) {
  const api = useFrameletContext();
  return <input {...api.getAdjustmentSliderProps({ adjustment, ...props })} />;
}

export function FrameletAdjustmentValue({
  adjustment,
  children,
  ...props
}: FrameletAdjustmentValueProps) {
  const api = useFrameletContext();
  const getterProps =
    children === undefined ? { adjustment, ...props } : { adjustment, ...props, children };
  return <span {...api.getAdjustmentValueProps(getterProps)} />;
}

export function FrameletCropOverlay({ children, ...props }: DivProps) {
  const api = useFrameletContext();
  if (!api.meta.cropMode || !api.meta.cropRect || !api.state.working) return null;
  return <div {...api.getCropOverlayProps(props)}>{children}</div>;
}

export function FrameletCropSelection({ children, ...props }: DivProps) {
  const api = useFrameletContext();
  const corners: CropHandleCorner[] = ['nw', 'ne', 'sw', 'se'];
  return (
    <div {...api.getCropSelectionProps(props)}>
      {children ?? corners.map((corner) => <FrameletCropHandle key={corner} corner={corner} />)}
    </div>
  );
}

export function FrameletCropHandle({ corner, ...props }: FrameletCropHandleProps) {
  const api = useFrameletContext();
  return <span {...api.getCropHandleProps({ corner, ...props })} />;
}

export const Framelet = {
  Root: FrameletRoot,
  Viewport: FrameletViewport,
  Canvas: FrameletCanvas,
  DropIndicator: FrameletDropIndicator,
  EmptyState: FrameletEmptyState,
  Controls: FrameletControls,
  FileInput: FrameletFileInput,
  UploadTrigger: FrameletUploadTrigger,
  CropTrigger: FrameletCropTrigger,
  ApplyCropTrigger: FrameletApplyCropTrigger,
  CancelCropTrigger: FrameletCancelCropTrigger,
  RotateTrigger: FrameletRotateTrigger,
  FlipHorizontalTrigger: FrameletFlipHorizontalTrigger,
  FlipVerticalTrigger: FrameletFlipVerticalTrigger,
  UndoTrigger: FrameletUndoTrigger,
  RedoTrigger: FrameletRedoTrigger,
  ResetTrigger: FrameletResetTrigger,
  FilterControl: FrameletFilterControl,
  FilterSelect: FrameletFilterSelect,
  FilterOption: FrameletFilterOption,
  AdjustmentList: FrameletAdjustmentList,
  AdjustmentControl: FrameletAdjustmentControl,
  AdjustmentLabel: FrameletAdjustmentLabel,
  AdjustmentSlider: FrameletAdjustmentSlider,
  AdjustmentValue: FrameletAdjustmentValue,
  CropOverlay: FrameletCropOverlay,
  CropSelection: FrameletCropSelection,
  CropHandle: FrameletCropHandle,
  Context: FrameletContext,
};
