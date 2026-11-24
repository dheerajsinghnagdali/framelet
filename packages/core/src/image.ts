export async function sourceToImageData(source: unknown): Promise<ImageData> {
  if (source instanceof ImageData) {
    return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
  }

  if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
    const ctx = source.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2d context');
    return ctx.getImageData(0, 0, source.width, source.height);
  }

  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
    return imageElementToData(source);
  }

  if (typeof Blob !== 'undefined' && source instanceof Blob) {
    return blobToImageData(source);
  }

  if (typeof source === 'string') {
    return urlToImageData(source);
  }

  throw new Error('Unsupported image source');
}

function imageElementToData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get 2d context');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function blobToImageData(blob: Blob): Promise<ImageData> {
  const url = URL.createObjectURL(blob);
  try {
    return await urlToImageData(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function urlToImageData(url: string): Promise<ImageData> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
  return imageElementToData(img);
}
