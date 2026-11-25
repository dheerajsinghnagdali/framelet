import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Framelet } from './Framelet';
import { frameletParts } from './anatomy';
import { useFrameletContext } from './framelet-context';

function Loader() {
  const api = useFrameletContext();
  useEffect(() => {
    void api.actions.loadImage(new ImageData(2, 2)).catch(() => {});
  }, [api.actions]);
  return null;
}

describe('Framelet', () => {
  it('throws when a part is rendered outside a root', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Framelet.Canvas />)).toThrow(
      /Framelet parts must be rendered inside <Framelet.Root>/,
    );

    consoleError.mockRestore();
  });

  it('renders compound parts with anatomy attributes', () => {
    const { container } = render(
      <Framelet.Root>
        <Framelet.Viewport>
          <Framelet.Canvas />
        </Framelet.Viewport>
        <Framelet.Controls>
          <Framelet.UploadTrigger />
        </Framelet.Controls>
      </Framelet.Root>,
    );

    expect(container.querySelector(frameletParts.root.selector)).not.toBeNull();
    expect(container.querySelector(frameletParts.viewport.selector)).not.toBeNull();
    expect(container.querySelector(frameletParts.canvas.selector)).not.toBeNull();
    expect(container.querySelector(frameletParts['upload-trigger'].selector)).not.toBeNull();
  });

  it('allows custom children to use context getters', () => {
    function CustomFilter() {
      const api = useFrameletContext();
      return <select aria-label="custom filter" {...api.getFilterSelectProps()} />;
    }

    render(
      <Framelet.Root>
        <CustomFilter />
      </Framelet.Root>,
    );

    expect(screen.getByLabelText('custom filter')).toHaveAttribute('data-part', 'filter-select');
  });

  it('switches controls when crop mode is entered', async () => {
    render(
      <Framelet.Root>
        <Loader />
        <Framelet.Viewport>
          <Framelet.Canvas />
          <Framelet.CropOverlay>
            <Framelet.CropSelection />
          </Framelet.CropOverlay>
        </Framelet.Viewport>
        <Framelet.Controls>
          <Framelet.CropTrigger />
          <Framelet.ApplyCropTrigger />
          <Framelet.CancelCropTrigger />
        </Framelet.Controls>
      </Framelet.Root>,
    );

    const cropButton = screen.getByRole('button', { name: 'Crop' });
    await waitFor(() => expect(cropButton).toBeEnabled());

    fireEvent.click(cropButton);

    expect(screen.queryByRole('button', { name: 'Crop' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply Crop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(document.querySelectorAll(frameletParts['crop-handle'].selector)).toHaveLength(4);
  });
});
