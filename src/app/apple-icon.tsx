import { ImageResponse } from "next/og";
import { OG } from "@/lib/og-theme";

// `apple-icon` takes no SVG, so the mark in icon.svg is redrawn here as a PNG.
// iOS applies its own corner mask, which is why this one is square and full bleed.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: OG.accent,
      }}
    >
      {/* The same path as icon.svg rather than a letter `V`: ImageResponse's
            default font has one weight, so type here came out lighter than the
            stroked mark and the two icons did not read as the same thing. */}
      <svg width="180" height="180" viewBox="0 0 32 32">
        <path
          d="M8.5 10 L16 22 L23.5 10"
          fill="none"
          stroke={OG.accentFg}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}
