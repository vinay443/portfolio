"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { profile } from "@/content";
import { cn } from "@/lib/cn";
import { alignToHash, HEADER_HEIGHT, scrollToElement } from "@/lib/scroll";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Contact" },
];

/**
 * A section becomes the current one as its top edge passes under the header. The
 * extra pixel is what stops a section that is sitting exactly on the header line
 * from flickering between states as rounding moves it back and forth.
 */
const ACTIVATION_LINE = HEADER_HEIGHT + 1;

export function SiteHeader() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [spy, setSpy] = useState<{ path: string; id: string | null }>({ path: "", id: null });
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel from anywhere on the page. Registered only while it is
  // open, so nothing listens for a menu nobody opened.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // A handler that already acted on this Escape, like the search field clearing
      // itself, keeps focus where it put it.
      if (!event.defaultPrevented) menuButtonRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The header lives in the root layout and survives navigation, so this is rebuilt
  // per route. Off the home page there are no sections to find.
  //
  // This reads the sections' positions rather than observing intersections. An
  // IntersectionObserver over a band can have several tall sections inside it at
  // once and then has to guess which one the reader means; picking the first of
  // them left the header a whole section behind — "Projects" stayed underlined
  // with the "Background" heading at the top of the viewport. Measuring is exact:
  // the current section is simply the last one whose top has passed the header.
  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    // Off the home page there is nothing to track. The reading from the previous
    // route is left alone rather than cleared, because `activeId` below already
    // discards a reading whose path is not this one.
    if (sections.length === 0) return;

    const update = () => {
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= ACTIVATION_LINE) current = section.id;
      }
      setSpy({ path: pathname, id: current });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // A deep link like `/#contact` arrives as a full page load, so the browser has
  // already made its own attempt by the time this runs. This holds the page on the
  // target while the hero reveal, the dot field and webfonts finish moving it.
  useEffect(() => alignToHash(), [pathname]);

  // A reading from the previous route never lights up a link on this one.
  const activeId = spy.path === pathname ? spy.id : null;

  // A bare fragment keeps `?q=` intact on the home page; everywhere else the link
  // has to leave the current route.
  const hrefFor = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  // On the home page the jump is run here instead of by the browser, so its
  // distance decides whether it animates. Off the home page the link is left alone
  // to navigate, and `alignToHash` takes over once the next page loads.
  const onSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false);
    if (!onHome) return;
    // Modified clicks belong to the browser: open in a new tab, download, and so on.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    scrollToElement(target);
    // Keeps the URL shareable and the Back button meaningful. `pushState` rather
    // than setting `location.hash`, which would make the browser run its own
    // fragment scroll on top of this one. A bare fragment preserves `?q=`.
    window.history.pushState(null, "", `#${id}`);
  };

  return (
    <>
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
                  onClick={(event) => onSectionClick(event, item.id)}
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
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close section menu" : "Open section menu"}
              className="text-ink-2 hover:text-ink rounded-control inline-flex size-9 items-center justify-center md:hidden"
            >
              {open ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div id={panelId} hidden={!open} className="border-rule bg-bg border-t md:hidden">
          <nav aria-label="Sections" className="flex flex-col px-6 py-2">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={hrefFor(item.id)}
                onClick={(event) => onSectionClick(event, item.id)}
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

      {/* Tapping anywhere outside the open panel closes it. A transparent layer
          rather than a document listener, for two reasons: it takes the tap itself,
          so the panel collapsing never shifts the page under a tap that then lands
          on a different link, and that is what lets focus return to the menu button
          without pulling it out of a field the visitor just tapped. It sits outside
          <header> because the header's backdrop-filter would otherwise confine a
          fixed child to the header's own box. */}
      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => {
            setOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}
