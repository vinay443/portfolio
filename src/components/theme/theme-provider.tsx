"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useServerInsertedHTML } from "next/navigation";

export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs before first paint so the page never flashes the wrong palette. It is
 * emitted through useServerInsertedHTML, which writes it into the server HTML
 * outside React's client tree — React never creates this element in the
 * browser, which is what the "Encountered a script tag" warning is about.
 */
const PRE_PAINT_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var t=s==="light"||s==="dark"?s:(window.matchMedia("${DARK_QUERY}").matches?"dark":"light");var d=document.documentElement;d.classList.toggle("dark",t==="dark");d.style.colorScheme=t;}catch(e){}})();`;

interface ThemeContextValue {
  /** The stored choice. Undefined during server render and hydration. */
  theme: ThemeChoice | undefined;
  /** What is actually on screen. Undefined during server render and hydration. */
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (theme: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

// The choice lives in localStorage, with an in-memory copy for browsers where
// storage throws, so the toggle still works for the current visit.
const choiceListeners = new Set<() => void>();
let memoryChoice: ThemeChoice | null = null;

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeChoice(stored)) return stored;
  } catch {
    // Storage unavailable; fall through to the in-memory copy.
  }
  return memoryChoice ?? "system";
}

function writeChoice(next: ThemeChoice): void {
  memoryChoice = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage unavailable; the in-memory copy still applies for this visit.
  }
  for (const listener of choiceListeners) listener();
}

function subscribeChoice(listener: () => void): () => void {
  choiceListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    choiceListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeSystem(listener: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function readSystem(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

const onServer = () => undefined;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scriptInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (scriptInserted.current) return null;
    scriptInserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />;
  });

  // External stores rather than state set from an effect: the server snapshot is
  // undefined, so hydration matches the server HTML and the real values arrive on
  // the render straight after.
  const theme = useSyncExternalStore<ThemeChoice | undefined>(
    subscribeChoice,
    readChoice,
    onServer,
  );
  const systemTheme = useSyncExternalStore<ResolvedTheme | undefined>(
    subscribeSystem,
    readSystem,
    onServer,
  );

  const resolvedTheme =
    theme === undefined || systemTheme === undefined
      ? undefined
      : theme === "system"
        ? systemTheme
        : theme;

  useEffect(() => {
    if (!resolvedTheme) return;

    const root = document.documentElement;
    // Without this every transition-colors element animates across the swap.
    const freeze = document.createElement("style");
    freeze.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(freeze);

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;

    // Forces a style recalculation so the freeze applies before it is removed.
    window.getComputedStyle(root).getPropertyValue("color-scheme");
    const timer = window.setTimeout(() => freeze.remove(), 1);

    return () => {
      window.clearTimeout(timer);
      freeze.remove();
    };
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme: writeChoice }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Throws outside the provider: a silently inert toggle is how this bug hid before. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return context;
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true afterwards. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
