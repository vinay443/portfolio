/**
 * Ranking for the site index. Pure and dependency-free on purpose: no React, no
 * content imports, no I/O, so it can be unit-tested in isolation.
 */

import {
  containsPhrase,
  expand,
  foldWord,
  phraseStarts,
  splitHyphens,
  toMatchWords,
  type Expansion,
  type Phrase,
} from "./expansion";

/**
 * Dropped from queries and from content alike. Visitors ask questions, and in "what
 * did you study" only "study" is about anything: left in, "what" matched the one
 * project that happens to say "what", and ranked it first.
 *
 * A word listed here can never be searched for. That rules out "may" (the dates say
 * "May 2025") and "list" ("Dean's List"). "go" is listed although it names a
 * language, because nothing on the site is written in Go and "where did you go to
 * college" is not about one.
 */
const STOPWORDS = new Set(
  [
    // Function words.
    "a an the and or of in on for with to is at as by from into about not than this that",
    "these those there here any some",
    // Question words and auxiliaries.
    "what which who whom whose where when why how",
    "do does did done be am are was were been being have has had can could would should will",
    // Pronouns in every person: a visitor may ask "you", or write about the owner.
    "i me my mine you your yours we us our he him his she her they them their it its",
    // Request verbs and fillers.
    "tell show give get got go went please ever",
    // What an apostrophe leaves behind: the tokenizer splits on it, so "what's" is
    // "what" and "s", and "s" matched every "Dean's" and "attack's" on the page.
    "s t d m ll re ve",
  ].flatMap((line) => line.split(" ")),
);

const HEADLINE_WEIGHT = 3;
const LABEL_WEIGHT = 2;
const BODY_WEIGHT = 1;
const PREFIX_WEIGHT = 0.5;
/** The word still being typed must be this long before it matches as a prefix. */
const PREFIX_MIN_LENGTH = 3;

/**
 * An expanded match earns this fraction of what the same match earns when typed,
 * so a synonym never counts for as much as the word itself.
 */
export const EXPANSION_WEIGHT = 0.4;

/**
 * The least one typed word earns when an item names it rather than mentions it: a
 * tag or stack entry, which `searchText` always repeats. A title or role hit earns
 * more and is capped at the same place.
 */
const FULL_MATCH = LABEL_WEIGHT + BODY_WEIGHT;

/**
 * The score a row displays, on a fixed 0–1 scale: the per-token score over
 * `FULL_MATCH`, capped at 1. Fixed rather than scaled to the best row on the page,
 * so 1.00 means the item names every word typed, and a query nothing answers well
 * reads low instead of crowning whatever matched least badly.
 */
export function displayScore(totalScore: number): number {
  return Math.min(1, totalScore / FULL_MATCH);
}

/** Anything the ranker can score. Matches the content items structurally. */
export interface Rankable {
  searchText: string;
  title?: string;
  role?: string;
  tags?: string[];
  stack?: string[];
}

export interface ItemScore {
  /**
   * Typed terms only: whole-word hits, plus the prefix bonus on the word still being
   * typed. Counting that prefix keeps "kaf" from filing the Kafka project under
   * related for one keystroke. Above zero places the item in the top tier.
   */
  directScore: number;
  /** Direct and expanded together. Orders items within a tier; `displayScore()` shows it. */
  totalScore: number;
}

export interface RankedItem<T> extends ItemScore {
  item: T;
}

export interface ParsedQuery {
  /** The visitor's own terms, stopwords removed. The only terms ever highlighted. */
  tokens: string[];
  /**
   * The last token, while the visitor may still be typing it: the only token that
   * earns the prefix bonus and is highlighted as a prefix. Null once the query ends
   * in a space or other separator, or when the word being typed is a stopword.
   */
  partialToken: string | null;
  /** Curated synonym groups those terms reach. Scored, never highlighted. */
  expansions: Expansion[];
}

export const EMPTY_QUERY: ParsedQuery = { tokens: [], partialToken: null, expansions: [] };

