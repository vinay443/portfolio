"use client";

import { useMemo } from "react";
import Link from "next/link";
import { projects, type ProjectItem } from "@/content";
import { RankedList } from "@/components/search/ranked-list";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { StackList } from "@/components/ui/stack-list";
import { RowBar, ScoreReadout, type RowRank } from "@/components/ui/row-bar";
import { projectStatusClass } from "@/lib/domain";
import { highlight } from "@/lib/highlight";
import type { ParsedQuery } from "@/lib/search";
import { cn } from "@/lib/cn";

function ProjectRow({
  project,
  query,
  rank,
}: {
  project: ProjectItem;
  query: ParsedQuery;
  rank: RowRank;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group border-rule hover:bg-surface focus-visible:bg-surface relative -mx-4 block border-b px-4 py-8 transition-colors duration-[120ms]"
    >
      <RowBar domain={project.domain} rank={rank} />

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-step-2 group-hover:text-accent group-focus-visible:text-accent font-medium transition-colors duration-[120ms]">
          {highlight(project.title, query, "heading")}
        </h3>
        <div className="flex shrink-0 items-baseline gap-4">
          {/* Status only. Period is optional in the data, so showing it here made one
              row look broken; the detail page shows it instead. */}
          <p className={cn("text-step-neg1 font-mono", projectStatusClass(project))}>
            {project.status}
          </p>
          <ScoreReadout rank={rank} />
        </div>
      </div>

      <p className="text-step-0 text-ink-2 mt-2 max-w-[72ch]">
        {highlight(project.oneLiner, query)}
      </p>

      <div className="mt-3">
        <StackList stack={project.stack} query={query} />
      </div>
    </Link>
  );
}

export function Projects() {
  const { parsedQuery } = useSearch();

  // Featured first sets the default order; ranking keeps it for an empty query and
  // uses it to break score ties.
  const items = useMemo(
    () =>
      projects
        .filter((project) => !project.sensitive)
        .sort((a, b) => Number(b.featured) - Number(a.featured)),
    [],
  );

  return (
    <Section id="projects" title="Projects">
      <RankedList
        items={items}
        label="projects"
        renderItem={(project, rank) => (
          <ProjectRow project={project} query={parsedQuery} rank={rank} />
        )}
      />
    </Section>
  );
}
