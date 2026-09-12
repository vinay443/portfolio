"use client";

import { useMemo } from "react";
import Link from "next/link";
import { projects, type ProjectItem } from "@/content";
import { RankedList } from "@/components/search/ranked-list";
import { Section } from "@/components/ui/section";
import { StackList } from "@/components/ui/stack-list";
import { isPlaceholder } from "@/lib/format";

function ProjectRow({ project }: { project: ProjectItem }) {
  const period = isPlaceholder(project.period) ? null : project.period;
  const meta = [period, project.status]
    .filter((value): value is string => value !== null)
    .join(" · ");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group border-rule hover:bg-surface focus-visible:bg-surface -mx-4 block border-b px-4 py-8 transition-colors duration-[120ms]"
    >
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-step-2 group-hover:text-accent group-focus-visible:text-accent font-medium transition-colors duration-[120ms]">
          {project.title}
        </h3>
        <p className="text-step-neg1 text-ink-3 shrink-0 font-mono">{meta}</p>
      </div>

      <p className="text-step-0 text-ink-2 mt-2 max-w-[72ch]">{project.oneLiner}</p>

      <div className="mt-3">
        <StackList stack={project.stack} />
      </div>
    </Link>
  );
}

export function Projects() {
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
        renderItem={(project) => <ProjectRow project={project} />}
      />
    </Section>
  );
}
