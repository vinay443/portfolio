"use client";

import { certifications, degree } from "@/content";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { RuleList, RuleListItem } from "@/components/ui/rule-list";
import { Skills } from "./skills";
import { scoreItem } from "@/lib/search";
import { highlight } from "@/lib/highlight";
import { cn } from "@/lib/cn";

export function Background() {
  const { parsedQuery, isSearching: searching } = useSearch();

  // Credentials follow the same rule as skills: dimmed when they do not match,
  // never removed.
  const degreeDimmed = searching && scoreItem(degree, parsedQuery) === 0;

  return (
    <Section id="background" title="Background">
      <div>
        <h3 className="text-step-1 font-medium">Education</h3>

        <div
          className={cn(
            "mt-6 grid gap-2 md:grid-cols-[9rem_1fr] md:gap-10",
            degreeDimmed && "text-ink-3",
          )}
        >
          <p className="text-step-neg1 text-ink-3 font-mono md:pt-1">
            {highlight(degree.period, parsedQuery)}
          </p>

          <div>
            <p className="text-step-0 font-medium">{highlight(degree.title, parsedQuery)}</p>
            <p className="text-step-0 text-ink-2 mt-1">
              {highlight(
                degree.location ? `${degree.institution}, ${degree.location}` : degree.institution,
                parsedQuery,
              )}
            </p>
            {degree.gpa ? (
              <p className="text-step-neg1 text-ink-3 mt-1">
                {highlight(`GPA ${degree.gpa}`, parsedQuery)}
              </p>
            ) : null}

            {degree.honors ? (
              <RuleList className="mt-4">
                {degree.honors.map((honor) => (
                  <RuleListItem key={honor}>{highlight(honor, parsedQuery)}</RuleListItem>
                ))}
              </RuleList>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-step-1 font-medium">Certifications</h3>

        <ul className="mt-6 flex flex-col gap-4">
          {certifications.map((certification) => {
            const dimmed = searching && scoreItem(certification, parsedQuery) === 0;

            return (
              <li key={certification.id} className={cn(dimmed && "text-ink-3")}>
                <p className="text-step-0">{highlight(certification.title, parsedQuery)}</p>
                <p className="text-step-neg1 text-ink-3">
                  {highlight(certification.institution, parsedQuery)}
                </p>
                {certification.description ? (
                  <p className="text-step-neg1 text-ink-3 mt-1 max-w-measure">
                    {highlight(certification.description, parsedQuery)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <Skills />
    </Section>
  );
}
