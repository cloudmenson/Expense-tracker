"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Area } from "react-easy-crop";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = size;
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
    size,
    size,
  );

  return canvas.toDataURL("image/webp", 0.88);
}

export function ImageCropModal({
  open,
  imageSrc,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
    onConfirm(dataUrl);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Обрізати фото"
      size="sm"
      closeOnOverlay={false}
    >
      <div className="space-y-4">
        {/* Crop area */}
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: "1rem" },
              cropAreaStyle: { border: "2px solid rgba(255,255,255,0.7)" },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-foreground/40">－</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-rose-500"
          />
          <span className="text-xs text-foreground/40">＋</span>
        </div>

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
