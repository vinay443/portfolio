import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge cannot see the @theme block in globals.css, so the project's own
// tokens have to be declared here. Without this it treats `text-step-4` and
// `text-ink` as the same group and silently drops one of them.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "step-neg2",
            "step-neg1",
            "step-0",
            "step-1",
            "step-2",
            "step-3",
            "step-4",
            "step-5",
            "step-6",
          ],
        },
      ],
      "text-color": [{ text: ["ink", "ink-2", "ink-3", "accent", "accent-fg", "flag", "surface"] }],
      "bg-color": [{ bg: ["bg", "surface", "ink", "rule", "accent", "accent-fg", "flag"] }],
      "border-color": [{ border: ["rule", "ink", "accent", "flag"] }],
      rounded: [{ rounded: ["control"] }],
      "max-w": [{ "max-w": ["measure"] }],
      p: [{ p: ["section"] }],
      px: [{ px: ["section"] }],
      py: [{ py: ["section"] }],
      mt: [{ mt: ["section"] }],
      mb: [{ mb: ["section"] }],
      gap: [{ gap: ["section"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
