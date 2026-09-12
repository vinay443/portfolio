import { ImageResponse } from "next/og";
import { profile, projects } from "@/content";
import { OG, OG_SIZE } from "@/lib/og-theme";

export const alt = "Project";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug && !entry.sensitive);

  const title = project ? project.title : profile.name;
  const line = project ? project.oneLiner : profile.role;

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
          <div style={{ fontSize: 30, color: OG.ink2, letterSpacing: "-0.01em" }}>
            {profile.name}
          </div>

          <div style={{ width: 140, height: 1, backgroundColor: OG.rule, margin: "36px 0" }} />

          <div style={{ fontSize: 76, letterSpacing: "-0.03em", lineHeight: 1.06 }}>{title}</div>

          <div
            style={{
              fontSize: 30,
              color: OG.ink2,
              marginTop: 32,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {line}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
