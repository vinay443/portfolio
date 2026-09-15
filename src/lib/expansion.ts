/**
 * Curated query expansion. Any member of a group expands to every other member,
 * so the relation is symmetric by construction: "rag" reaches "retrieval", and
 * "retrieval" reaches "rag".
 *
 * This is term expansion, not semantic similarity. Every link below was written by
 * hand from the site's own content, and a term reaches nothing it is not listed with.
 *
 * Entries are lowercase and written the way `tokenize()` splits text: a space
 * separates words and `.` stays inside one ("next.js"). A hyphen is split at match
 * time on both sides, so "real-time" is the phrase "real time". Multi-word entries
 * only ever match as whole phrases.
 */
const GROUPS: readonly (readonly string[])[] = [
  [
    "retrieval",
    "rag",
    "retrieval-augmented",
    "semantic search",
    "vector search",
    "embeddings",
    "nomic",
    "ollama",
  ],
  ["llm", "large language model", "language model"],
  // One group, not two: offensive testing is one discipline whether it is aimed at
  // a model or a network, and split apart "red team" never reached the
  // penetration-testing role.
  [
    "red team",
    "redteam",
    "red-teaming",
    "adversarial",
    "prompt injection",
    "jailbreak",
    "attack",
    "security",
    // Whole-word matching keeps "security" out of "cybersecurity", so both spellings
    // the content uses are listed: the Insys title and Saksoft's "RBI Cyber Security".
    "cybersecurity",
    "cyber security",
    "penetration testing",
    "pentest",
    "vulnerability",
    "nmap",
    "wireshark",
    "burp",
    "metasploit",
    "kali",
  ],
  [
    "machine learning",
    "ml",
    "random forest",
    "lstm",
    "gan",
    "xgboost",
    "scikit-learn",
    "tensorflow",
  ],
  ["devops", "docker", "kubernetes", "ci", "github actions", "jenkins"],
  ["streaming", "kafka", "redpanda", "real-time", "realtime"],
  ["compliance", "grc", "audit", "pci dss", "soc 2", "iso 27001", "rbi"],
  ["frontend", "react", "next.js", "typescript", "tailwind"],
  ["backend", "api", "fastapi", "python"],
  ["database", "sql", "mysql", "postgresql", "mongodb", "aurora", "yugabyte"],
];

/** A group entry as a sequence of folded words. */
export type Phrase = readonly string[];

/** One group the query reached, minus the members the visitor typed. */
export type Expansion = readonly Phrase[];

/**
 * Folds the common inflections, so "llms", "attacks", "red teaming" and
 * "vulnerabilities" reach "llm", "attack", "red team" and "vulnerability".
 *
 * Deliberately crude. It is applied identically to group entries and to the text
 * they are compared against, so it only has to be consistent, not correct. Only
 * plain alphabetic words are folded; "next.js" and "27001" pass through untouched.
 */
export function foldWord(word: string): string {
  if (!/^[a-z]+$/.test(word)) return word;

  let folded = word;
  if (folded.length > 4 && folded.endsWith("ies")) {
    folded = `${folded.slice(0, -3)}y`;
  } else if (folded.length > 3 && folded.endsWith("s") && !folded.endsWith("ss")) {
    folded = folded.slice(0, -1);
  }
  if (folded.length > 5 && folded.endsWith("ing")) {
    folded = folded.slice(0, -3);
  }
  return folded;
}

/**
 * Splits hyphenated words into their parts, the way a regex word boundary treats a
 * hyphen: "red-teaming" contains "red" as a whole word, "redpanda" does not.
 */
export function splitHyphens(words: readonly string[]): string[] {
  return words.flatMap((word) => word.split("-")).filter((part) => part.length > 0);
}

/** The form every comparison uses, on both sides: hyphens split, then folded. */
export function toMatchWords(words: readonly string[]): string[] {
  return splitHyphens(words).map(foldWord);
}

const FOLDED_GROUPS: readonly Expansion[] = GROUPS.map((group) =>
  group.map((entry) => toMatchWords(entry.split(" "))),
);

/**
 * Every index at which `phrase` begins in `words` as consecutive whole words. Both
 * sides must already be in match form (`toMatchWords`). Whole words matter: as a
 * substring, "red" matches "reducing", "gan" matches "organisation", "rag" matches
 * "storage".
 */
export function phraseStarts(words: readonly string[], phrase: Phrase): number[] {
  const starts: number[] = [];
  if (phrase.length === 0) return starts;
  for (let start = 0; start + phrase.length <= words.length; start += 1) {
    if (phrase.every((word, offset) => words[start + offset] === word)) starts.push(start);
  }
  return starts;
}

/** True when `phrase` appears in `words` at least once, by the rule of `phraseStarts`. */
export function containsPhrase(words: readonly string[], phrase: Phrase): boolean {
  return phraseStarts(words, phrase).length > 0;
}

/**
 * Every group the query tokens reach, each without the members already in the
 * query. Those are scored as direct matches; counting them again as expansions
 * would inflate a literal hit.
 */
export function expand(tokens: readonly string[]): Expansion[] {
  const words = toMatchWords(tokens);
  const expansions: Expansion[] = [];

  for (const group of FOLDED_GROUPS) {
    const typed = group.filter((phrase) => containsPhrase(words, phrase));
    if (typed.length === 0) continue;

    const rest = group.filter((phrase) => !typed.includes(phrase));
    if (rest.length > 0) expansions.push(rest);
  }

  return expansions;
}
