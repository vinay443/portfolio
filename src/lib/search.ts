/**
 * Ranking for the site index. Pure and dependency-free on purpose: no React, no
 * content imports, no I/O, so it can be unit-tested in isolation.
 */

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "in",
  "on",
  "for",
  "with",
  "to",
  "is",
  "at",
]);

/**
 * The most a single token can contribute: 3 (headline) + 2 (label) + 1
 * (substring) + 0.5 (prefix). Hybrid ranking divides by it to put the lexical
 * score on the same 0-1 scale as cosine similarity.
 */
export const MAX_TOKEN_SCORE = 6.5;

/** Anything the ranker can score. Matches the content items structurally. */
export interface Rankable {
  searchText: string;
  title?: string;
  role?: string;
  tags?: string[];
  stack?: string[];
}

export interface RankedItem<T> {
  item: T;
  score: number;
}

// `+` and `#` survive so "c++" and "c#" stay one token; `/` is a separator so
// "kafka/redpanda" indexes as two.
const SEPARATORS = /[^\p{L}\p{N}+#.-]+/gu;
const EDGE_PUNCTUATION = /^[.-]+|[.-]+$/g;

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(SEPARATORS, " ")
    .split(" ")
    .map((token) => token.replace(EDGE_PUNCTUATION, ""))
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}

export function scoreItem(item: Rankable, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  const headlineWords = new Set([...tokenize(item.title ?? ""), ...tokenize(item.role ?? "")]);

  const labels = new Set<string>();
  for (const entry of [...(item.tags ?? []), ...(item.stack ?? [])]) {
    const whole = entry.toLowerCase().trim();
    if (whole.length > 0) labels.add(whole);
    for (const word of tokenize(entry)) labels.add(word);
  }

  const haystack = item.searchText;
  const haystackWords = tokenize(haystack);

  let total = 0;
  for (const token of tokens) {
    if (headlineWords.has(token)) total += 3;
    if (labels.has(token)) total += 2;
    if (haystack.includes(token)) total += 1;
    // Only counted when the token is a genuine prefix of a longer word, so it
    // stays a distinct signal rather than a bonus on every exact match.
    if (
      token.length >= 3 &&
      haystackWords.some((word) => word !== token && word.startsWith(token))
    ) {
      total += 0.5;
    }
  }

  return total / tokens.length;
}

export function rank<T extends Rankable>(items: T[], query: string): RankedItem<T>[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return items.map((item) => ({ item, score: 0 }));
  }

  return items
    .map((item, index) => ({ item, score: scoreItem(item, tokens), index }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item, score }) => ({ item, score }));
}