// `+` and `#` survive so "c++" and "c#" stay one token; `/` is a separator so
// "kafka/redpanda" indexes as two.
const SEPARATORS = /[^\p{L}\p{N}+#.-]+/gu;
const EDGE_PUNCTUATION = /^[.-]+|[.-]+$/g;
/**
 * The input ends on a character that belongs to a word, so that word may be
 * unfinished. `.` and `-` count: "next." may be on its way to "next.js".
 */
const ENDS_INSIDE_WORD = /[\p{L}\p{N}+#.-]$/u;

function splitWords(input: string): string[] {
  return input
    .toLowerCase()
    .replace(SEPARATORS, " ")
    .split(" ")
    .map((word) => word.replace(EDGE_PUNCTUATION, ""))
    .filter((word) => word.length > 0);
}

/** Splits any text, query or content, into lowercase words. Never expands. */
export function tokenize(input: string): string[] {
  return splitWords(input).filter((word) => !STOPWORDS.has(word));
}

/** A [start, end) range of code-unit offsets. */
export interface Span {
  start: number;
  end: number;
}

/** One word of some text in the form every comparison uses, and where it came from. */
export interface Word {
  /** Lowercased, hyphens split, not folded. What the word being typed is a prefix of. */
  plain: string;
  /** `plain` folded. What whole words and phrases are compared on. */
  folded: string;
  /** Where `plain` starts in the lowercased text. */
  start: number;
}

/**
 * The words of `input` as the scorer compares them, `splitHyphens(tokenize(input))`,
 * each kept with its offset so a match can be found again in the text. Built from
 * those same functions rather than a second tokenizer, so the two cannot split
 * differently.
 */
export function toWords(input: string): Word[] {
  const lower = input.toLowerCase();
  const words: Word[] = [];
  let cursor = 0;

  for (const word of splitWords(input)) {
    // Words come back in order, and everything between two of them is separators or
    // trimmed edge punctuation, which no word begins with, so the first occurrence
    // from the cursor on is this word. Stopwords advance the cursor too, so "he" is
    // never found inside an earlier "the".
    const start = lower.indexOf(word, cursor);
    cursor = start + word.length;
    if (STOPWORDS.has(word)) continue;

    let partCursor = 0;
    for (const part of splitHyphens([word])) {
      const partStart = word.indexOf(part, partCursor);
      partCursor = partStart + part.length;
      words.push({ plain: part, folded: foldWord(part), start: start + partStart });
    }
  }

  return words;
}

/** A stretch of text one typed token matched, as offsets into the lowercased text. */
export interface DirectMatch extends Span {
  /** Matched as the start of a longer word, not as a whole word. */
  prefix: boolean;
}

/**
 * Every place a token the visitor typed matches `words` directly. This is the only
 * definition of a direct match: the scorer counts what it returns and `highlight()`
 * marks what it returns, so the two cannot disagree about whether a word matched.
 *
 * Whole words compare folded, so "attacks" matches "attack" and "learning" matches
 * the "learn" in "scikit-learn", and a hyphenated token matches the same words in a
 * row. Only the word still being typed (`isFinal`) also matches as the start of a
 * longer word, so "kaf" reaches "kafka" while a finished word like the "red" in
 * "red team" never reaches "reducing". A prefix is anchored to the start of a word,
 * never the middle, and is skipped where the folded forms agree, because the whole
 * word already matched there.
 */
export function directMatches(
  words: readonly Word[],
  token: string,
  isFinal: boolean,
): DirectMatch[] {
  const matches: DirectMatch[] = [];

  const phrase = toMatchWords([token]);
  const folded = words.map((word) => word.folded);
  for (const first of phraseStarts(folded, phrase)) {
    for (const word of words.slice(first, first + phrase.length)) {
      matches.push({ start: word.start, end: word.start + word.plain.length, prefix: false });
    }
  }

  if (isFinal && token.length >= PREFIX_MIN_LENGTH) {
    const foldedToken = foldWord(token);
    for (const word of words) {
      if (word.plain.startsWith(token) && word.folded !== foldedToken) {
        matches.push({ start: word.start, end: word.start + token.length, prefix: true });
      }
    }
  }

  return matches;
}

/**
 * The typed tokens, each with whether it is the word still being typed. Scoring and
 * highlighting both read this, so they agree on which word may match as a prefix.
 */
function typedTokens(query: ParsedQuery): { token: string; isFinal: boolean }[] {
  return query.tokens.map((token, index) => ({
    token,
    isFinal: index === query.tokens.length - 1 && token === query.partialToken,
  }));
}

/**
 * Maps [start, end) offsets in `text.toLowerCase()` back onto `text`. Lowercasing a
 * string gives the same lengths as lowercasing it one character at a time (final
 * sigma only chooses between two one-unit letters), but not always the same length
 * as the original: "İ" becomes two code units. So offsets are mapped, not assumed.
 */
function sourceSpan(text: string): (lowered: Span) => Span {
  // For each code unit of the lowercased text, the character of `text` it came from.
  const charStart: number[] = [];
  const charEnd: number[] = [];
  let offset = 0;
  for (const char of text) {
    for (let unit = 0; unit < char.toLowerCase().length; unit += 1) {
      charStart.push(offset);
      charEnd.push(offset + char.length);
    }
    offset += char.length;
  }
  return ({ start, end }) => ({
    start: charStart[start] ?? offset,
    end: charEnd[end - 1] ?? offset,
  });
}

/**
 * What `highlight()` marks in `text`: the direct matches of every typed token, as
 * sorted, non-overlapping spans of `text` itself. Synonyms are never included.
 */
export function directSpans(text: string, query: ParsedQuery): Span[] {
  const words = toWords(text);
  const found = typedTokens(query)
    .flatMap(({ token, isFinal }) => directMatches(words, token, isFinal))
    .sort((a, b) => a.start - b.start);
  if (found.length === 0) return [];

  const merged: Span[] = [];
  for (const { start, end } of found) {
    const last = merged.at(-1);
    if (last && start <= last.end) {
      last.end = Math.max(last.end, end);
    } else {
      merged.push({ start, end });
    }
  }

  return merged.map(sourceSpan(text));
}

/**
 * The query-side entry point: the visitor's tokens, the one that may be unfinished,
 * and the synonym groups they reach. Expansion lives here rather than inside
 * `tokenize()` because `tokenize()` also splits titles, labels and `searchText`,
 * which must never be expanded, and because highlighting reads the tokens and must
 * only mark what was typed.
 *
 * "kaf" leaves "kaf" partial. "red team" leaves only "team" partial, so "red" never
 * reaches "reducing". "kafka " (trailing space) and "kafka and" leave nothing
 * partial: the last word the visitor typed is finished, or is a stopword.
 */
export function parseQuery(input: string): ParsedQuery {
  const tokens = tokenize(input);
  const lastWord = splitWords(input).at(-1);
  const partialToken =
    lastWord !== undefined && ENDS_INSIDE_WORD.test(input) && !STOPWORDS.has(lastWord)
      ? lastWord
      : null;

  return { tokens, partialToken, expansions: expand(tokens) };
}

/** Whether an item matches at all: typed or expanded. Used where only that matters, like dimming. */
export function scoreItem(item: Rankable, query: ParsedQuery): number {
  return scoreParts(item, query).totalScore;
}

function scoreParts(item: Rankable, query: ParsedQuery): ItemScore {
  const { tokens, expansions } = query;
  if (tokens.length === 0) return { directScore: 0, totalScore: 0 };

  const title = toWords(item.title ?? "");
  const role = toWords(item.role ?? "");
  const labels = [...(item.tags ?? []), ...(item.stack ?? [])].map(toWords);
  const body = toWords(item.searchText);

  // The same field weights for a typed term and an expanded one.
  const fieldScore = (contains: (words: Word[]) => boolean): number => {
    let score = 0;
    if (contains(title) || contains(role)) score += HEADLINE_WEIGHT;
    if (labels.some(contains)) score += LABEL_WEIGHT;
    if (contains(body)) score += BODY_WEIGHT;
    return score;
  };

  let direct = 0;
  for (const { token, isFinal } of typedTokens(query)) {
    direct += fieldScore((words) =>
      directMatches(words, token, isFinal).some((match) => !match.prefix),
    );
    // The prefix bonus is looked for in the body only, and counted once per token.
    if (directMatches(body, token, isFinal).some((match) => match.prefix)) {
      direct += PREFIX_WEIGHT;
    }
  }

  // One phrase rule for typed and expanded terms alike (`phraseStarts`): whole words
  // and whole phrases on word boundaries, never a substring inside a longer word.
  const containsExpanded = (phrase: Phrase) => (words: Word[]) =>
    containsPhrase(words.map((word) => word.folded), phrase);

  let expanded = 0;
  for (const group of expansions) {
    // The best member only. Summing would reward an item for listing synonyms
    // rather than for being about the concept.
    let best = 0;
    for (const phrase of group) best = Math.max(best, fieldScore(containsExpanded(phrase)));
    // No prefix signal: prefixes catch a word still being typed, and nobody typed this.
    expanded += EXPANSION_WEIGHT * best;
  }

  return {
    directScore: direct / tokens.length,
    totalScore: (direct + expanded) / tokens.length,
  };
}

/**
 * Two tiers, then score. Every item containing something the visitor typed ranks
 * above every item reached only through a synonym; within each tier the blended
 * total orders them, and ties keep authored order.
 *
 * The tier is a boolean, not the direct score itself. Sorting on the direct score
 * would let a slightly stronger literal hit outrank an item that also contains the
 * typed word but is far more about the concept once its synonyms are counted.
 */
export function rank<T extends Rankable>(items: T[], query: ParsedQuery): RankedItem<T>[] {
  if (query.tokens.length === 0) {
    return items.map((item) => ({ item, directScore: 0, totalScore: 0 }));
  }

  return items
    .map((item, index) => ({ item, index, ...scoreParts(item, query) }))
    .filter((entry) => entry.totalScore > 0)
    .sort(
      (a, b) =>
        Number(b.directScore > 0) - Number(a.directScore > 0) ||
        b.totalScore - a.totalScore ||
        a.index - b.index,
    )
    .map(({ item, directScore, totalScore }) => ({ item, directScore, totalScore }));
}
