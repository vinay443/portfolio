import {
  MAX_TOKEN_SCORE,
  rank as lexicalRank,
  scoreItem,
  tokenize,
  type Rankable,
  type RankedItem,
} from "./search";
import { cosine, documentVector } from "./semantic";

/**
 * Cosine similarity below this counts as no semantic match at all.
 *
 * Tuned by hand against this corpus: MiniLM puts genuinely unrelated pairs
 * around 0.05–0.25, and the loosest match worth surfacing ("red teaming" against
 * the agent lab) sits comfortably above 0.3. Without a floor every document
 * scores something, and the whole page reorders on a query that matches nothing.
 */
export const SEMANTIC_FLOOR = 0.28;

export const SEMANTIC_WEIGHT = 0.6;
export const LEXICAL_WEIGHT = 0.4;

/**
 * Hybrid of the lexical scorer and cosine similarity. Falls back to pure lexical
 * ranking whenever there is no query vector — model still loading, model failed,
 * or embeddings never generated — so the feature can only ever add to the site.
 */
export function hybridRank<T extends Rankable & { id: string }>(
  items: T[],
  query: string,
  queryVector: number[] | null,
): RankedItem<T>[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return items.map((item) => ({ item, score: 0 }));
  }

  if (!queryVector) return lexicalRank(items, query);

  return items
    .map((item, index) => {
      // scoreItem is normalised per token but unbounded above; dividing by the
      // most one token can earn puts it on the same 0–1 scale as cosine, without
      // which the weights below would not mean anything.
      const lexical = Math.min(1, scoreItem(item, tokens) / MAX_TOKEN_SCORE);

      const vector = documentVector(item.id);
      const similarity = vector ? cosine(queryVector, vector) : 0;
      const semantic = similarity >= SEMANTIC_FLOOR ? similarity : 0;

      return {
        item,
        index,
        score: SEMANTIC_WEIGHT * semantic + LEXICAL_WEIGHT * lexical,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item, score }) => ({ item, score }));
}
