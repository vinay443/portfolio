/**
 * Every programmatic scroll on the site goes through here.
 *
 * The page deliberately does not set `scroll-behavior: smooth` on <html>. That
 * turns the browser's own fragment scroll into an animation, and on a cross-page
 * deep link that animation starts before hydration and layout have settled and
 * never arrives — `/#contact` landed the visitor at the top of the homepage.
 * Animating per scroll instead means the distance is known at the call site, so
 * a long jump can skip the animation rather than crawl through it.
 */

/** The sticky header's height. Keep in step with `h-14` and the `scroll-mt-14` on sections. */
export const HEADER_HEIGHT = 56;

/**
 * Past roughly a viewport and a half, an animated scroll stops reading as a
 * transition and starts reading as a wait, so those jump instead. Every animated
 * scroll is therefore short by construction and lands well inside a second.
 */
const MAX_SMOOTH_DISTANCE = 1200;

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Where the page has to sit for `element` to clear the sticky header. */
export function scrollTargetFor(element: HTMLElement): number {
  const top = element.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, Math.round(top - HEADER_HEIGHT));
}

/**
 * Animated only when it is both short and wanted. `behavior` is passed per call
 * rather than left to CSS, because an explicit behavior overrides the stylesheet
 * and is the only way to decide this per distance.
 */
export function scrollToElement(element: HTMLElement): void {
  const top = scrollTargetFor(element);
  const isFar = Math.abs(top - window.scrollY) > MAX_SMOOTH_DISTANCE;
  const behavior: ScrollBehavior = isFar || prefersReducedMotion() ? "instant" : "smooth";

  window.scrollTo({ top, behavior });
}

/**
 * Puts the page on the element named by `location.hash` and holds it there while
 * the page settles.
 *
 * A single scroll on mount would race exactly as the browser's own does: the hero
 * reveal, the dot field mounting and webfonts swapping all change how tall the
 * content above the target is, and each one moves the target after the scroll has
 * already happened. So this re-aligns on a ResizeObserver over <body> — the real
 * signal that the document's height changed — and stops on real signals too: once
 * `load` and `document.fonts.ready` have both resolved there is nothing left to
 * settle. No timers, and nothing that keeps firing after the page is stable.
 *
 * Any scroll the visitor starts themselves ends it immediately, so this can never
 * drag someone back to a section they just scrolled away from. Those are input
 * events rather than the scroll event, which our own `scrollTo` would also raise.
 *
 * Returns a cleanup function.
 */
export function alignToHash(): () => void {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const target = id ? document.getElementById(id) : null;
  if (!target) return () => {};

  const USER_INPUT = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  let live = true;

  const align = () => {
    if (!live) return;
    const top = scrollTargetFor(target);
    // A sub-pixel difference is not worth a scroll, and re-scrolling to where we
    // already are would cancel a smooth scroll the visitor started.
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
  };

  const observer = new ResizeObserver(align);

  const stop = () => {
    if (!live) return;
    live = false;
    observer.disconnect();
    for (const type of USER_INPUT) window.removeEventListener(type, stop);
  };

  for (const type of USER_INPUT) window.addEventListener(type, stop, { passive: true });

  align();
  // <body> and not <html>: html carries `h-full`, so its box is the viewport and
  // never changes when content above the target grows.
  observer.observe(document.body);

  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true }),
        );
  const fonts = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();

  void Promise.all([loaded, fonts]).then(() => {
    align();
    stop();
  });

  return stop;
}
