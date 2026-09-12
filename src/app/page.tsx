import type { Metadata } from "next";
import { profile } from "@/content";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { Hero } from "@/components/sections/hero";
import { ResultSummary } from "@/components/search/result-summary";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Background } from "@/components/sections/background";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: { absolute: `${profile.name} — ${profile.role}` },
  description: profile.heroLine,
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <ResultSummary />

      <div className="px-6 md:px-12 lg:px-20">
        <Experience />
        <Projects />
        <Background />
        <Contact />
      </div>

      <SiteFooter />
    </>
  );
}
