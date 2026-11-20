export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  preservePng?: boolean;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível processar a imagem.")), type, quality);
  });
}

export async function resizeImageFile(file: File, options: ResizeOptions): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, options.maxWidth / bitmap.width, options.maxHeight / bitmap.height);
    if (scale === 1 && file.size <= 1024 * 1024) return file;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponível no navegador.");
    context.drawImage(bitmap, 0, 0, width, height);
    const keepPng = options.preservePng && file.type === "image/png";
    const type = keepPng ? "image/png" : "image/webp";
    const blob = await canvasToBlob(canvas, type, keepPng ? undefined : options.quality ?? 0.85);
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.${keepPng ? "png" : "webp"}`, { type, lastModified: Date.now() });
  } finally { bitmap.close(); }
}
