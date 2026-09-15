"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, type MotionProps, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { profile, searchExamples } from "@/content";
import { isPlaceholder } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useSearch } from "@/components/search/search-provider";
import { SimilarityField } from "@/components/hero/similarity-field";
import { SilentBoundary } from "@/components/ui/silent-boundary";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RISE_DURATION = 0.42;
const RULE_DURATION = 0.48;
const PLACEHOLDER_INTERVAL_MS = 3200;

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

  // useReducedMotion reads the media query during the first client render but is
  // null on the server. Anything that reaches the DOM — `initial` styles included —
  // must therefore be identical either way, or hydration keeps the server's
  // opacity:0 and the hero never appears. Only the transition, which is never
  // serialised, changes: reduced motion gets a zero-length one.
  const rise = (delay: number): MotionProps => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion ? { duration: 0 } : { duration: RISE_DURATION, ease: EASE, delay },
  });

  const example = searchExamples[exampleIndex] ?? searchExamples[0] ?? "";
  const availability = isPlaceholder(profile.availability) ? null : profile.availability;
  const metaLine = availability ? `${profile.location} · ${availability}` : profile.location;

  const countLabel = !isSearching
    ? ""
    : resultCount === 0
      ? "no matches"
      : `${resultCount} ${resultCount === 1 ? "match" : "matches"}`;

  return (
    <section className="px-6 pt-16 pb-12 md:px-12 md:pt-24 lg:px-20">
      {/* Without JS the entrance animation never runs, so the initial styles motion
          renders on the server would leave the hero invisible. */}
      <noscript>
        <style>{`.hero-rise{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="max-w-[72rem] lg:grid lg:grid-cols-[minmax(0,640px)_minmax(0,420px)] lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-[640px]">
          <motion.h1
            {...rise(0)}
            className="hero-rise text-step-4 md:text-step-6 leading-[1.05] font-semibold tracking-[-0.03em]"
          >
            {profile.name}
          </motion.h1>

          <motion.p {...rise(0.08)} className="hero-rise text-step-2 text-ink-2 mt-6 max-w-[52ch]">
            {profile.heroLine}
          </motion.p>

          <motion.p {...rise(0.14)} className="hero-rise text-step-neg1 text-ink-3 mt-4">
            {metaLine}
          </motion.p>

          <div className="mt-6 flex items-end gap-4">
            <div className="relative h-14 w-full">
              <label htmlFor={inputId} className="sr-only">
                Search this site
              </label>

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
                className="text-step-1 text-ink h-14 w-full bg-transparent pr-10 outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />

              {/* One line, always: the box stops where the input's own text stops (its
                  pr-10), and an example too long for a phone ends in an ellipsis
                  instead of wrapping onto the underline. */}
              {query.length === 0 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-10 left-0 flex items-center"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={exampleIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-step-1 text-ink-3 truncate"
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

              <motion.span
                aria-hidden
                className="hero-rise bg-rule absolute inset-x-0 bottom-0 h-px origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: RULE_DURATION, delay: 0.2, ease: EASE }
                }
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

        {/* Hidden below `sm` (40rem), a 320px block under the field until `lg`, and the
            right-hand column above that. `sm` must stay in step with WIDE_QUERY in
            similarity-field.tsx, which decides whether the dots mount at all. */}
        <div className="mt-10 hidden h-80 sm:block lg:mt-0 lg:aspect-square lg:h-auto lg:w-full">
          <SilentBoundary>
            <SimilarityField onEscape={() => inputRef.current?.focus()} />
          </SilentBoundary>
        </div>
      </div>
    </section>
  );
}
