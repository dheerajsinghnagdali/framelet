import type { CSSProperties } from 'react';
import { Framelet, type FrameletRootProps } from '@framelet/react';

export type FrameletEditorProps = Omit<FrameletRootProps, 'children'>;

const buttonStyle: CSSProperties = {
  background: '#e8dcc8',
  color: '#3a2f25',
  border: '1px solid #d4b896',
  borderRadius: 6,
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: 13,
};

const viewportStyle: CSSProperties = {
  background: '#f5efe6',
  borderRadius: 12,
  overflow: 'hidden',
};

const filterControlStyle: CSSProperties = {
  marginTop: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const selectStyle: CSSProperties = {
  background: '#faf6f1',
  border: '1px solid #d4b896',
  borderRadius: 6,
  padding: '4px 12px 4px 8px',
  color: '#3a2f25',
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const listStyle: CSSProperties = {
  marginTop: 12,
};

export function FrameletEditor(props: FrameletEditorProps) {
  return (
    <Framelet.Root {...props}>
      <Framelet.Viewport style={viewportStyle}>
        <Framelet.Canvas />
        <Framelet.DropIndicator />
        <Framelet.EmptyState />
        <Framelet.CropOverlay>
          <Framelet.CropSelection />
        </Framelet.CropOverlay>
      </Framelet.Viewport>

      <Framelet.Controls>
        <Framelet.FileInput />
        <Framelet.UploadTrigger style={buttonStyle}>Upload</Framelet.UploadTrigger>
        <Framelet.CropTrigger style={buttonStyle}>Crop</Framelet.CropTrigger>
        <Framelet.ApplyCropTrigger style={buttonStyle}>Apply Crop</Framelet.ApplyCropTrigger>
        <Framelet.CancelCropTrigger style={buttonStyle}>Cancel</Framelet.CancelCropTrigger>
        <Framelet.RotateTrigger style={buttonStyle}>Rotate</Framelet.RotateTrigger>
        <Framelet.FlipHorizontalTrigger style={buttonStyle}>Flip H</Framelet.FlipHorizontalTrigger>
        <Framelet.FlipVerticalTrigger style={buttonStyle}>Flip V</Framelet.FlipVerticalTrigger>
        <Framelet.UndoTrigger style={buttonStyle}>Undo</Framelet.UndoTrigger>
        <Framelet.RedoTrigger style={buttonStyle}>Redo</Framelet.RedoTrigger>
        <Framelet.ResetTrigger style={buttonStyle}>Reset</Framelet.ResetTrigger>
      </Framelet.Controls>

      <Framelet.FilterControl style={filterControlStyle}>
        <Framelet.FilterSelect style={selectStyle} />
      </Framelet.FilterControl>

      <Framelet.AdjustmentList style={listStyle} />
    </Framelet.Root>
  );
}
