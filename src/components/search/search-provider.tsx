"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { education, experience, projects, skills } from "@/content";
import { EMPTY_QUERY, parseQuery, rank, scoreItem, type ParsedQuery } from "@/lib/search";

const DEBOUNCE_MS = 120;

export interface MatchCounts {
  roles: number;
  projects: number;
  /** Individual skills, not skill groups: the unit the Skills section lists and highlights. */
  skills: number;
  credentials: number;
  total: number;
}

const NO_MATCHES: MatchCounts = { roles: 0, projects: 0, skills: 0, credentials: 0, total: 0 };

const PUBLIC_PROJECTS = projects.filter((project) => !project.sensitive);

/**
 * Whether one skill matches, typed or expanded. The hero's skill count and the
 * Skills section's dimming both call this, so a lit skill is always a counted one.
 */
export function skillMatches(skill: string, query: ParsedQuery): boolean {
  return scoreItem({ searchText: skill.toLowerCase(), tags: [skill] }, query) > 0;
}

/**
 * The one definition of a match, behind both the hero's count and the result
 * summary, so the two cannot disagree. Each unit is scored by the ranker with typed
 * and expanded terms and counts when it scores above zero, the same test that
 * decides whether a row is shown.
 */
function countMatches(query: ParsedQuery): MatchCounts {
  const roles = rank(experience, query).length;
  const matchedProjects = rank(PUBLIC_PROJECTS, query).length;
  const matchedSkills = skills.reduce(
    (total, group) => total + group.skills.filter((skill) => skillMatches(skill, query)).length,
    0,
  );
  const credentials = education.filter((item) => scoreItem(item, query) > 0).length;

  return {
    roles,
    projects: matchedProjects,
    skills: matchedSkills,
    credentials,
    total: roles + matchedProjects + matchedSkills + credentials,
  };
}

export interface SearchContextValue {
  /** Instant, reflects the input. */
  query: string;
  setQuery: (next: string) => void;
  /** The debounced query. Everything that ranks content reads this, not `query`. */
  appliedQuery: string;
  /**
   * Derived from the debounced query, so it stays in step with `matchCounts`. Ranks,
   * dims and highlights; `highlight()` reads only its typed tokens, never synonyms.
   */
  parsedQuery: ParsedQuery;
  isSearching: boolean;
  /** Per-kind breakdown, read by the result summary. */
  matchCounts: MatchCounts;
  /** `matchCounts.total`, read by the hero. */
  resultCount: number;
  clear: () => void;
}

const FALLBACK: SearchContextValue = {
  query: "",
  setQuery: () => {},
  appliedQuery: "",
  parsedQuery: EMPTY_QUERY,
  isSearching: false,
  matchCounts: NO_MATCHES,
  resultCount: 0,
  clear: () => {},
};

const SearchContext = createContext<SearchContextValue | null>(null);

/** Falls back to an inert value so server-rendered consumers never need the provider. */
export function useSearch(): SearchContextValue {
  return useContext(SearchContext) ?? FALLBACK;
}

/**
 * Reads and writes `?q=`. Isolated in its own Suspense boundary because
 * `useSearchParams` forces everything up to the nearest boundary to render on the
 * client — which would strip the server-rendered content out of the initial HTML.
 * This renders nothing, so only it pays that cost.
 */
function SearchParamsBridge({
  query,
  onAdopt,
}: {
  query: string;
  onAdopt: (value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adopted = useRef(false);
  const skippedFirstWrite = useRef(false);

  useEffect(() => {
    if (adopted.current) return;
    adopted.current = true;
    const initial = searchParams.get("q") ?? "";
    if (initial.length > 0) onAdopt(initial);
  }, [searchParams, onAdopt]);

  useEffect(() => {
    // The first pass runs before an adopted `?q=` has reached state; writing then
    // would immediately erase the query the visitor arrived with.
    if (!skippedFirstWrite.current) {
      skippedFirstWrite.current = true;
      return;
    }

    // The provider lives in the root layout and outlives navigation, so without
    // this a search would follow the visitor onto every project page's URL.
    if (pathname !== "/") return;

    const current = searchParams.get("q") ?? "";
    if (current === query) return;

    const params = new URLSearchParams(searchParams.toString());
    if (query.length > 0) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [query, pathname, router, searchParams]);

  return null;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const parsedQuery = useMemo(() => parseQuery(appliedQuery), [appliedQuery]);

  // A query of nothing but stopwords carries no signal, so it is treated as no
  // search at all rather than as a search that matches everything.
  const isSearching = parsedQuery.tokens.length > 0;

  const matchCounts = useMemo(
    () => (isSearching ? countMatches(parsedQuery) : NO_MATCHES),
    [isSearching, parsedQuery],
  );
  const resultCount = matchCounts.total;

  const clear = useCallback(() => setQuery(""), []);

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      appliedQuery,
      parsedQuery,
      isSearching,
      matchCounts,
      resultCount,
      clear,
    }),
    [query, appliedQuery, parsedQuery, isSearching, matchCounts, resultCount, clear],
  );

  return (
    <SearchContext.Provider value={value}>
      <Suspense fallback={null}>
        <SearchParamsBridge query={appliedQuery} onAdopt={setQuery} />
      </Suspense>
      {children}
    </SearchContext.Provider>
  );
}
