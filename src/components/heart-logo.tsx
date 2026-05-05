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
      className={`flex items-center justify-center ${wrapperClass}`}
      style={{
        background:
          "linear-gradient(140deg, var(--brand-strong) 0%, var(--brand) 55%, var(--brand-deep) 100%)",
        boxShadow:
          "0 10px 28px rgba(217, 119, 87, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -2px 0 rgba(120, 50, 30, 0.18)",
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="-50 -45 100 80"
        fill="none"
      >
        <path
          d="M0 30 C0 30 -50 -15 -25 -30 C-10 -40 0 -25 0 -15 C0 -25 10 -40 25 -30 C50 -15 0 30 0 30Z"
          fill="#fffaf2"
          fillOpacity={0.92}
        />
      </svg>
    </div>
  );
}
