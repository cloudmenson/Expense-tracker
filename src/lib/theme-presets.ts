/**
 * Theme palette presets — fully replace the base palette in globals.css when active.
 *
 * Architecture
 * ─────────────
 * - Each preset declares a complete `light` + `dark` palette as a flat
 *   record of CSS-variable name → value.
 * - The list of variables that get overridden is defined in `OVERRIDE_VARS`
 *   below — this is the contract: every preset *must* provide a value for
 *   each name (TypeScript enforces it).
 * - "default" preset is identified by having empty palette objects — for
 *   that one we just remove all inline overrides and let globals.css apply.
 * - `applyThemePreset` is the single entry-point that mutates `<html>` and
 *   is invoked from the theme provider AND mirrored verbatim by the
 *   SSR-safe bootstrap script in `layout.tsx` (no FOUC).
 */

export const OVERRIDE_VARS = [
  "--background",
  "--foreground",
  "--foreground-on-active",
  "--muted",
  "--surface",
  "--surface-strong",
  "--surface-sunken",
  "--border",
  "--border-strong",
  "--brand",
  "--brand-strong",
  "--brand-deep",
  "--brand-soft",
  "--nav-island-bg",
  "--nav-island-border",
  "--nav-active-bg",
  "--glass-bg",
  "--glass-bg-strong",
  "--glass-border",
  "--panel-gradient",
  "--dot-color",
] as const;

export type OverrideVar = (typeof OVERRIDE_VARS)[number];

export type Palette = Record<OverrideVar, string>;

export interface ThemePreset {
  id: string;
  name: string;
  /** Swatch gradient for the picker tile. */
  swatch: { from: string; to: string };
  /** Empty object means "no overrides — use globals.css". */
  light: Palette | Record<string, never>;
  dark: Palette | Record<string, never>;
}

export const DEFAULT_PRESET_ID = "default";

const ROSE_LIGHT: Palette = {
  "--background": "#fdebf0",
  "--foreground": "#3d0e1e",
  "--foreground-on-active": "#fff5f8",
  "--muted": "#8a4a5e",
  "--surface": "#ffffff",
  "--surface-strong": "#ffffff",
  "--surface-sunken": "#f8c8d4",
  "--border": "#f8b8c8",
  "--border-strong": "#e58aa0",
  "--brand": "#ff3d6c",
  "--brand-strong": "#ff6589",
  "--brand-deep": "#c4234d",
  "--brand-soft": "rgba(255, 61, 108, 0.14)",
  "--nav-island-bg": "#ffffff",
  "--nav-island-border": "#f8b8c8",
  "--nav-active-bg": "#fbcdd8",
  "--glass-bg": "#ffffff",
  "--glass-bg-strong": "#ffffff",
  "--glass-border": "#f8b8c8",
  "--panel-gradient": "linear-gradient(160deg, #ffffff 0%, #fde0e8 100%)",
  "--dot-color": "rgba(220, 80, 120, 0.14)",
};

const ROSE_DARK: Palette = {
  "--background": "#1a0c14",
  "--foreground": "#fae0e6",
  "--foreground-on-active": "#1a0612",
  "--muted": "#a08089",
  "--surface": "#251420",
  "--surface-strong": "#2f1a2a",
  "--surface-sunken": "#0d0509",
  "--border": "#4a2236",
  "--border-strong": "#6a3151",
  "--brand": "#ff5b85",
  "--brand-strong": "#ff8aa8",
  "--brand-deep": "#dc3a64",
  "--brand-soft": "rgba(255, 91, 133, 0.18)",
  "--nav-island-bg": "#1f1019",
  "--nav-island-border": "#4a2236",
  "--nav-active-bg": "#4a2236",
  "--glass-bg": "#251420",
  "--glass-bg-strong": "#2f1a2a",
  "--glass-border": "#4a2236",
  "--panel-gradient": "linear-gradient(160deg, #2f1a2a 0%, #1c0c16 100%)",
  "--dot-color": "rgba(255, 130, 170, 0.06)",
};

const SAGE_LIGHT: Palette = {
  "--background": "#eaf5e0",
  "--foreground": "#1d3014",
  "--foreground-on-active": "#f6fbef",
  "--muted": "#5a7548",
  "--surface": "#ffffff",
  "--surface-strong": "#ffffff",
  "--surface-sunken": "#d2eab8",
  "--border": "#b6db9a",
  "--border-strong": "#8bbf6b",
  "--brand": "#4fa83b",
  "--brand-strong": "#6cc04a",
  "--brand-deep": "#2f7822",
  "--brand-soft": "rgba(79, 168, 59, 0.14)",
  "--nav-island-bg": "#ffffff",
  "--nav-island-border": "#b6db9a",
  "--nav-active-bg": "#cfeaab",
  "--glass-bg": "#ffffff",
  "--glass-bg-strong": "#ffffff",
  "--glass-border": "#b6db9a",
  "--panel-gradient": "linear-gradient(160deg, #ffffff 0%, #dff0c8 100%)",
  "--dot-color": "rgba(80, 150, 60, 0.14)",
};

