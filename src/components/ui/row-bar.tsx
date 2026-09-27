import type { CSSProperties } from "react";
import type { Domain } from "@/content";
import { DOMAIN_BG } from "@/lib/domain";
import { cn } from "@/lib/cn";

/**
 * How a row placed within its group — direct or related matches — of a section's
 * ranking. Only meaningful while searching.
 */
export interface RowRank {
  searching: boolean;
  /**
   * The row's score on the fixed 0–1 scale of `displayScore()`. Absolute, not relative
   * to the other rows, so the best row reads 1.00 only when it earns it.
   */
  score: number;
  /** The bar's opacity: the score mapped onto 0.4–1, so the bar and the number agree. */
  relevance: number;
  /** First row of its group. Gets the wider bar. */
  isTop: boolean;
}

const RESTING_OPACITY = 0.35;

/**
 * The domain-hued bar on a row's left edge. At rest it is a quiet 35%; during a
 * search its opacity and width encode how strongly the row matched, so the page
 * explains its own ranking. The parent must be `relative` and a `group`.
 */
export function RowBar({ domain, rank }: { domain: Domain; rank: RowRank }) {
  const opacity = rank.searching ? rank.relevance : RESTING_OPACITY;
  const style = { "--bar-opacity": opacity } as CSSProperties;

  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 opacity-[var(--bar-opacity)] transition-opacity duration-[120ms] group-focus-within:opacity-100 group-hover:opacity-100",
        rank.searching && rank.isTop ? "w-[3px]" : "w-0.5",
        DOMAIN_BG[domain],
      )}
    />
  );
}

export function ScoreReadout({ rank }: { rank: RowRank }) {
  if (!rank.searching) return null;
  return (
    <span className="text-step-neg1 text-ink-3 shrink-0 font-mono tabular-nums">
      {rank.score.toFixed(2)}
    </span>
  );
}
