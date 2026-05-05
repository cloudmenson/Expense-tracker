"use client";

import { useEffect, useState } from "react";
import { HeartLogo } from "@/components/heart-logo";

type Phase = "enter" | "visible" | "exit";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    // enter: component mounts invisible
    // visible: fade/slide in after 80ms
    const t1 = setTimeout(() => setPhase("visible"), 80);
    // exit: start fade-out after 1.6s
    const t2 = setTimeout(() => setPhase("exit"), 1600);
    // unmount after exit animation
    const t3 = setTimeout(() => onFinish(), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--background)" }}
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute left-1/2 top-1/2 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] transition-all duration-1000 ${
            phase === "enter"
              ? "opacity-0 scale-75"
              : "opacity-[0.18] scale-100"
          }`}
          style={{
            background:
              "radial-gradient(circle, #d97757 0%, #e8956d 40%, #e0a86b 65%, transparent 75%)",
          }}
        />
        <div
          className={`absolute right-[20%] top-[20%] h-62.5 w-62.5 rounded-full blur-[100px] transition-all duration-1000 delay-200 ${
            phase === "enter" ? "opacity-0" : "opacity-15"
          }`}
          style={{ background: "#e8956d" }}
        />
        <div
          className={`absolute bottom-[20%] left-[15%] h-50 w-50 rounded-full blur-[80px] transition-all duration-1000 delay-300 ${
            phase === "enter" ? "opacity-0" : "opacity-12"
          }`}
          style={{ background: "#8aa17a" }}
        />
      </div>

      {/* Main content */}
      <div
        className={`relative flex flex-col items-center gap-7 transition-all duration-700 ease-out ${
          phase === "enter"
            ? "opacity-0 translate-y-5"
            : "opacity-100 translate-y-0"
        }`}
      >
        {/* Logo */}
        <div className="relative">
          {/* Soft outer glow ring */}
          <div
            className="absolute rounded-3xl"
            style={{
              inset: "-14px",
              background:
                "radial-gradient(circle, rgba(217,119,87,0.22) 0%, transparent 70%)",
              animation:
                phase === "visible"
                  ? "splash-ping 3s ease-in-out infinite"
                  : "none",
            }}
          />
          <HeartLogo
            wrapperClass="relative h-[88px] w-[88px] rounded-3xl"
            svgSize={46}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-[26px] font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Budget{" "}
            <span
              style={{
                color: "var(--brand)",
                fontStyle: "italic",
              }}
            >
              for Two
            </span>
          </h1>
          <p
            className="text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--muted)", opacity: 0.7 }}
          >
            Ваш спільний бюджет
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.25 w-1.25 rounded-full"
              style={{
                background: "var(--brand)",
                animation:
                  phase === "visible"
                    ? `splash-dots 1.4s ease-in-out ${i * 0.18}s infinite`
                    : "none",
                opacity: 0.25,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
