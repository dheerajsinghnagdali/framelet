import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_ALLOWED_EXTENSIONS, createFramelet } from './index';
import { sourceToImageData } from './image';

vi.mock('./image', () => ({
  sourceToImageData: vi.fn(),
}));

function file(name: string, size = 4): File {
  return new File([new Uint8Array(size)], name);
}

describe('image source validation', () => {
  beforeEach(() => {
    vi.mocked(sourceToImageData).mockReset();
    vi.mocked(sourceToImageData).mockResolvedValue(new ImageData(10, 10));
  });

  it('accepts the default popular extensions regardless of case', async () => {
    const editor = createFramelet();

    for (const extension of DEFAULT_ALLOWED_EXTENSIONS) {
      await expect(
        editor.loadImage(file(`photo.${extension.toUpperCase()}`)),
      ).resolves.toBeUndefined();
    }
  });

  it('rejects extensions outside the default list', async () => {
    const editor = createFramelet();

    await expect(editor.loadImage(file('vector.svg'))).rejects.toThrow(
      /extension "\.svg" is not allowed/,
    );
    expect(editor.getState().status).toBe('error');
    expect(editor.getState().error?.message).toContain('.svg');
  });

  it('rejects files with no extension', async () => {
    const editor = createFramelet();

    await expect(editor.loadImage(file('photo'))).rejects.toThrow(/must have an extension/);
  });

  it('normalizes a custom allowlist', async () => {
    const editor = createFramelet({ allowedExtensions: ['.PNG', 'jpeg', 'PNG'] });

    await expect(editor.loadImage(file('PHOTO.png'))).resolves.toBeUndefined();
    await expect(editor.loadImage(file('photo.jpeg'))).resolves.toBeUndefined();
    await expect(editor.loadImage(file('photo.jpg'))).rejects.toThrow(
      /extension "\.jpg" is not allowed/,
    );
  });

  it('treats an empty allowlist as rejecting every file', async () => {
    const editor = createFramelet({ allowedExtensions: [] });

    await expect(editor.loadImage(file('photo.png'))).rejects.toThrow(
      /Allowed extensions: \(none\)/,
    );
  });

  it('infers the extension of a Blob from its MIME type', async () => {
    const editor = createFramelet();
    const png = new Blob([new Uint8Array(4)], { type: 'image/png' });
    const svg = new Blob([new Uint8Array(4)], { type: 'image/svg+xml' });

    await expect(editor.loadImage(png)).resolves.toBeUndefined();
    await expect(editor.loadImage(svg)).rejects.toThrow(/type "image\/svg\+xml" is not allowed/);
  });

  it('enforces maxFileSizeBytes before decoding', async () => {
    const editor = createFramelet({ maxFileSizeBytes: 4 });

    await expect(editor.loadImage(file('large.png', 8))).rejects.toThrow(/exceeds the maximum/);
    expect(sourceToImageData).not.toHaveBeenCalled();
    await expect(editor.loadImage(file('ok.png', 4))).resolves.toBeUndefined();
  });

  it('enforces maxImageSize width, height, and pixel limits', async () => {
    const wide = createFramelet({ maxImageSize: { width: 1000 } });
    vi.mocked(sourceToImageData).mockResolvedValueOnce(new ImageData(4000, 100));
    await expect(wide.loadImage(file('wide.png'))).rejects.toThrow(
      /width 4000px exceeds the maximum of 1000px/,
    );

    const tall = createFramelet({ maxImageSize: { height: 1000 } });
    vi.mocked(sourceToImageData).mockResolvedValueOnce(new ImageData(10, 3000));
    await expect(tall.loadImage(file('tall.png'))).rejects.toThrow(
      /height 3000px exceeds the maximum of 1000px/,
    );

    const manyPixels = createFramelet({ maxImageSize: { pixels: 5000 } });
    vi.mocked(sourceToImageData).mockResolvedValueOnce(new ImageData(100, 100));
    await expect(manyPixels.loadImage(file('pixels.png'))).rejects.toThrow(
      /exceeds the maximum of 5000 pixels/,
    );
  });

  it('does not impose size or dimension limits by default', async () => {
    vi.mocked(sourceToImageData).mockResolvedValueOnce(new ImageData(2000, 1000));

    await expect(
      createFramelet().loadImage(file('large.png', 10_000_000)),
    ).resolves.toBeUndefined();
  });

  it('skips file validation for non-file sources', async () => {
    const editor = createFramelet({ allowedExtensions: ['png'] });

    await expect(editor.loadImage(new ImageData(2, 2))).resolves.toBeUndefined();
  });

  it('reports failures through error state, onChange, and subscribers', async () => {
    const onChange = vi.fn();
    const listener = vi.fn();
    const editor = createFramelet({ onChange });
    editor.subscribe(listener);

    await expect(editor.loadImage(file('vector.svg'))).rejects.toThrow();

    expect(editor.getState().status).toBe('error');
    expect(editor.getState().error?.message).toContain('.svg');
    expect(onChange).toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();
  });
});
