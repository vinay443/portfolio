"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { profile, searchExamples } from "@/content";
import { isPlaceholder } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useSearch } from "@/components/search/search-provider";
import { Headshot } from "@/components/hero/headshot";
import { SimilarityField } from "@/components/hero/similarity-field";
import { SilentBoundary } from "@/components/ui/silent-boundary";

const PLACEHOLDER_INTERVAL_MS = 3200;

/**
 * Staggers the `.hero-rise` keyframe, which is defined in globals.css. The delay
 * is data on the element rather than a class per position, so the order of the
 * hero's lines is readable here instead of in the stylesheet.
 */
function riseDelay(ms: number): CSSProperties {
  return { "--rise-delay": `${ms}ms` } as CSSProperties;
}

function isTypingTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable;
}

export function Hero() {
  const { query, setQuery, isSearching, resultCount, clear } = useSearch();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const inputId = useId();
  const countId = useId();

  const cycling =
    !reduceMotion && !focused && !hasTyped && query.length === 0 && searchExamples.length > 1;

  // One interval for as long as the placeholder cycles. The index is advanced with
  // an updater and is not a dependency, so a tick never re-registers the interval.
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(
      () => setExampleIndex((index) => (index + 1) % searchExamples.length),
      PLACEHOLDER_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [cycling]);

  // Listens on document in the capture phase, so the shortcut still arrives even
  // if a handler further down the tree stops the event from bubbling. Registered
  // unconditionally on mount; nothing gates it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  const example = searchExamples[exampleIndex] ?? searchExamples[0] ?? "";
  const availability = isPlaceholder(profile.availability) ? null : profile.availability;
  const metaLine = availability ? `${profile.location} · ${availability}` : profile.location;

  const countLabel = !isSearching
    ? ""
    : resultCount === 0
      ? "no matches"
      : `${resultCount} ${resultCount === 1 ? "match" : "matches"}`;

  return (
    <section className="short:pt-10 px-6 pt-10 pb-12 md:px-12 md:pt-20 lg:px-20">
      {/* Starts on the same left edge as every section below (--column, centred), and
          runs up to 72rem to the right so the field fits beside the text. The text
          track is a fixed 640px: where the row is short of room, the field gives way
          rather than the subline gaining a line. */}
      <div className="ml-[max(0px,calc((100%-var(--column))/2))] max-w-[72rem] lg:grid lg:grid-cols-[640px_minmax(0,420px)] lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-[640px]">
          <Headshot />

          <h1 className="hero-rise text-step-4 md:text-step-6 short:mt-4 mt-4 leading-[1.05] font-semibold tracking-[-0.03em] md:mt-6">
            {profile.name}
          </h1>

          <p style={riseDelay(60)} className="hero-rise text-step-2 text-ink-2 mt-6 max-w-[52ch]">
            {profile.heroLine}
          </p>

          <p style={riseDelay(110)} className="hero-rise text-step-neg1 text-ink-3 mt-4">
            {metaLine}
          </p>

          <div className="mt-6 flex items-end gap-4">
            <div className="relative h-14 w-full">
              <label htmlFor={inputId} className="sr-only">
                Search this site
              </label>

              {/* The resting affordance. Without it the field is just a rotating
                  word on a hairline, which reads as stray copy rather than a
                  control. Decorative only — the field is named by its label. */}
              <Search
                aria-hidden
                className="text-ink-2 pointer-events-none absolute top-1/2 left-0 size-[18px] -translate-y-1/2"
              />

              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (event.target.value.length > 0) setHasTyped(true);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") return;
                  event.preventDefault();
                  clear();
                  inputRef.current?.focus();
                }}
                aria-describedby={countId}
                autoComplete="off"
                spellCheck={false}
                className="text-step-1 text-ink h-14 w-full bg-transparent pr-10 pl-7 outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />

              {/* One line, always: the box stops where the input's own text stops (its
                  pr-10), and an example too long for a phone ends in an ellipsis
                  instead of wrapping onto the underline. */}
              {query.length === 0 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-10 left-7 flex items-center"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={exampleIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-step-1 text-ink-2 truncate"
                    >
                      {example}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}

              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="text-ink-3 hover:text-ink rounded-control absolute top-1/2 right-0 inline-flex size-8 -translate-y-1/2 items-center justify-center"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}

              <span
                aria-hidden
                className="hero-rule bg-ink-3/80 absolute inset-x-0 bottom-0 h-px origin-left"
              />

              <span
                aria-hidden
                className={cn(
                  "bg-accent absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-[240ms] ease-out",
                  focused ? "scale-x-100" : "scale-x-0",
                )}
              />
            </div>

            <p
              id={countId}
              aria-live="polite"
              className="text-step-neg1 text-ink-3 shrink-0 pb-4 font-mono"
            >
              {countLabel}
            </p>
          </div>
        </div>

        {/* Hidden below `sm` (40rem), a 320px block under the field until `lg`, hidden
            again from `lg` to 81rem, and the right-hand column from there. Beside the
            fixed text track the column is (viewport - 656px) / 2 wide with a classic
            16px scrollbar, which first reaches the block's 320px at 81rem (1296px); any
            smaller and its 13-unit labels drop below 10px. Both ranges must stay in
            step with WIDE_QUERY in similarity-field.tsx, which decides whether the
            dots mount at all. */}
        <div className="mt-10 hidden h-80 sm:block lg:mt-0 lg:aspect-square lg:h-auto lg:w-full lg:max-[81rem]:hidden">
          <SilentBoundary>
            <SimilarityField onEscape={() => inputRef.current?.focus()} />
          </SilentBoundary>
        </div>
      </div>
    </section>
  );
}
