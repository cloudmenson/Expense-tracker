"use client";

import { useTheme } from "@/components/theme-provider";
import { THEME_PRESETS, DEFAULT_PRESET_ID } from "@/lib/theme-presets";

export function ThemePresetPicker() {
  const { preset, setPreset } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {THEME_PRESETS.map((p) => {
        const active = preset === p.id;
        const isDefault = p.id === DEFAULT_PRESET_ID;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            title={p.name}
            aria-label={p.name}
            aria-pressed={active}
            className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md outline-none active:scale-90"
            style={{
              background: isDefault
                ? "var(--surface-strong)"
                : `linear-gradient(135deg, ${p.swatch.from} 0%, ${p.swatch.to} 100%)`,
              border: `1px solid ${active ? "var(--foreground)" : "var(--border-strong)"}`,
              boxShadow: active
                ? "0 0 0 2px var(--foreground)"
                : undefined,
            }}
          >
            {isDefault && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-1/2 origin-center -translate-y-1/2 rotate-[135deg]"
                style={{
                  borderTop: "2px solid #ff3d4f",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
