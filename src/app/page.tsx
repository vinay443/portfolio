import type { Metadata } from "next";
import { profile } from "@/content";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { Hero } from "@/components/sections/hero";

export const metadata: Metadata = {
  title: { absolute: `${profile.name} — ${profile.role}` },
  description: profile.heroLine,
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <div id="sections" className="px-6 md:px-12 lg:px-20">
        {/* Work, Projects, Background and Contact sections are added in the next step.
            Each one wraps its content in <Section /> and falls back to <EmptyState />
            when the active query filters everything out. */}
      </div>
      <SiteFooter />
    </>
  );
}
