import {
  DEFAULT_ALLOWED_EXTENSIONS,
  type FrameletOptions,
  type ImageSizeLimit,
  type ImageSource,
} from './types';

export interface ValidationOptions {
  allowedExtensions: readonly string[];
  maxFileSizeBytes?: number;
  maxImageSize?: ImageSizeLimit;
}

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'image/bmp': ['bmp'],
  'image/x-ms-bmp': ['bmp'],
};

export function normalizeAllowedExtensions(extensions: readonly string[]): string[] {
  const normalized = extensions.map((extension) =>
    extension.trim().toLowerCase().replace(/^\./, ''),
  );
  return [...new Set(normalized.filter(Boolean))];
}

export function createValidationOptions(options: FrameletOptions): ValidationOptions {
  const result: ValidationOptions = {
    allowedExtensions: normalizeAllowedExtensions(
      options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS,
    ),
  };
  if (options.maxFileSizeBytes !== undefined) {
    result.maxFileSizeBytes = options.maxFileSizeBytes;
  }
  if (options.maxImageSize !== undefined) result.maxImageSize = options.maxImageSize;
  return result;
}

export function validateFileSource(source: ImageSource, options: ValidationOptions): void {
  if (typeof Blob === 'undefined' || !(source instanceof Blob)) return;

  const allowed = new Set(options.allowedExtensions);
  let extension: string | undefined;
  let type: string | undefined;

  if (typeof File !== 'undefined' && source instanceof File) {
    const dot = source.name.lastIndexOf('.');
    if (dot > 0) {
      extension = source.name.slice(dot + 1).toLowerCase();
    } else {
      type = source.type.toLowerCase() || undefined;
      if (!type && source.name) {
        throw new Error(
          `File "${source.name}" must have an extension. Allowed extensions: ${formatAllowedExtensions(options.allowedExtensions)}.`,
        );
      }
    }
  } else {
    type = source.type.toLowerCase() || undefined;
  }

  if (extension !== undefined) {
    if (!allowed.has(extension)) {
      throw new Error(
        `File extension ".${extension}" is not allowed. Allowed extensions: ${formatAllowedExtensions(options.allowedExtensions)}.`,
      );
    }
  } else if (type !== undefined) {
    const extensions = MIME_EXTENSIONS[type] ?? [];
    if (!extensions.some((candidate) => allowed.has(candidate))) {
      throw new Error(
        `File type "${type}" is not allowed. Allowed extensions: ${formatAllowedExtensions(options.allowedExtensions)}.`,
      );
    }
  }

  if (options.maxFileSizeBytes !== undefined && source.size > options.maxFileSizeBytes) {
    throw new Error(
      `File size (${formatBytes(source.size)}) exceeds the maximum of ${formatBytes(options.maxFileSizeBytes)}.`,
    );
  }
}

export function validateImageSize(data: ImageData, options: ValidationOptions): void {
  const limit = options.maxImageSize;
  if (!limit) return;

  if (limit.width !== undefined && data.width > limit.width) {
    throw new Error(`Image width ${data.width}px exceeds the maximum of ${limit.width}px.`);
  }
  if (limit.height !== undefined && data.height > limit.height) {
    throw new Error(`Image height ${data.height}px exceeds the maximum of ${limit.height}px.`);
  }
  if (limit.pixels !== undefined && data.width * data.height > limit.pixels) {
    throw new Error(
      `Image size ${data.width}×${data.height} (${data.width * data.height} pixels) exceeds the maximum of ${limit.pixels} pixels.`,
    );
  }
}

function formatAllowedExtensions(extensions: readonly string[]): string {
  return extensions.length ? extensions.map((extension) => `.${extension}`).join(', ') : '(none)';
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
