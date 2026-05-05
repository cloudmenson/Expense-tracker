"use client";

import { X } from "lucide-react";

interface ImagePreviewModalProps {
  src: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-full rounded-2xl object-contain"
      />
    </div>
  );
}
