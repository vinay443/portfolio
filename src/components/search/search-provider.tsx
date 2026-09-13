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
import { allContent } from "@/content";
import { tokenize } from "@/lib/search";
import { hybridRank } from "@/lib/hybrid";
import { embedQuery, loadSemantic, type SemanticStatus } from "@/lib/semantic";

const DEBOUNCE_MS = 120;

export interface SearchContextValue {
  /** Instant, reflects the input. */
  query: string;
  setQuery: (next: string) => void;
  /** The debounced query. Everything that ranks content reads this, not `query`. */
  appliedQuery: string;
  /** Derived from the debounced query, so it stays in step with `resultCount`. */
  tokens: string[];
  isSearching: boolean;
  resultCount: number;
  clear: () => void;
  semanticStatus: SemanticStatus;
  /** Starts the one-time model download. Safe to call repeatedly. */
  activateSemantic: () => void;
  /** Null until the model is ready and the current query has been embedded. */
  queryVector: number[] | null;
}

const FALLBACK: SearchContextValue = {
  query: "",
  setQuery: () => {},
  appliedQuery: "",
  tokens: [],
  isSearching: false,
  resultCount: 0,
  clear: () => {},
  semanticStatus: "idle",
  activateSemantic: () => {},
  queryVector: null,
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
  const [semanticStatus, setSemanticStatus] = useState<SemanticStatus>("idle");
  const [embedded, setEmbedded] = useState<{ query: string; vector: number[] } | null>(null);
  const semanticRequested = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const activateSemantic = useCallback(() => {
    if (semanticRequested.current) return;
    semanticRequested.current = true;
    setSemanticStatus("loading");

    loadSemantic()
      .then((ready) => setSemanticStatus(ready ? "ready" : "failed"))
      .catch(() => setSemanticStatus("failed"));
  }, []);

  const tokens = useMemo(() => tokenize(appliedQuery), [appliedQuery]);

  // A query of nothing but stopwords carries no signal, so it is treated as no
  // search at all rather than as a search that matches everything.
  const isSearching = tokens.length > 0;

  useEffect(() => {
    if (semanticStatus !== "ready" || !isSearching) return;

    let cancelled = false;
    embedQuery(appliedQuery).then((vector) => {
      if (!cancelled && vector) setEmbedded({ query: appliedQuery, vector });
    });

    return () => {
      cancelled = true;
    };
  }, [appliedQuery, isSearching, semanticStatus]);

  // Derived rather than cleared from the effect above: a vector only counts while
  // it still belongs to the query on screen, so a stale one can never rank results.
  const queryVector =
    semanticStatus === "ready" && isSearching && embedded?.query === appliedQuery
      ? embedded.vector
      : null;

  const resultCount = useMemo(
    () => (isSearching ? hybridRank(allContent, appliedQuery, queryVector).length : 0),
    [isSearching, appliedQuery, queryVector],
  );

  const clear = useCallback(() => setQuery(""), []);

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      appliedQuery,
      tokens,
      isSearching,
      resultCount,
      clear,
      semanticStatus,
      activateSemantic,
      queryVector,
    }),
    [
      query,
      appliedQuery,
      tokens,
      isSearching,
      resultCount,
      clear,
      semanticStatus,
      activateSemantic,
      queryVector,
    ],
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
