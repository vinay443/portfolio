import { ImageResponse } from "next/og";
import { profile } from "@/content";
import { OG, OG_SIZE } from "@/lib/og-theme";

export const alt = `${profile.name} — ${profile.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: OG.bg,
          color: OG.ink,
        }}
      >
        <div style={{ width: 8, height: "100%", backgroundColor: OG.accent }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 88px",
          }}
        >
          <div style={{ fontSize: 104, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {profile.name}
          </div>

          <div style={{ width: 140, height: 1, backgroundColor: OG.rule, margin: "44px 0" }} />

          <div style={{ fontSize: 36, color: OG.ink2, letterSpacing: "-0.01em" }}>
            {profile.role}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
