import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { degree, profile, skills } from "@/content";
import { SearchProvider } from "@/components/search/search-provider";
import { isPlaceholder } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const title = `${profile.name} — ${profile.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s — ${profile.name}`,
  },
  description: profile.summary,
  keywords: skills.flatMap((group) => group.skills).slice(0, 24),
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title,
    description: profile.heroLine,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.heroLine,
  },
};

const profiles = profile.links
  .map((link) => link.href)
  .filter((href) => !isPlaceholder(href) && href.startsWith("http"));

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: SITE_URL,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: profile.location },
  alumniOf: { "@type": "CollegeOrUniversity", name: degree.institution },
  knowsAbout: skills.flatMap((group) => group.skills).slice(0, 24),
  ...(profiles.length > 0 ? { sameAs: profiles } : {}),
};

// Escaping `<` is what stops a future content string containing "</script>" from
// closing this tag early.
const personJsonLdHtml = JSON.stringify(personJsonLd).replace(/</g, "\\u003c");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="bg-bg text-ink flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLdHtml }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SearchProvider>
            <a
              href="#content"
              className="text-step-neg1 focus:border-rule focus:bg-surface focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:border focus:px-4 focus:py-2"
            >
              Skip to content
            </a>
            {children}
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
