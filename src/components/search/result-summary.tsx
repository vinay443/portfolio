"use client";

import { useSearch, type MatchCounts } from "./search-provider";

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** A breakdown of the same counts the hero totals, so the two always add up. */
function summarise(counts: MatchCounts): string {
  const parts = [
    counts.roles > 0 ? plural(counts.roles, "role", "roles") : null,
    counts.projects > 0 ? plural(counts.projects, "project", "projects") : null,
    counts.skills > 0 ? plural(counts.skills, "skill", "skills") : null,
    counts.credentials > 0 ? plural(counts.credentials, "credential", "credentials") : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(", ") : "Nothing on the page matches that.";
}

export function ResultSummary() {
  const { matchCounts, isSearching } = useSearch();

  // The live region itself is always present, even when empty. A region that only
  // appears alongside its text is inconsistently announced.
  return (
    <div aria-live="polite" className="px-6 md:px-12 lg:px-20">
      {isSearching ? (
        <p className="text-step-neg1 text-ink-2 pb-10">{summarise(matchCounts)}</p>
      ) : null}
    </div>
  );
}
