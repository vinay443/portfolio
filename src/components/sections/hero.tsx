"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, type MotionProps, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { profile, searchExamples } from "@/content";
import { isPlaceholder } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useSearch } from "@/components/search/search-provider";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const RISE_DURATION = 0.42;
const RULE_DURATION = 0.48;
const PLACEHOLDER_INTERVAL_MS = 3200;

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

  useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(
      () => setExampleIndex((index) => (index + 1) % searchExamples.length),
      PLACEHOLDER_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [cycling]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const rise = (delay: number): MotionProps =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: RISE_DURATION, ease: EASE, delay },
        };

  const example = searchExamples[exampleIndex] ?? searchExamples[0] ?? "";
  const availability = isPlaceholder(profile.availability) ? null : profile.availability;
  const metaLine = availability ? `${profile.location} · ${availability}` : profile.location;
  const countLabel = !isSearching
    ? ""
    : resultCount === 0
      ? "no matches"
      : `${resultCount} ${resultCount === 1 ? "match" : "matches"}`;

  return (
    <section className="px-6 pt-20 pb-16 md:px-12 md:pt-28 lg:px-20">
      {/* Without JS the entrance animation never runs, so the initial styles motion
          renders on the server would leave the hero invisible. */}
      <noscript>
        <style>{`.hero-rise{opacity:1!important;transform:none!important}`}</style>
      </noscript>

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

      <div className="mt-12 flex items-end gap-4">
        <div className="relative h-14 w-full max-w-[640px]">
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

          {query.length === 0 && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={exampleIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-step-1 text-ink-3"
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
            initial={reduceMotion ? undefined : { scaleX: 0 }}
            animate={reduceMotion ? undefined : { scaleX: 1 }}
            transition={{ duration: RULE_DURATION, delay: 0.2, ease: EASE }}
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
    </section>
  );
}
