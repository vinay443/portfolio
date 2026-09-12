"use client";

import { education, experience, projects, skills } from "@/content";
import { scoreItem } from "@/lib/search";
import { hybridRank } from "@/lib/hybrid";
import { useSearch } from "./search-provider";

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function summarise(
  appliedQuery: string,
  tokens: string[],
  queryVector: number[] | null,
): string {
  const roles = hybridRank(experience, appliedQuery, queryVector).length;
  const matchedProjects = hybridRank(
    projects.filter((project) => !project.sensitive),
    appliedQuery,
    queryVector,
  ).length;
  const matchedSkills = skills.reduce(
    (total, group) =>
      total +
      group.skills.filter((skill) => {
        const lowered = skill.toLowerCase();
        return tokens.some((token) => lowered.includes(token));
      }).length,
    0,
  );
  const credentials = education.filter((item) => scoreItem(item, tokens) > 0).length;

  const parts = [
    roles > 0 ? plural(roles, "role", "roles") : null,
    matchedProjects > 0 ? plural(matchedProjects, "project", "projects") : null,
    matchedSkills > 0 ? plural(matchedSkills, "skill", "skills") : null,
    credentials > 0 ? plural(credentials, "credential", "credentials") : null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(", ") : "Nothing on the page matches that.";
}

export function ResultSummary() {
  const { appliedQuery, tokens, isSearching, queryVector } = useSearch();

  // The live region itself is always present, even when empty. A region that only
  // appears alongside its text is inconsistently announced.
  return (
    <div aria-live="polite" className="px-6 md:px-12 lg:px-20">
      {isSearching ? (
        <p className="text-step-neg1 text-ink-2 pb-10">{summarise(appliedQuery, tokens, queryVector)}</p>
      ) : null}
    </div>
  );
}
