"use client";

import { education, experience, projects, skills } from "@/content";
import { rank, scoreItem } from "@/lib/search";
import { useSearch } from "./search-provider";

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function ResultSummary() {
  const { appliedQuery, tokens, isSearching } = useSearch();

  if (!isSearching) return null;

  const roles = rank(experience, appliedQuery).length;
  const matchedProjects = rank(
    projects.filter((project) => !project.sensitive),
    appliedQuery,
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

  return (
    <p className="text-step-neg1 text-ink-2 px-6 pb-10 md:px-12 lg:px-20">
      {parts.length > 0 ? parts.join(", ") : "Nothing on the page matches that."}
    </p>
  );
}
