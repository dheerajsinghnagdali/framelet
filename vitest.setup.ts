import '@testing-library/jest-dom/vitest';

if (typeof globalThis.ImageData === 'undefined') {
  class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (typeof dataOrWidth === 'number') {
        const w = dataOrWidth;
        const h = widthOrHeight;
        this.width = w;
        this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      } else {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height as number;
      }
    }
  }
  // @ts-expect-error polyfill
  globalThis.ImageData = ImageDataPolyfill;
}
