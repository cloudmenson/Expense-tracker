"use client";

/**
 * SVG heart logo – renders identically on every platform (no emoji variance).
 * size: Tailwind-style class string for the wrapper, e.g. "h-9 w-9"
 */
export function HeartLogo({
  wrapperClass = "h-9 w-9 rounded-xl",
  svgSize = 20,
}: {
  wrapperClass?: string;
  svgSize?: number;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-linear-to-br from-emerald-400 to-lime-400 shadow-lg shadow-emerald-500/25 ${wrapperClass}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="-50 -45 100 80"
        fill="none"
      >
        <path
          d="M0 30 C0 30 -50 -15 -25 -30 C-10 -40 0 -25 0 -15 C0 -25 10 -40 25 -30 C50 -15 0 30 0 30Z"
          fill="white"
          fillOpacity={0.85}
        />
      </svg>
    </div>
  );
}
