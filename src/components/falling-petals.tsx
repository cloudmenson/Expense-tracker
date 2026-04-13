"use client";

import { useEffect, useRef } from "react";

const PETALS = ["🌸", "🩷", "💮", "🪻", "🌷", "✿", "❀", "🌺"];
const COUNT = 18;

interface Petal {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  driftSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  char: string;
  phase: number;
}

function createPetal(w: number, h: number, startTop = false): Petal {
  return {
    x: Math.random() * w,
    y: startTop ? -30 : Math.random() * h,
    size: 10 + Math.random() * 10,
    speed: 0.3 + Math.random() * 0.5,
    drift: 0,
    driftSpeed: 0.3 + Math.random() * 0.7,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 1.5,
    opacity: 0.18 + Math.random() * 0.15,
    char: PETALS[Math.floor(Math.random() * PETALS.length)],
    phase: Math.random() * Math.PI * 2,
  };
}

export function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const petals: Petal[] = Array.from({ length: COUNT }, () =>
      createPetal(w, h, false),
    );

    let animId: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      for (const p of petals) {
        p.y += p.speed;
        p.drift = Math.sin(time * p.driftSpeed + p.phase) * 40;
        p.rotation += p.rotationSpeed;

        if (p.y > h + 30) {
          Object.assign(p, createPetal(w, h, true));
        }

        ctx.save();
        ctx.translate(p.x + p.drift, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
  );
}
