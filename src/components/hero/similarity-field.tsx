"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experience, projects, skills, skillSearchText, type Domain } from "@/content";
import { useSearch } from "@/components/search/search-provider";
import { hashString, mulberry32 } from "@/lib/prng";
import { rank, type Rankable } from "@/lib/search";
import { DOMAIN_FILL } from "@/lib/domain";

const SIZE = 420;
const CENTER = SIZE / 2;
const EDGE = 18;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// `r` stays fixed at the matched size and resting dots are scaled down to 3 units.
// Animating `r` rebuilt every circle's geometry on every frame; a transform does not.
const DOT_RADIUS = 5.5;
const RESTING_SCALE = 3 / DOT_RADIUS;
// Constant and unscaled, so a dot's hit area does not shrink along with it.
const HIT_RADIUS = 8;
// Up and Down move this many dots at a time.
const ROW_STEP = 5;

// One neighbourhood per domain, arranged loosely around the centre so the hues
// read as regions rather than noise.
const CENTROIDS: Record<Domain, readonly [number, number]> = {
  retrieval: [210, 96],
  model: [326, 184],
  infra: [280, 320],
  verified: [140, 320],
  adversary: [94, 184],
};

interface FieldPoint {
  id: string;
  label: string;
  domain: Domain;
  x: number;
  y: number;
}

type FieldRankable = Rankable & { id: string };

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function place(value: number): number {
  return Math.round(Math.min(SIZE - EDGE, Math.max(EDGE, value)) * 10) / 10;
}

// Skills are split into one point per skill rather than one per group: seven group
// dots cannot form neighbourhoods, and clicking "Kafka/Redpanda" is a better query
// than clicking "Data & Messaging".
const entries: { point: Omit<FieldPoint, "x" | "y">; rankable: FieldRankable }[] = [
  ...experience.map((item) => ({
    point: { id: item.id, label: item.role, domain: item.domain },
    rankable: item,
  })),
  ...projects
    .filter((item) => !item.sensitive)
    .map((item) => ({
      point: { id: item.id, label: item.title, domain: item.domain },
      rankable: item,
    })),
  ...skills.flatMap((group) =>
    group.skills.map((skill) => {
      const id = `${group.id}:${slugify(skill)}`;
      return {
        point: { id, label: skill, domain: group.domain },
        rankable: { id, title: skill, tags: [skill], searchText: skillSearchText(skill) },
      };
    }),
  ),
];

const domainCounts = new Map<Domain, number>();
for (const { point } of entries) {
  domainCounts.set(point.domain, (domainCounts.get(point.domain) ?? 0) + 1);
}

// Computed once at module load. Seeded by id, so every render, every reload and
// every visitor sees exactly the same field.
const POINTS: FieldPoint[] = entries.map(({ point }) => {
  const random = mulberry32(hashString(point.id));
  const [centreX, centreY] = CENTROIDS[point.domain];
  const radius = 30 + 8 * Math.sqrt(domainCounts.get(point.domain) ?? 1);
  const angle = random() * Math.PI * 2;
  const distance = Math.sqrt(random()) * radius;

  return {
    ...point,
    x: place(centreX + Math.cos(angle) * distance),
    y: place(centreY + Math.sin(angle) * distance),
  };
});

const RANKABLES: FieldRankable[] = entries.map(({ rankable }) => rankable);
const POINT_BY_ID = new Map(POINTS.map((point) => [point.id, point]));

// The ranges in which the hero shows this field's container: from `sm:` until
// `lg:`, then again from 81rem, where `lg:max-[81rem]:hidden` stops hiding it. A rem
// in a media query resolves against the browser's default font size in CSS and in
// matchMedia alike, so the container and the dots switch at the same widths
// whatever that size is. Change both together.
const WIDE_QUERY = "(40rem <= width < 64rem), (width >= 81rem)";

