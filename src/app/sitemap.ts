import type { MetadataRoute } from "next";
import { projects } from "@/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    ...projects
      .filter((project) => !project.sensitive)
      .map((project) => ({
        url: `${SITE_URL}/projects/${project.slug}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.7,
      })),
  ];
}
