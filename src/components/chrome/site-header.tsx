"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { profile } from "@/content";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Contact" },
];

const HEADER_HEIGHT = 56;

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [spy, setSpy] = useState<{ path: string; id: string | null }>({ path: "", id: null });
  const panelId = useId();

  // The header lives in the root layout and survives navigation, so the observer
  // is rebuilt per route. Off the home page there are no sections to find.
  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const visibility = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        const active = NAV.find((item) => visibility.get(item.id));
        setSpy({ path: pathname, id: active ? active.id : null });
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px -55% 0px`, threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [pathname]);

  // A reading from the previous route never lights up a link on this one.
  const activeId = spy.path === pathname ? spy.id : null;

  // A bare fragment keeps `?q=` intact on the home page; everywhere else the link
  // has to leave the current route.
  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="site-header border-rule sticky top-0 z-50 border-b bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-md backdrop-saturate-150">
      <div className="flex h-14 items-center justify-between px-6 md:px-12 lg:px-20">
        <Link href="/" className="text-step-0 text-ink font-medium">
          {profile.name}
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={hrefFor(item.id)}
                aria-current={activeId === item.id ? "location" : undefined}
                className={cn(
                  "text-step-neg1 border-b-2 pb-0.5 transition-colors",
                  activeId === item.id
                    ? "border-accent text-accent"
                    : "text-ink-2 hover:text-ink border-transparent",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close section menu" : "Open section menu"}
            className="text-ink-2 hover:text-ink rounded-control inline-flex size-9 items-center justify-center md:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="border-rule bg-bg border-t md:hidden">
        <nav aria-label="Sections" className="flex flex-col px-6 py-2">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={hrefFor(item.id)}
              onClick={() => setOpen(false)}
              aria-current={activeId === item.id ? "location" : undefined}
              className={cn(
                "text-step-neg1 py-2 transition-colors",
                activeId === item.id ? "text-accent" : "text-ink-2 hover:text-ink",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
