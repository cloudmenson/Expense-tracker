"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ImageViewerModalProps {
  src: string | null;
  onClose: () => void;
  alt?: string;
}

/**
 * Full-screen image lightbox.
 * Uses Radix Dialog Portal so it renders at document.body — avoids any
 * parent `transform`/`filter` creating a broken stacking context.
 * Image is centered on the device viewport, fits entirely (object-contain).
 * Tap-to-close on backdrop, X button top-right.
 */
export function ImageViewerModal({
  src,
  onClose,
  alt = "",
}: ImageViewerModalProps) {
  const open = !!src;
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  // Reset zoom whenever a new image opens
  useEffect(() => {
    if (open) {
      setScale(1);
      setOrigin({ x: 50, y: 50 });
    }
  }, [open, src]);

  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setScale((s) => (s === 1 ? 2 : 1));
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150"
        />
        <DialogPrimitive.Content
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center outline-none p-4 sm:p-8"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Перегляд фото
          </DialogPrimitive.Title>

          <DialogPrimitive.Close
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30"
            style={{
              top: "max(16px, env(safe-area-inset-top, 0px))",
              right: "max(16px, env(safe-area-inset-right, 0px))",
            }}
            aria-label="Закрити"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onClick={onImageClick}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
                cursor: scale === 1 ? "zoom-in" : "zoom-out",
              }}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
