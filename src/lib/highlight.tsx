import { Fragment, type ReactNode } from "react";
import { directSpans, type ParsedQuery } from "./search";

const MARK_BASE = "bg-transparent text-inherit underline";

/**
 * `body` is for running text. `heading` is for titles and roles: they are large and
 * already high-contrast, so the body's full-strength rule competes with them. The
 * heading mark keeps the same accent hue and thickness at half strength, and sits
 * further below the text so it clears descenders at that size.
 */
const MARK_TONES = {
  body: "decoration-accent decoration-2 underline-offset-2",
  heading: "decoration-accent/50 decoration-2 underline-offset-4",
} as const;

export type MarkTone = keyof typeof MARK_TONES;

/**
 * Wraps what the visitor typed in `text` with a <mark>. Deciding what matched is not
 * done here: `directSpans()` finds it with the same `directMatches()` the ranker
 * counts toward the direct score, so a mark always has a score behind it and a
 * stemmed match such as the "learn" in "scikit-learn" is marked too. Synonyms are
 * never marked.
 *
 * Returns React nodes rather than markup so nothing from the content layer is ever
 * parsed as HTML.
 */
export function highlight(text: string, query: ParsedQuery, tone: MarkTone = "body"): ReactNode {
  const spans = directSpans(text, query);
  if (spans.length === 0) return text;

  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const { start, end } of spans) {
    nodes.push(<Fragment key={`text-${start}`}>{text.slice(cursor, start)}</Fragment>);
    nodes.push(
      <mark key={`mark-${start}`} className={`${MARK_BASE} ${MARK_TONES[tone]}`}>
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }
  nodes.push(<Fragment key="rest">{text.slice(cursor)}</Fragment>);

  return <>{nodes}</>;
}
