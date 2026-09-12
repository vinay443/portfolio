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
  const { tokens } = useSearch();
  const searching = tokens.length > 0;

  // Credentials follow the same rule as skills: dimmed when they do not match,
  // never removed.
  const degreeDimmed = searching && scoreItem(degree, tokens) === 0;

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
          <p className="text-step-neg1 text-ink-3 font-mono md:pt-1">{degree.period}</p>

          <div>
            <p className="text-step-0 font-medium">{highlight(degree.title, tokens)}</p>
            <p className="text-step-0 text-ink-2 mt-1">
              {degree.location ? `${degree.institution}, ${degree.location}` : degree.institution}
            </p>
            {degree.gpa ? <p className="text-step-neg1 text-ink-3 mt-1">GPA {degree.gpa}</p> : null}

            {degree.honors ? (
              <RuleList className="mt-4">
                {degree.honors.map((honor) => (
                  <RuleListItem key={honor}>{highlight(honor, tokens)}</RuleListItem>
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
            const dimmed = searching && scoreItem(certification, tokens) === 0;

            return (
              <li key={certification.id} className={cn(dimmed && "text-ink-3")}>
                <p className="text-step-0">{highlight(certification.title, tokens)}</p>
                <p className="text-step-neg1 text-ink-3">{certification.institution}</p>
                {certification.description ? (
                  <p className="text-step-neg1 text-ink-3 mt-1 max-w-measure">
                    {highlight(certification.description, tokens)}
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
