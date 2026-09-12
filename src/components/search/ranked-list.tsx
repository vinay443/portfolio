"use client";

import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearch } from "./search-provider";
import { type Rankable } from "@/lib/search";
import { hybridRank } from "@/lib/hybrid";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

const LAYOUT_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;
const ENTER_SECONDS = 0.18;
const EXIT_SECONDS = 0.12;

export function RankedList<T extends Rankable & { id: string }>({
  items,
  renderItem,
  label,
  className,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  /** Plural noun for the empty state, e.g. "roles". */
  label: string;
  className?: string;
}) {
  const { appliedQuery, queryVector } = useSearch();
  const reduceMotion = useReducedMotion();

  const ranked = useMemo(
    () => hybridRank(items, appliedQuery, queryVector),
    [items, appliedQuery, queryVector],
  );

  if (ranked.length === 0) {
    return (
      <EmptyState message={`No ${label} match that. Try "RAG", "Kafka", or clear the search.`} />
    );
  }

  if (reduceMotion) {
    return (
      <div className={cn("flex flex-col", className)}>
        {ranked.map(({ item }) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col", className)}>
      {/* popLayout pulls exiting rows out of flow so the survivors close the gap
          immediately instead of waiting for the exit to finish. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {ranked.map(({ item }) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: EXIT_SECONDS } }}
            transition={{ layout: LAYOUT_SPRING, opacity: { duration: ENTER_SECONDS } }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