const SAGE_DARK: Palette = {
  "--background": "#0a140a",
  "--foreground": "#e0eed4",
  "--foreground-on-active": "#06120a",
  "--muted": "#8aa078",
  "--surface": "#152017",
  "--surface-strong": "#1d2a1e",
  "--surface-sunken": "#040805",
  "--border": "#2c3e2a",
  "--border-strong": "#456040",
  "--brand": "#74d05e",
  "--brand-strong": "#9ce080",
  "--brand-deep": "#4faf3a",
  "--brand-soft": "rgba(116, 208, 94, 0.18)",
  "--nav-island-bg": "#101810",
  "--nav-island-border": "#2c3e2a",
  "--nav-active-bg": "#2c3e2a",
  "--glass-bg": "#152017",
  "--glass-bg-strong": "#1d2a1e",
  "--glass-border": "#2c3e2a",
  "--panel-gradient": "linear-gradient(160deg, #1d2a1e 0%, #0e150e 100%)",
  "--dot-color": "rgba(150, 220, 130, 0.06)",
};

const INDIGO_LIGHT: Palette = {
  "--background": "#e9eaff",
  "--foreground": "#10133d",
  "--foreground-on-active": "#f0f1ff",
  "--muted": "#5a608c",
  "--surface": "#ffffff",
  "--surface-strong": "#ffffff",
  "--surface-sunken": "#cfd2f5",
  "--border": "#b6bbf5",
  "--border-strong": "#8a92e8",
  "--brand": "#5060ff",
  "--brand-strong": "#7080ff",
  "--brand-deep": "#3040d0",
  "--brand-soft": "rgba(80, 96, 255, 0.14)",
  "--nav-island-bg": "#ffffff",
  "--nav-island-border": "#b6bbf5",
  "--nav-active-bg": "#c8cdff",
  "--glass-bg": "#ffffff",
  "--glass-bg-strong": "#ffffff",
  "--glass-border": "#b6bbf5",
  "--panel-gradient": "linear-gradient(160deg, #ffffff 0%, #dde0ff 100%)",
  "--dot-color": "rgba(80, 90, 200, 0.14)",
};

const INDIGO_DARK: Palette = {
  "--background": "#080a1f",
  "--foreground": "#dee0fa",
  "--foreground-on-active": "#0a0e2c",
  "--muted": "#8a91b5",
  "--surface": "#161a35",
  "--surface-strong": "#1c2240",
  "--surface-sunken": "#04050f",
  "--border": "#2a3260",
  "--border-strong": "#404a85",
  "--brand": "#8090ff",
  "--brand-strong": "#a8b3ff",
  "--brand-deep": "#5060e0",
  "--brand-soft": "rgba(128, 144, 255, 0.18)",
  "--nav-island-bg": "#0e1128",
  "--nav-island-border": "#2a3260",
  "--nav-active-bg": "#2a3260",
  "--glass-bg": "#161a35",
  "--glass-bg-strong": "#1c2240",
  "--glass-border": "#2a3260",
  "--panel-gradient": "linear-gradient(160deg, #1c2240 0%, #10142e 100%)",
  "--dot-color": "rgba(160, 180, 255, 0.06)",
};

const OCEAN_LIGHT: Palette = {
  "--background": "#e2f4f8",
  "--foreground": "#0a2a32",
  "--foreground-on-active": "#ecfaff",
  "--muted": "#456874",
  "--surface": "#ffffff",
  "--surface-strong": "#ffffff",
  "--surface-sunken": "#bfe4ec",
  "--border": "#9ad4e0",
  "--border-strong": "#5fb5c8",
  "--brand": "#00b8d4",
  "--brand-strong": "#26d0e8",
  "--brand-deep": "#0086a0",
  "--brand-soft": "rgba(0, 184, 212, 0.14)",
  "--nav-island-bg": "#ffffff",
  "--nav-island-border": "#9ad4e0",
  "--nav-active-bg": "#b3e0ec",
  "--glass-bg": "#ffffff",
  "--glass-bg-strong": "#ffffff",
  "--glass-border": "#9ad4e0",
  "--panel-gradient": "linear-gradient(160deg, #ffffff 0%, #cfe9f0 100%)",
  "--dot-color": "rgba(40, 150, 180, 0.14)",
};

