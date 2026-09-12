import { Fragment, type ReactNode } from "react";

const MARK_CLASSES =
  "decoration-accent bg-transparent text-inherit underline decoration-2 underline-offset-2";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps every occurrence of `tokens` in `text` with a <mark>. Returns React nodes
 * rather than markup so nothing from the content layer is ever parsed as HTML.
 */
export function highlight(text: string, tokens: string[]): ReactNode {
  const usable = tokens.filter((token) => token.length > 0);
  if (usable.length === 0) return text;

  // Longest first: within an alternation the leftmost branch wins, so without this
  // a short token would match before a longer one that starts with it.
  const pattern = [...usable]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  const parts = text.split(new RegExp(`(${pattern})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        // One capture group, so every odd index is a match.
        index % 2 === 1 ? (
          <mark key={index} className={MARK_CLASSES}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
