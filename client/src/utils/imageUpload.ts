import axios from 'axios';
import api from '../api/client';

// Mirror of the server's accept rules (server/src/lib/imageUpload.ts).
const SERVER_ACCEPTED = /^image\/(jpe?g|png|webp|gif)$/;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
// Compress toward well under the cap so the upload never brushes the limit.
const TARGET_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const JPEG_QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];

export class ImageUploadError extends Error {}

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new ImageUploadError(
      "This photo format can't be read by your browser (iPhone HEIC photos are a common case). Convert it to JPG or PNG and try again."
    );
  }
}

// Downscale + re-encode to JPEG until it fits. Animated GIFs lose animation
// here, but GIFs under the limit are uploaded untouched and never reach this.
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await decodeToBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageUploadError('Could not process the image in this browser.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let smallest: Blob | null = null;
  for (const quality of JPEG_QUALITY_STEPS) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) continue;
    if (blob.size <= TARGET_BYTES) return blob;
    if (!smallest || blob.size < smallest.size) smallest = blob;
  }
  if (smallest && smallest.size <= MAX_UPLOAD_BYTES) return smallest;
  throw new ImageUploadError('Could not shrink this image under 8MB — try a smaller photo.');
}

async function toUploadable(file: File): Promise<{ blob: Blob; filename: string }> {
  if (SERVER_ACCEPTED.test(file.type) && file.size <= MAX_UPLOAD_BYTES) {
    return { blob: file, filename: file.name };
  }
  const blob = await compressImage(file);
  const base = file.name.replace(/\.[^.]*$/, '') || 'image';
  return { blob, filename: `${base}.jpg` };
}

// Upload an image the admin picked, auto-shrinking anything too big or in a
// canvas-decodable format the server doesn't accept. Returns the parsed
// response body (e.g. { success, url } for /admin/upload).
export async function postImageForm<T>(
  endpoint: string,
  file: File,
  extraFields?: Record<string, string>
): Promise<T> {
  const { blob, filename } = await toUploadable(file);
  const fd = new FormData();
  fd.append('image', blob, filename);
  for (const [key, value] of Object.entries(extraFields ?? {})) fd.append(key, value);
  const { data } = await api.post<T>(endpoint, fd);
  return data;
}

export function uploadErrorMessage(err: unknown): string {
  if (err instanceof ImageUploadError) return err.message;
  if (axios.isAxiosError(err)) {
    const serverError = (err.response?.data as { error?: string } | undefined)?.error;
    if (serverError) return serverError;
    if (err.response?.status === 413) return 'Image is too large — maximum size is 8MB.';
    if (!err.response) return 'Connection problem — check your internet and try again.';
  }
  return 'Upload failed — please try again.';
}
