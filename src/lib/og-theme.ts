/**
 * next/og renders through Satori, outside a browser, so it cannot resolve the
 * custom properties in globals.css. These literals are the one sanctioned copy
 * of the palette and must be kept in step with the `:root` block there.
 */
export const OG = {
  bg: "#f3f4f2",
  ink: "#16181a",
  ink2: "#4a5054",
  rule: "#dcdfda",
  accent: "#0f4c5c",
  accentFg: "#ffffff",
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
