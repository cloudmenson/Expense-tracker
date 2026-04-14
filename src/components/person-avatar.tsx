"use client";

interface PersonAvatarProps {
  name: string;
  color: string;
  avatarImage?: string;
  /** xs=16px  sm=24px  md=36px  lg=56px */
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLS = {
  xs: "h-4 w-4 text-[8px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-xl",
} as const;

export function PersonAvatar({
  name,
  color,
  avatarImage,
  size = "sm",
  className = "",
}: PersonAvatarProps) {
  const cls = `${SIZE_CLS[size]} shrink-0 rounded-full object-cover ${className}`;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarImage) {
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
