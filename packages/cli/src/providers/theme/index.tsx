import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { Theme, ThemeColors } from "./theme";
import { DEFAULT_THEME, THEMES } from "./theme";

const CONFIG_DIR = join(homedir(), ".flowcode");
const THEME_PREFERENCES_PATH = join(CONFIG_DIR, "preferences.json");

type ThemePreferences = {
  themeName: string;
};

export function getInitialTheme(): Theme {
  try {
    const preferences = JSON.parse(
      readFileSync(THEME_PREFERENCES_PATH, "utf-8"),
    ) as Partial<ThemePreferences>;
    if (typeof preferences.themeName !== "string") {
      return DEFAULT_THEME;
    }
    const savedTheme = THEMES.find(
      (theme) => theme.name === preferences.themeName,
    );
    return savedTheme ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function persistTheme(theme: Theme) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    writeFileSync(
      THEME_PREFERENCES_PATH,
      JSON.stringify(
        { themeName: theme.name } satisfies ThemePreferences,
        null,
        2,
      ),
      "utf-8",
    );
  } catch {
    // Ignore preference write failures
  }
}

type ThemeContextValue = {
  colors: ThemeColors;
  currentTheme: Theme;
  previewTheme: (theme: Theme) => void;
  commitTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return value;
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);

  const previewTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  const commitTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    persistTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colors: currentTheme.colors,
        currentTheme,
        previewTheme,
        commitTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
