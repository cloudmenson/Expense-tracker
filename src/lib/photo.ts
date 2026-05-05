"use client";

/**
 * Resize + re-encode an image File to a base64 JPEG (or PNG) data URL.
 * Used to keep stored photos small (Mongo docs balloon quickly).
 */
export async function fileToCompressedDataUrl(
  file: File,
  opts: { maxSize?: number; quality?: number } = {},
): Promise<string> {
  const { maxSize = 1280, quality = 0.82 } = opts;

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}
