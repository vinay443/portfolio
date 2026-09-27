"use client";

import { certifications, degree, type EducationItem } from "@/content";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { RowBar, type RowRank } from "@/components/ui/row-bar";
import { Skills } from "./skills";
import { scoreItem, type ParsedQuery } from "@/lib/search";
import { highlight } from "@/lib/highlight";
import { DOMAIN_CHIP } from "@/lib/domain";
import { cn } from "@/lib/cn";

/**
 * Education is one entry, dimmed or not, so there is nothing to rank it against:
 * its bar renders at the same resting state a Work row shows with no query, and
 * lights to full on hover exactly as those do.
 */
const RESTING_RANK: RowRank = {
  searching: false,
  score: 0,
  relevance: 0,
  isTop: false,
};

/** Joins the parts of a subline, skipping the ones that are not known yet. */
function joinParts(parts: (string | undefined)[], separator: string): string {
  return parts
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(separator);
}

/**
 * The honors, in the same hairline-led tag language as the stack and skill lists —
 * short labels rather than sentences, so "Cum Laude" is scanned, not read. Single
 * hue, taken from the entry's domain, because these are all the same kind of thing:
 * `stackDomain()` is for technologies and has nothing to say about an award.
 */
function HonorList({
  item,
  query,
  dimmed,
}: {
  item: EducationItem;
  query: ParsedQuery;
  dimmed: boolean;
}) {
  if (!item.honors || item.honors.length === 0) return null;

  // Clipped left edge and a matching negative margin, the trick the skill rows use:
  // the row is pulled left by exactly one hairline plus its padding, so whichever
  // label starts a line — the first or a wrapped one — loses its hairline to the
  // clip and no line ever opens with a stray mark.
  return (
    <div className="mt-5 overflow-x-clip">
      <ul className="-ml-[calc(0.5rem_+_1px)] flex flex-wrap items-center gap-y-1">
        {item.honors.map((honor) => (
          <li
            key={honor}
            className={cn(
              "text-step-neg1 border-l pr-3 pl-2",
              dimmed || !item.domain ? "border-rule text-ink-3" : DOMAIN_CHIP[item.domain],
            )}
          >
            {highlight(honor, query)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The institution leads. It is the credential a reader scans for, and the degree it
 * awarded is the qualifier on it — the reverse of how this read before. The accent
 * rule and the date gutter are the Work row's, so a four-year double major sits in
 * the same timeline language as a job rather than in the certification template.
 */
function Degree({ query, dimmed }: { query: ParsedQuery; dimmed: boolean }) {
  const place = joinParts([degree.campus, degree.location], ", ");
  const subline = joinParts([degree.qualifier, degree.school], " · ");
  // GPA stays visible but sits below the honors row and in the quietest ink: it is
  // the least distinguishing number here.
  const footnote = joinParts(
    [degree.gpa ? `GPA ${degree.gpa}` : undefined, degree.honorsNote],
    " · ",
  );

  return (
    <article
      className={cn(
        "group relative -mx-4 mt-6 grid gap-2 px-4 md:grid-cols-[9rem_1fr] md:gap-10",
        dimmed && "text-ink-3",
      )}
    >
      {degree.domain ? <RowBar domain={degree.domain} rank={RESTING_RANK} /> : null}

      <p className="text-step-neg1 text-ink-3 font-mono md:pt-2">
        {highlight(degree.period, query)}
      </p>

      <div>
        <h4 className="text-step-2 font-medium">
          {highlight(degree.institution, query, "heading")}
        </h4>
        {place.length > 0 ? (
          <p className="text-step-neg1 text-ink-3 mt-1">{highlight(place, query)}</p>
        ) : null}

        <p className="text-step-0 text-ink-2 mt-4">{highlight(degree.title, query)}</p>
        {subline.length > 0 ? (
          <p className="text-step-neg1 text-ink-3 mt-1">{highlight(subline, query)}</p>
        ) : null}

        <HonorList item={degree} query={query} dimmed={dimmed} />

        {footnote.length > 0 ? (
          <p className="text-step-neg1 text-ink-3 mt-3">{highlight(footnote, query)}</p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Two lines each, no date gutter, no rule. A short course and a four-year degree
 * used to share one template, which let a Udemy certificate borrow the degree's
 * weight; compressing these is what makes the contrast do the arguing.
 *
 * The date runs inline rather than in its own right-hand column: at 375px a
 * right-aligned date wraps onto a line of its own, which turned a two-line entry
 * into a four-line one — the opposite of the point.
 */
function Certifications({ query, searching }: { query: ParsedQuery; searching: boolean }) {
  return (
    <ul className="max-w-measure mt-6 flex flex-col gap-4">
      {certifications.map((certification) => {
        const dimmed = searching && scoreItem(certification, query) === 0;

        return (
          <li key={certification.id} className={cn(dimmed && "text-ink-3")}>
            <p className="text-step-0">{highlight(certification.title, query)}</p>
            <p className="text-step-neg1 text-ink-3">
              <span className="font-mono">{highlight(certification.period, query)}</span>
              {" · "}
              {highlight(certification.institution, query)}
              {certification.description ? (
                <>
                  {" · "}
                  {highlight(certification.description, query)}
                </>
              ) : null}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function Background() {
  const { parsedQuery, isSearching: searching } = useSearch();

  // Credentials follow the same rule as skills: dimmed when they do not match,
  // never removed.
  const degreeDimmed = searching && scoreItem(degree, parsedQuery) === 0;

  return (
    <Section id="background" title="Background">
      {/* The headings are highlighted because their words are indexed on the entries
          below them, so "education" has a visible mark to show for its match. */}
      <div>
        <h3 className="text-step-1 font-medium">
          {highlight("Education", parsedQuery, "heading")}
        </h3>
        <Degree query={parsedQuery} dimmed={degreeDimmed} />
      </div>

      <div>
        <h3 className="text-step-1 font-medium">
          {highlight("Certifications", parsedQuery, "heading")}
        </h3>
        <Certifications query={parsedQuery} searching={searching} />
      </div>

      <Skills />
    </Section>
  );
}
