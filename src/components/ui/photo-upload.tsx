"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string;
  onChange: (data: string) => void;
  /** Visual variant. */
  variant?: "avatar" | "tile" | "thumbnail";
  /** Crop aspect (default 1). */
  aspect?: number;
  /** Crop shape ("round" | "rect"). */
  cropShape?: "round" | "rect";
  /** Output size in pixels (longest edge). */
  outputSize?: number;
  /** Output mime type. */
  outputType?: "image/webp" | "image/jpeg" | "image/png";
  /** Output quality. */
  outputQuality?: number;
  /** Modal title. */
  cropTitle?: string;
  /** Label shown on empty button. */
  label?: string;
  /** Optional: show a remove button. */
  removable?: boolean;
  /** Optional: classname for the wrapper. */
  className?: string;
  /** Open photo in preview when clicked (only when value present). */
  onPreview?: (src: string) => void;
}

export function PhotoUpload({
  value,
  onChange,
  variant = "tile",
  aspect = 1,
  cropShape = "rect",
  outputSize = 1280,
  outputType = "image/webp",
  outputQuality = 0.85,
  cropTitle,
  label = "Завантажити фото",
  removable = true,
  className,
  onPreview,
}: PhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickedSrc, setPickedSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPickedSrc(typeof reader.result === "string" ? reader.result : null);
      setBusy(false);
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const triggerPick = () => fileRef.current?.click();

  // Avatar: round, small button overlay
  if (variant === "avatar") {
    return (
      <>
        <div className={cn("relative shrink-0", className)}>
          <button
            type="button"
            onClick={value && onPreview ? () => onPreview(value) : triggerPick}
            className={cn(
              "flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ring-1",
              !value && "transition-transform hover:scale-[1.02]",
            )}
            style={{
              backgroundColor: "var(--brand-soft)",
              boxShadow: "var(--shadow-soft)",
              borderColor: "var(--border)",
            }}
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : busy ? (
              <Loader2 className="h-6 w-6 animate-spin text-foreground/45" />
            ) : (
              <Camera
                className="h-7 w-7"
                style={{ color: "var(--brand-deep)" }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={triggerPick}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-strong), var(--brand) 60%, var(--brand-deep))",
            }}
            aria-label="Змінити фото"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />
        {pickedSrc && (
          <ImageCropModal
            open={true}
            imageSrc={pickedSrc}
            onCancel={() => setPickedSrc(null)}
            onConfirm={(data) => {
              onChange(data);
              setPickedSrc(null);
            }}
            aspect={aspect}
            cropShape={cropShape}
            outputSize={outputSize}
            outputType={outputType}
            outputQuality={outputQuality}
            title={cropTitle ?? "Обрізати фото"}
          />
        )}
      </>
    );
  }

  // Thumbnail: small square preview + replace/remove buttons inline
  if (variant === "thumbnail") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              onClick={onPreview ? () => onPreview(value) : undefined}
              className={cn(
                "h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-foreground/10",
                onPreview && "cursor-pointer",
              )}
            />
            <button
              type="button"
              onClick={triggerPick}
              className="text-xs font-medium text-foreground/55 underline-offset-2 hover:underline"
            >
              Замінити
            </button>
            {removable && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-medium text-rose-500 underline-offset-2 hover:underline"
              >
                Видалити
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={triggerPick}
            className="flex h-9 items-center gap-2 rounded-xl border border-dashed px-3 text-xs font-medium text-foreground/55 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep"
            style={{ borderColor: "var(--border)" }}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {label}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />
        {pickedSrc && (
          <ImageCropModal
            open={true}
            imageSrc={pickedSrc}
            onCancel={() => setPickedSrc(null)}
            onConfirm={(data) => {
              onChange(data);
              setPickedSrc(null);
            }}
            aspect={aspect}
            cropShape={cropShape}
            outputSize={outputSize}
            outputType={outputType}
            outputQuality={outputQuality}
            title={cropTitle ?? "Обрізати фото"}
          />
        )}
      </div>
    );
  }

  // Tile: large dashed area or full-size image with overlay actions
  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            onClick={onPreview ? () => onPreview(value) : undefined}
            className={cn(
              "block max-h-72 w-full object-cover",
              onPreview && "cursor-zoom-in",
            )}
          />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={triggerPick}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur"
            >
              <Camera className="h-3.5 w-3.5" /> Замінити
            </button>
            {removable && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/55 text-white backdrop-blur"
                aria-label="Видалити"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerPick}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-xs font-medium text-foreground/55 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep"
          style={{ borderColor: "var(--border)" }}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
          )}
          <span>{label}</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
      />
      {pickedSrc && (
        <ImageCropModal
          open={true}
          imageSrc={pickedSrc}
          onCancel={() => setPickedSrc(null)}
          onConfirm={(data) => {
            onChange(data);
            setPickedSrc(null);
          }}
          aspect={aspect}
          cropShape={cropShape}
          outputSize={outputSize}
          outputType={outputType}
          outputQuality={outputQuality}
          title={cropTitle ?? "Обрізати фото"}
        />
      )}
    </div>
  );
}
