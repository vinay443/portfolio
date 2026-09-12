"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

const ORDER = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof ORDER)[number];

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const LABELS = { system: "system", light: "light", dark: "dark" } as const;

const BUTTON_CLASSES =
  "text-ink-2 hover:text-ink rounded-control inline-flex size-9 items-center justify-center transition-colors";

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // The stored theme is unknown until after hydration; rendering the real button
  // before then would guess an icon and mismatch.
  if (!mounted) {
    return <span className={BUTTON_CLASSES} aria-hidden />;
  }

  const current: ThemeChoice = isThemeChoice(theme) ? theme : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
  const Icon = ICONS[current];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${LABELS[next]} theme`}
      title={`Theme: ${LABELS[current]}`}
      className={cn(BUTTON_CLASSES)}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
