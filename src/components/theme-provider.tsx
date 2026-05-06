"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  DEFAULT_PRESET_ID,
  THEME_PRESETS,
  applyThemePreset,
} from "@/lib/theme-presets";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  resolved: Theme;
  setTheme: (t: Theme) => void;
  preset: string;
  setPreset: (id: string) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "light",
  resolved: "light",
  setTheme: () => {},
  preset: DEFAULT_PRESET_ID,
  setPreset: () => {},
});

const THEME_KEY = "theme";
const PRESET_KEY = "theme-preset";

function isValidPresetId(id: unknown): id is string {
  return typeof id === "string" && THEME_PRESETS.some((p) => p.id === id);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolved, setResolved] = useState<Theme>("light");
  const [preset, setPresetState] = useState<string>(DEFAULT_PRESET_ID);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.style.colorScheme = t;
    setResolved(t);
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem(THEME_KEY, t);
      applyTheme(t);
      // Re-apply preset for the new mode
      applyThemePreset(preset, t);
    },
    [applyTheme, preset],
  );

  const setPreset = useCallback(
    (id: string) => {
      const safe = isValidPresetId(id) ? id : DEFAULT_PRESET_ID;
      setPresetState(safe);
      localStorage.setItem(PRESET_KEY, safe);
      applyThemePreset(safe, resolved);
    },
    [resolved],
  );

  useEffect(() => {
    // Hydrate from localStorage on first mount
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const t: Theme =
      storedTheme === "light" || storedTheme === "dark" ? storedTheme : "light";
    setThemeState(t);
    applyTheme(t);

    const storedPreset = localStorage.getItem(PRESET_KEY);
    const p = isValidPresetId(storedPreset) ? storedPreset : DEFAULT_PRESET_ID;
    setPresetState(p);
    applyThemePreset(p, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{ theme, resolved, setTheme, preset, setPreset }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
