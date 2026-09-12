"use client";

import { useSearch } from "@/components/search/search-provider";

export function EmptyState({ message }: { message: string }) {
  const { clear } = useSearch();

  return (
    <p className="text-step-neg1 text-ink-3">
      {message}{" "}
      <button
        type="button"
        onClick={clear}
        className="text-accent rounded-control underline underline-offset-4"
      >
        Clear the search
      </button>
    </p>
  );
}
