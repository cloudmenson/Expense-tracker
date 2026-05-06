"use client";

import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Square, RectangleHorizontal, RectangleVertical, Maximize2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Area } from "react-easy-crop";

type AspectKey = "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "free";

interface AspectPreset {
  key: AspectKey;
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
}

const PRESETS: AspectPreset[] = [
  { key: "1:1", label: "1:1", value: 1, icon: Square },
  { key: "4:3", label: "4:3", value: 4 / 3, icon: RectangleHorizontal },
  { key: "16:9", label: "16:9", value: 16 / 9, icon: RectangleHorizontal },
  { key: "3:4", label: "3:4", value: 3 / 4, icon: RectangleVertical },
  { key: "9:16", label: "9:16", value: 9 / 16, icon: RectangleVertical },
];

const FREE_PRESET: AspectPreset = {
  key: "free",
  label: "Авто",
  value: undefined,
  icon: Maximize2,
};

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
  /** Default crop aspect ratio (selected preset on open). Default 1 (square). */
  aspect?: number;
  /** Output longest-edge size in pixels. Default 256. */
  outputSize?: number;
  /** Crop shape: "round" (default) or "rect". */
  cropShape?: "round" | "rect";
  /** Modal title. */
  title?: string;
  /** Output mime type, default image/webp. */
  outputType?: "image/webp" | "image/jpeg" | "image/png";
  /** Output quality 0..1. */
  outputQuality?: number;
  /** Show aspect-ratio preset picker (default true). Pass false to lock aspect. */
  showAspectPresets?: boolean;
  /** Allow "Як є" preset that ships the image without cropping (default true). */
  allowFree?: boolean;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputSize: number,
  outputType: string,
  outputQuality: number,
): Promise<string> {
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageSrc;
  });

  const ratio = pixelCrop.width / pixelCrop.height;
  let outW: number;
  let outH: number;
  if (ratio >= 1) {
    outW = outputSize;
    outH = Math.round(outputSize / ratio);
  } else {
    outH = outputSize;
    outW = Math.round(outputSize * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_failed");

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH,
  );

  return canvas.toDataURL(outputType, outputQuality);
}

/** Resize the source image preserving its aspect ratio (for "Як є" preset). */
async function resizeImg(
  imageSrc: string,
  longestEdge: number,
  outputType: string,
  outputQuality: number,
): Promise<string> {
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageSrc;
  });

  const ratio = Math.min(1, longestEdge / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_failed");

  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(outputType, outputQuality);
}

function findInitialPreset(aspect: number): AspectKey {
  const closest = PRESETS.reduce<{ key: AspectKey; diff: number }>(
    (best, p) => {
      if (p.value === undefined) return best;
      const d = Math.abs(p.value - aspect);
      return d < best.diff ? { key: p.key, diff: d } : best;
    },
    { key: "1:1", diff: Infinity },
  );
  return closest.key;
}

export function ImageCropModal({
  open,
  imageSrc,
  onCancel,
  onConfirm,
  aspect = 1,
  outputSize = 256,
  cropShape = "round",
  title = "Обрізати фото",
  outputType = "image/webp",
  outputQuality = 0.88,
  showAspectPresets = true,
  allowFree = true,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [presetKey, setPresetKey] = useState<AspectKey>(() =>
    findInitialPreset(aspect),
  );

  // Reset state when a new image opens
  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setPresetKey(findInitialPreset(aspect));
    }
  }, [open, imageSrc, aspect]);

  const allPresets = allowFree ? [...PRESETS, FREE_PRESET] : PRESETS;
  const currentPreset = allPresets.find((p) => p.key === presetKey) ?? PRESETS[0];
  const effectiveAspect = currentPreset.value;

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (presetKey === "free") {
      const dataUrl = await resizeImg(
        imageSrc,
        outputSize,
        outputType,
        outputQuality,
      );
      onConfirm(dataUrl);
      return;
    }
    if (!croppedAreaPixels) return;
    const dataUrl = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      outputSize,
      outputType,
      outputQuality,
    );
    onConfirm(dataUrl);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnOverlay={false}
    >
      <div className="space-y-4">
        {/* Crop area */}
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black">
          {presetKey === "free" ? (
            // No-crop preview — show whole image fit (round mask if cropShape=round)
            <div className="flex h-full w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt=""
                className={cropShape === "round"
                  ? "max-h-full max-w-full rounded-full object-contain"
                  : "h-full w-full object-contain"}
              />
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={effectiveAspect ?? 1}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: "1rem" },
                cropAreaStyle: { border: "2px solid rgba(255,255,255,0.7)" },
              }}
            />
          )}
        </div>

        {/* Aspect presets */}
        {showAspectPresets && (
          <div className="flex items-center gap-1.5">
            {allPresets.map((p) => {
              const Icon = p.icon;
              const active = presetKey === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPresetKey(p.key)}
                  title={p.label}
                  aria-label={p.label}
                  className={`flex h-10 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold leading-none ${
                    active
                      ? "bg-active"
                      : "glass-pill text-foreground/55 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Zoom slider — hidden for "free" preview */}
        {presetKey !== "free" && (
          <div className="flex items-center gap-3 px-1">
            <span className="text-xs text-foreground/40">－</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: "var(--brand)" }}
            />
            <span className="text-xs text-foreground/40">＋</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            Скасувати
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => void handleConfirm()}
          >
            Застосувати
          </Button>
        </div>
      </div>
    </Modal>
  );
}
