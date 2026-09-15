const LOCAL_ORIGIN = "http://localhost:3000";

/**
 * Single source for the absolute origin used by metadata, sitemap, robots and
 * JSON-LD. Set NEXT_PUBLIC_SITE_URL to the deployed domain; see `.env.example`.
 *
 * Read as a literal `process.env.NEXT_PUBLIC_SITE_URL` so Next inlines it at build
 * time, which means it must be set before `next build`, not only at runtime. The
 * trailing slash is stripped so paths join as `${SITE_URL}/sitemap.xml`.
 *
 * Unset, `next dev` falls back to localhost. A production build throws instead:
 * falling back there would bake localhost into every social card and crawler
 * directive, and nothing would say so until a shared link previewed wrong.
 * `next build` always runs with NODE_ENV=production, and so does every Vercel
 * deployment, previews included.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. A production build needs the deployed origin " +
        "(for example https://example.com) for metadataBase, the sitemap, robots.txt " +
        "and the JSON-LD url. Set it in the Vercel project for Production and Preview, " +
        "or in the environment running `next build`. See .env.example.",
    );
  }

  return LOCAL_ORIGIN;
}

export const SITE_URL = resolveSiteUrl();
