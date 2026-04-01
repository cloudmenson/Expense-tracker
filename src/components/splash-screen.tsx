"use client";

import { useEffect, useState } from "react";
import { HeartLogo } from "@/components/heart-logo";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const step = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        // Start fade-out
        setTimeout(() => setFadeOut(true), 200);
        // Remove splash after fade animation
        setTimeout(() => onFinish(), 700);
      }
      setProgress(current);
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, #22c55e 0%, #84cc16 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div className="relative">
          {/* Outer ring pulse */}
          <div className="absolute inset-0 animate-[splash-ping_2s_ease-in-out_infinite] rounded-3xl bg-gradient-to-br from-emerald-400 to-lime-400 opacity-20" />
          {/* Logo icon */}
          <HeartLogo
            wrapperClass="relative h-24 w-24 rounded-3xl shadow-2xl shadow-emerald-500/30"
            svgSize={52}
          />
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ color: "var(--foreground)" }}
          >
            Budget for Two
          </h1>
          <p
            className="text-sm font-medium tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            Ваш спільний бюджет
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-56">
          <div
            className="h-1 overflow-hidden rounded-full"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #22c55e 0%, #84cc16 50%, #4ade80 100%)",
                boxShadow: "0 0 12px rgba(34, 197, 94, 0.5)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
