import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, type ProjectItem } from "@/content";
import { ExternalLink } from "@/components/ui/external-link";
import { StackList } from "@/components/ui/stack-list";
import { RuleList, RuleListItem } from "@/components/ui/rule-list";
import { projectStatusClass } from "@/lib/domain";

// Highlights describing adversarial or security behaviour get an adversary-hued
// leading rule instead of the neutral one.
const ADVERSARIAL =
  /\b(attack|adversar|inject|hijack|sandbox|guard|red[- ]?team|vulnerab|cryptanal|resistance|traversal|security)/i;

const LINK_CLASSES = "text-retrieval underline underline-offset-4 break-all";

/** The URL as it reads on the page, which is also its accessible name. */
function bareUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function publishedProject(slug: string): ProjectItem | undefined {
  return projects.find((project) => project.slug === slug && !project.sensitive);
}

export function generateStaticParams() {
  return projects
    .filter((project) => !project.sensitive)
    .map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = publishedProject(slug);
  // Thrown here as well as in the page: Next then resolves this route's metadata
  // from not-found.tsx, which is what titles it "Project not found". Returning an
  // empty object instead left the default site title on the 404.
  if (!project) notFound();

  return {
    title: project.title,
    description: project.oneLiner,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.oneLiner,
      url: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = publishedProject(slug);
  if (!project) notFound();

  const facts: { label: string; value: ReactNode }[] = [];
  if (project.period) facts.push({ label: "Period", value: project.period });
  facts.push({ label: "Role", value: project.role });
  facts.push({
    label: "Status",
    value: <span className={projectStatusClass(project)}>{project.status}</span>,
  });
  if (project.repoUrl) {
    const shown = bareUrl(project.repoUrl);
    facts.push({
      label: "Repository",
      value: (
        <ExternalLink href={project.repoUrl} label={shown} className={LINK_CLASSES}>
          {shown}
        </ExternalLink>
      ),
    });
  }
  if (project.liveUrl) {
    const shown = bareUrl(project.liveUrl);
    facts.push({
      label: "Live",
      value: (
        <ExternalLink href={project.liveUrl} label={shown} className={LINK_CLASSES}>
          {shown}
        </ExternalLink>
      ),
    });
  }

  return (
    <main id="content" tabIndex={-1} className="flex-1 px-6 outline-none md:px-12 lg:px-20">
      <article className="max-w-column mx-auto pt-16 pb-20">
        <Link href="/#projects" className="text-step-neg1 text-ink-2 hover:text-accent">
          Back to projects
        </Link>

        <h1 className="text-step-5 mt-10 leading-[1.08] font-semibold tracking-[-0.028em] wrap-break-word">
          {project.title}
        </h1>

        <p className="text-step-2 text-ink-2 mt-5 max-w-[52ch]">{project.oneLiner}</p>

        <dl className="text-step-neg1 border-rule mt-10 grid gap-x-8 gap-y-2 border-t pt-6 font-mono sm:grid-cols-[8rem_1fr]">
          {facts.map((fact) => (
            <Fragment key={fact.label}>
              <dt className="text-ink-3">{fact.label}</dt>
              <dd className="text-ink-2">{fact.value}</dd>
            </Fragment>
          ))}
        </dl>

        <div className="max-w-measure mt-12 flex flex-col gap-5">
          {project.longDescription.map((paragraph) => (
            <p key={paragraph} className="text-step-0 leading-[1.6]">
              {paragraph}
            </p>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-step-1 font-medium">Highlights</h2>
          <RuleList className="mt-5">
            {project.highlights.map((entry) => (
              <RuleListItem key={entry} tone={ADVERSARIAL.test(entry) ? "adversary" : "rule"}>
                {entry}
              </RuleListItem>
            ))}
          </RuleList>
        </section>

        <section className="mt-12">
          <h2 className="text-step-1 font-medium">Stack</h2>
          <div className="mt-4">
            <StackList stack={project.stack} />
          </div>
        </section>

        {project.metrics ? (
          <section className="mt-12">
            <h2 className="text-step-1 font-medium">Measured</h2>
            <dl className="mt-4 flex flex-wrap gap-x-12 gap-y-4">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt className="text-step-neg1 text-ink-3">{metric.label}</dt>
                  <dd className="text-step-1 text-verified font-medium">{metric.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </main>
  );
}