const OCEAN_DARK: Palette = {
  "--background": "#06181c",
  "--foreground": "#d4eef4",
  "--foreground-on-active": "#03141a",
  "--muted": "#779099",
  "--surface": "#102830",
  "--surface-strong": "#16323c",
  "--surface-sunken": "#020a0d",
  "--border": "#1f4854",
  "--border-strong": "#2f6776",
  "--brand": "#26d0e8",
  "--brand-strong": "#5be0f0",
  "--brand-deep": "#00a0c0",
  "--brand-soft": "rgba(38, 208, 232, 0.18)",
  "--nav-island-bg": "#0a1c22",
  "--nav-island-border": "#1f4854",
  "--nav-active-bg": "#1f4854",
  "--glass-bg": "#102830",
  "--glass-bg-strong": "#16323c",
  "--glass-border": "#1f4854",
  "--panel-gradient": "linear-gradient(160deg, #16323c 0%, #081e25 100%)",
  "--dot-color": "rgba(100, 220, 240, 0.06)",
};

const PLUM_LIGHT: Palette = {
  "--background": "#f4e4fa",
  "--foreground": "#241036",
  "--foreground-on-active": "#fbf2ff",
  "--muted": "#6f5780",
  "--surface": "#ffffff",
  "--surface-strong": "#ffffff",
  "--surface-sunken": "#e0c0ed",
  "--border": "#dba6ee",
  "--border-strong": "#b86dd0",
  "--brand": "#a830d0",
  "--brand-strong": "#bf52e0",
  "--brand-deep": "#7a1ea0",
  "--brand-soft": "rgba(168, 48, 208, 0.14)",
  "--nav-island-bg": "#ffffff",
  "--nav-island-border": "#dba6ee",
  "--nav-active-bg": "#e8c2f3",
  "--glass-bg": "#ffffff",
  "--glass-bg-strong": "#ffffff",
  "--glass-border": "#dba6ee",
  "--panel-gradient": "linear-gradient(160deg, #ffffff 0%, #efd6f7 100%)",
  "--dot-color": "rgba(170, 60, 210, 0.14)",
};

const PLUM_DARK: Palette = {
  "--background": "#150a1c",
  "--foreground": "#ecdaf4",
  "--foreground-on-active": "#0f0418",
  "--muted": "#9c87a8",
  "--surface": "#231533",
  "--surface-strong": "#2c1c40",
  "--surface-sunken": "#080310",
  "--border": "#3f2658",
  "--border-strong": "#5a3879",
  "--brand": "#c050e0",
  "--brand-strong": "#d479ec",
  "--brand-deep": "#9230b0",
  "--brand-soft": "rgba(192, 80, 224, 0.18)",
  "--nav-island-bg": "#1a0e25",
  "--nav-island-border": "#3f2658",
  "--nav-active-bg": "#3f2658",
  "--glass-bg": "#231533",
  "--glass-bg-strong": "#2c1c40",
  "--glass-border": "#3f2658",
  "--panel-gradient": "linear-gradient(160deg, #2c1c40 0%, #170926 100%)",
  "--dot-color": "rgba(220, 130, 240, 0.06)",
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "За замовчуванням",
    swatch: { from: "transparent", to: "transparent" },
    light: {},
    dark: {},
  },
  {
    id: "rose",
    name: "Троянда",
    swatch: { from: "#ff6589", to: "#c4234d" },
    light: ROSE_LIGHT,
    dark: ROSE_DARK,
  },
  {
    id: "sage",
    name: "Шавлія",
    swatch: { from: "#6cc04a", to: "#2f7822" },
    light: SAGE_LIGHT,
    dark: SAGE_DARK,
  },
  {
    id: "indigo",
    name: "Індиго",
    swatch: { from: "#7080ff", to: "#3040d0" },
    light: INDIGO_LIGHT,
    dark: INDIGO_DARK,
  },
  {
    id: "ocean",
    name: "Океан",
    swatch: { from: "#26d0e8", to: "#0086a0" },
    light: OCEAN_LIGHT,
    dark: OCEAN_DARK,
  },
  {
    id: "plum",
    name: "Слива",
    swatch: { from: "#bf52e0", to: "#7a1ea0" },
    light: PLUM_LIGHT,
    dark: PLUM_DARK,
  },
];

/**
 * Apply a preset's variables to `<html>`. For the default preset (or unknown
 * id), all overrides are removed so the base palette in globals.css applies.
 */
export function applyThemePreset(presetId: string, mode: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Always start from a clean slate.
  for (const name of OVERRIDE_VARS) root.style.removeProperty(name);

  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset || presetId === DEFAULT_PRESET_ID) return;

  const palette = mode === "dark" ? preset.dark : preset.light;
  for (const [name, value] of Object.entries(palette)) {
    root.style.setProperty(name, value);
  }
}

export function findPreset(id: string): ThemePreset {
  return (
    THEME_PRESETS.find((p) => p.id === id) ??
    THEME_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!
  );
}