function subscribeWide(listener: () => void): () => void {
  const media = window.matchMedia(WIDE_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function FieldLabel({ point }: { point: FieldPoint }) {
  const flip = point.x > SIZE * 0.62;
  const x = flip ? point.x - 13 : point.x + 13;
  const y = point.y < 30 ? point.y + 22 : point.y - 11;

  return (
    <g aria-hidden className="pointer-events-none">
      <circle
        cx={point.x}
        cy={point.y}
        r={9}
        fill="none"
        strokeWidth={1.25}
        className="stroke-retrieval"
      />
      <text
        x={x}
        y={y}
        textAnchor={flip ? "end" : "start"}
        fontSize={13}
        fontWeight={500}
        className="fill-ink font-sans"
        style={{ paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 4, strokeLinejoin: "round" }}
      >
        {point.label}
      </text>
    </g>
  );
}

function Field({ onEscape }: { onEscape?: () => void }) {
  const { parsedQuery, isSearching, setQuery } = useSearch();
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  // Roving tabindex: the field is one tab stop, and this is the dot that holds it.
  const [focusIndex, setFocusIndex] = useState(0);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);

  // Same ranking the rows use, so the field and the list never disagree. Keyed on
  // the parsed debounced query, so hovering or moving focus never re-ranks.
  const order = useMemo(() => {
    if (!isSearching) return null;
    const ranked = rank(RANKABLES, parsedQuery);
    return new Map(ranked.map((result, index) => [result.item.id, index]));
  }, [isSearching, parsedQuery]);

  const matchedByScore = useMemo(
    () =>
      order
        ? POINTS.filter((point) => order.has(point.id)).sort(
            (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
          )
        : [],
    [order],
  );

  const dotTransition = reduceMotion ? { duration: 0 } : { duration: 0.26, ease: EASE };
  const active = activeId ? POINT_BY_ID.get(activeId) : undefined;

  const release = (id: string) => setActiveId((current) => (current === id ? null : current));

  // DOM focus moves with the index, not after it, so screen readers announce the
  // new dot straight away. Focusing a tabIndex -1 element from script is allowed.
  const moveFocus = (index: number) => {
    const next = Math.min(POINTS.length - 1, Math.max(0, index));
    setFocusIndex(next);
    dotRefs.current[next]?.focus();
  };

  const onDotKeyDown = (event: KeyboardEvent<SVGGElement>, point: FieldPoint, index: number) => {
    // Leave browser shortcuts such as Alt+Left alone.
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
      case "ArrowRight":
        moveFocus(index + 1);
        break;
      case "ArrowLeft":
        moveFocus(index - 1);
        break;
      case "ArrowDown":
        moveFocus(index + ROW_STEP);
        break;
      case "ArrowUp":
        moveFocus(index - ROW_STEP);
        break;
      case "Home":
        moveFocus(0);
        break;
      case "End":
        moveFocus(POINTS.length - 1);
        break;
      case "Enter":
      case " ":
        setQuery(point.label);
        break;
      case "Escape":
        onEscape?.();
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="xMinYMid meet"
      role="group"
      aria-hidden="false"
      aria-label="Every item on this page, clustered by domain"
      className="h-full w-full overflow-visible"
    >
      {reduceMotion ? null : (
        <g aria-hidden>
          <AnimatePresence>
            {matchedByScore.map((point, rankIndex) => (
              <motion.line
                key={point.id}
                x1={CENTER}
                y1={CENTER}
                x2={point.x}
                y2={point.y}
                strokeWidth={1}
                strokeOpacity={0.3}
                className="stroke-retrieval"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.32, ease: EASE, delay: rankIndex * 0.024 }}
              />
            ))}
          </AnimatePresence>
        </g>
      )}

      {POINTS.map((point, index) => {
        const matched = order?.has(point.id) ?? false;
        const scale = order && matched ? 1 : RESTING_SCALE;
        const opacity = !order ? 0.45 : matched ? 1 : 0.12;

        return (
          <g
            key={point.id}
            ref={(node) => {
              dotRefs.current[index] = node;
            }}
            tabIndex={index === focusIndex ? 0 : -1}
            role="button"
            className="cursor-pointer"
            onMouseEnter={() => setActiveId(point.id)}
            onMouseLeave={() => release(point.id)}
            onFocus={() => {
              setActiveId(point.id);
              // A click or a Shift+Tab back in also moves the tab stop here.
              setFocusIndex(index);
            }}
            onBlur={() => release(point.id)}
            onClick={() => setQuery(point.label)}
            onKeyDown={(event) => onDotKeyDown(event, point, index)}
          >
            <title>{point.label}</title>
            <circle cx={point.x} cy={point.y} r={HIT_RADIUS} fill="transparent" />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={DOT_RADIUS}
              initial={false}
              animate={{ scale, opacity }}
              transition={dotTransition}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              className={DOMAIN_FILL[point.domain]}
            />
          </g>
        );
      })}

      {active ? <FieldLabel point={active} /> : null}
    </svg>
  );
}

/**
 * A live map of the content index. Decorative in effect: it renders nothing below
 * 40rem or between 64rem and 81rem, nothing before hydration, and nothing if it
 * throws (see SilentBoundary), and the page is complete without it.
 */
export function SimilarityField({
  onEscape,
}: {
  /** Called when Escape is pressed on a dot. The hero returns focus to its field. */
  onEscape?: () => void;
}) {
  const wideEnough = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );

  return wideEnough ? <Field onEscape={onEscape} /> : null;
}
