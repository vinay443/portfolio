"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useMounted, useTheme, type ThemeChoice } from "@/components/theme/theme-provider";

const CYCLE: Record<ThemeChoice, ThemeChoice> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

const LABEL: Record<ThemeChoice, string> = {
  system: "Use system theme",
  light: "Switch to light theme",
  dark: "Switch to dark theme",
};

const BUTTON_CLASSES =
  "text-ink-2 hover:text-ink rounded-control inline-flex size-9 items-center justify-center transition-colors";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // The stored choice is unknowable on the server. Rendering a guessed icon would
  // mismatch on hydration, so hold a same-sized placeholder until it is known.
  if (!mounted || theme === undefined) {
    return <span className={BUTTON_CLASSES} aria-hidden />;
  }

  const next = CYCLE[theme];
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={LABEL[next]}
      title={theme === "system" ? `Theme: system (${resolvedTheme ?? "light"})` : `Theme: ${theme}`}
      className={BUTTON_CLASSES}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
