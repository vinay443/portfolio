"use client";

import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearch } from "./search-provider";
import { type Rankable } from "@/lib/search";
import { hybridRank } from "@/lib/hybrid";
import { EmptyState } from "@/components/ui/empty-state";
import type { RowRank } from "@/components/ui/row-bar";
import { cn } from "@/lib/cn";

const LAYOUT_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;
const ENTER_SECONDS = 0.18;
const EXIT_SECONDS = 0.12;

const MIN_RELEVANCE = 0.4;

export function RankedList<T extends Rankable & { id: string }>({
  items,
  renderItem,
  label,
  className,
}: {
  items: T[];
  renderItem: (item: T, rank: RowRank) => ReactNode;
  /** Plural noun for the empty state, e.g. "roles". */
  label: string;
  className?: string;
}) {
  const { appliedQuery, queryVector, isSearching } = useSearch();
  const reduceMotion = useReducedMotion();

  const ranked = useMemo(() => {
    const results = hybridRank(items, appliedQuery, queryVector);
    const scores = results.map((result) => result.score);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const spread = highest - lowest;

    return results.map(({ item, score }, index) => ({
      item,
      rank: {
        searching: isSearching,
        score,
        isTop: index === 0,
        // Relative to this section only: its weakest row is 0.4, its strongest 1.
        relevance:
          spread === 0 ? 1 : MIN_RELEVANCE + ((1 - MIN_RELEVANCE) * (score - lowest)) / spread,
      } satisfies RowRank,
    }));
  }, [items, appliedQuery, queryVector, isSearching]);

  if (ranked.length === 0) {
    return (
      <EmptyState message={`No ${label} match that. Try "RAG", "Kafka", or clear the search.`} />
    );
  }

  // One render path for both motion preferences. useReducedMotion is null on the
  // server but already true on the first client render, so branching the markup on
  // it would mismatch on hydration. `layout` and transitions never reach the DOM.
  return (
    <div className={cn("relative flex flex-col", className)}>
      {/* popLayout pulls exiting rows out of flow so the survivors close the gap
          immediately instead of waiting for the exit to finish. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {ranked.map(({ item, rank }) => (
          <motion.div
            key={item.id}
            layout={!reduceMotion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: reduceMotion ? 0 : EXIT_SECONDS },
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { layout: LAYOUT_SPRING, opacity: { duration: ENTER_SECONDS } }
            }
          >
            {renderItem(item, rank)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
