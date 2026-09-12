import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { profile, skills } from "@/content";
import { SearchProvider } from "@/components/search/search-provider";
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
  // TODO: replace with the real domain once the site is deployed.
  metadataBase: new URL("https://TODO-your-domain.com"),
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="bg-bg text-ink flex min-h-full flex-col">
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
            <main id="content" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
