"use client";

import { useMemo, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useSearch } from "./search-provider";
import { displayScore, rank as rankItems, type Rankable, type RankedItem } from "@/lib/search";
import { EmptyState } from "@/components/ui/empty-state";
import type { RowRank } from "@/components/ui/row-bar";
import { cn } from "@/lib/cn";

const LAYOUT_SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.8 } as const;
const ENTER_SECONDS = 0.18;
const EXIT_SECONDS = 0.12;

const MIN_RELEVANCE = 0.4;

interface Row<T> {
  item: T;
  rank: RowRank;
}

/**
 * Display values for one group. The score is absolute (`displayScore`), not scaled
 * to the group's best row, which read 1.00 however weakly it matched. One result of
 * that: a related row can read higher than a direct row above it. The tiers are a
 * rule about what was typed, and the number is not bent to agree with them.
 */
function toRows<T>(results: RankedItem<T>[], searching: boolean): Row<T>[] {
  return results.map(({ item, totalScore }, index) => {
    const score = displayScore(totalScore);
    return {
      item,
      rank: {
        searching,
        score,
        isTop: index === 0,
        relevance: MIN_RELEVANCE + (1 - MIN_RELEVANCE) * score,
      },
    };
  });
}

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
  /** Applied to each group of rows, so spacing like `gap-10` holds within a group. */
  className?: string;
}) {
  const { parsedQuery, isSearching } = useSearch();
  const reduceMotion = useReducedMotion();

  const { direct, related } = useMemo(() => {
    const results = rankItems(items, parsedQuery);
    // With no query every score is zero, so everything stays in the first group
    // and the list renders exactly as it did before grouping existed.
    const directResults = isSearching
      ? results.filter((result) => result.directScore > 0)
      : results;
    const relatedResults = isSearching ? results.filter((result) => result.directScore === 0) : [];

    return {
      direct: toRows(directResults, isSearching),
      related: toRows(relatedResults, isSearching),
    };
  }, [items, parsedQuery, isSearching]);

  if (direct.length === 0 && related.length === 0) {
    return (
      <EmptyState message={`No ${label} match that. Try "RAG", "Kafka", or clear the search.`} />
    );
  }

  const showDivider = direct.length > 0 && related.length > 0;

  // Both group containers are always mounted, so a row that stays in its group is
  // never remounted, and an empty group is a zero-height div that changes nothing.
  // role="group" only while searching and non-empty: that is when it means something.
  const renderGroup = (rows: Row<T>[], groupLabel: string) => (
    <div
      role={isSearching && rows.length > 0 ? "group" : undefined}
      aria-label={isSearching && rows.length > 0 ? groupLabel : undefined}
      className={cn("relative flex flex-col", className)}
    >
      {/* popLayout pulls exiting rows out of flow so the survivors close the gap
          immediately instead of waiting for the exit to finish. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {rows.map(({ item, rank }) => (
          <motion.div
            key={item.id}
            // A row crossing between groups is a new element in a new parent;
            // the shared layoutId lets it travel there instead of blinking.
            layoutId={reduceMotion ? undefined : item.id}
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

  // One render path for both motion preferences. useReducedMotion is null on the
  // server but already true on the first client render, so branching the markup on
  // it would mismatch on hydration. `layout` and transitions never reach the DOM.
  return (
    // Scoped by label so the experience and project lists never share layoutIds.
    <LayoutGroup id={label}>
      <div className="relative flex flex-col">
        {renderGroup(direct, "Direct matches")}

        <AnimatePresence initial={false}>
          {showDivider ? (
            // Decorative: the groups carry their own labels for assistive tech.
            <motion.div
              key="divider"
              aria-hidden
              layout={!reduceMotion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : EXIT_SECONDS } }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { layout: LAYOUT_SPRING, opacity: { duration: ENTER_SECONDS } }
              }
              className="flex items-center gap-4 pt-10 pb-4"
            >
              <span className="text-step-neg1 text-ink-3 shrink-0">Related matches</span>
              <span className="bg-rule h-px flex-1" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {renderGroup(related, "Related matches")}
      </div>
    </LayoutGroup>
  );
}
