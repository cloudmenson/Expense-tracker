"use client";

import { useState } from "react";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";

interface PersonAvatarProps {
  name: string;
  color: string;
  avatarImage?: string;
  /** xs=16px  sm=24px  md=36px  lg=56px */
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  /** When true and avatarImage is present, clicking opens a full-screen viewer. */
  viewable?: boolean;
}

const SIZE_CLS = {
  xs: "h-5 w-5 text-[8px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-15 w-15 text-xl",
} as const;

export function PersonAvatar({
  name,
  color,
  avatarImage,
  size = "sm",
  className = "",
  viewable = false,
}: PersonAvatarProps) {
  const [viewing, setViewing] = useState(false);
  const cls = `${SIZE_CLS[size]} shrink-0 rounded-full object-cover ring-2 ring-white/20 shadow-[0_10px_24px_rgba(18,32,57,0.12)] ${className}`;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarImage) {
    if (viewable) {
      return (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewing(true);
            }}
            className={`${cls} block cursor-zoom-in p-0`}
            aria-label={`Переглянути фото ${name}`}
            style={{ background: "transparent" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarImage}
              alt={name}
              className="h-full w-full rounded-full object-cover"
            />
          </button>
          <ImageViewerModal
            src={viewing ? avatarImage : null}
            onClose={() => setViewing(false)}
            alt={name}
          />
        </>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarImage} alt={name} className={cls} />
    );
  }

  return (
    <span
      className={`flex items-center justify-center font-bold text-white ${cls}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}
