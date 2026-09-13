"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { projects, type ProjectItem } from "@/content";
import { RankedList } from "@/components/search/ranked-list";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { StackList } from "@/components/ui/stack-list";
import { RowBar, ScoreReadout, type RowRank } from "@/components/ui/row-bar";
import { projectStatusClass } from "@/lib/domain";

function ProjectMeta({ project }: { project: ProjectItem }) {
  const fields: { key: string; content: ReactNode }[] = [];
  if (project.period) fields.push({ key: "period", content: project.period });
  fields.push({
    key: "status",
    content: <span className={projectStatusClass(project)}>{project.status}</span>,
  });

  return (
    <p className="text-step-neg1 text-ink-3 font-mono">
      {fields.map((field, index) => (
        <Fragment key={field.key}>
          {index > 0 ? " · " : null}
          {field.content}
        </Fragment>
      ))}
    </p>
  );
}

function ProjectRow({
  project,
  tokens,
  rank,
}: {
  project: ProjectItem;
  tokens: string[];
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
          {project.title}
        </h3>
        <div className="flex shrink-0 items-baseline gap-4">
          <ProjectMeta project={project} />
          <ScoreReadout rank={rank} />
        </div>
      </div>

      <p className="text-step-0 text-ink-2 mt-2 max-w-[72ch]">{project.oneLiner}</p>

      <div className="mt-3">
        <StackList stack={project.stack} tokens={tokens} />
      </div>
    </Link>
  );
}

export function Projects() {
  const { tokens } = useSearch();

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
          <ProjectRow project={project} tokens={tokens} rank={rank} />
        )}
      />
    </Section>
  );
}
