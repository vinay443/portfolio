"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experience, projects, skills, type Domain } from "@/content";
import { useSearch } from "@/components/search/search-provider";
import { hybridRank } from "@/lib/hybrid";
import { hashString, mulberry32 } from "@/lib/prng";
import type { Rankable } from "@/lib/search";
import { DOMAIN_FILL } from "@/lib/domain";
import { cn } from "@/lib/cn";

const SIZE = 420;
const CENTER = SIZE / 2;
const EDGE = 18;
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        rankable: { id, title: skill, tags: [skill], searchText: skill.toLowerCase() },
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

const WIDE_QUERY = "(min-width: 640px)";

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

function Field() {
  const { appliedQuery, queryVector, isSearching, setQuery } = useSearch();
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Same ranking the rows use, so the field and the list never disagree.
  const order = useMemo(() => {
    if (!isSearching) return null;
    const ranked = hybridRank(RANKABLES, appliedQuery, queryVector);
    return new Map(ranked.map((result, index) => [result.item.id, index]));
  }, [isSearching, appliedQuery, queryVector]);

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

      {POINTS.map((point) => {
        const matched = order?.has(point.id) ?? false;
        const radius = order && matched ? 5.5 : 3;
        const opacity = !order ? 0.45 : matched ? 1 : 0.12;

        return (
          <motion.circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            initial={false}
            animate={{ r: radius, opacity }}
            transition={dotTransition}
            // A transparent stroke widens the hit area well past the painted dot.
            stroke="transparent"
            strokeWidth={10}
            tabIndex={0}
            role="button"
            className={cn(DOMAIN_FILL[point.domain], "cursor-pointer")}
            onMouseEnter={() => setActiveId(point.id)}
            onMouseLeave={() => release(point.id)}
            onFocus={() => setActiveId(point.id)}
            onBlur={() => release(point.id)}
            onClick={() => setQuery(point.label)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setQuery(point.label);
            }}
          >
            <title>{point.label}</title>
          </motion.circle>
        );
      })}

      {active ? <FieldLabel point={active} /> : null}
    </svg>
  );
}

/**
 * A live map of the content index. Decorative in effect: it renders nothing below
 * 640px, nothing before hydration, and nothing if it throws (see SilentBoundary),
 * and the page is complete without it.
 */
export function SimilarityField() {
  const wideEnough = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );

  return wideEnough ? <Field /> : null;
}
