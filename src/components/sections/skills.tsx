"use client";

import { Fragment } from "react";
import { skills } from "@/content";
import { skillMatches, useSearch } from "@/components/search/search-provider";
import { highlight } from "@/lib/highlight";
import { DOMAIN_TEXT } from "@/lib/domain";
import { cn } from "@/lib/cn";

export function Skills() {
  const { parsedQuery, isSearching: searching } = useSearch();

  return (
    <div id="skills" className="scroll-mt-14">
      {/* "skills" is indexed on every skill (SKILL_TERMS), so the heading can carry the mark. */}
      <h3 className="text-step-1 font-medium">{highlight("Skills", parsedQuery, "heading")}</h3>

      <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-[12rem_1fr]">
        {skills.map((group) => {
          // Skills are context for everything else on the page, so a skill that does
          // not match is dimmed rather than removed. Judged per skill, by the test the
          // hero counts with, so the list agrees with the count and the field above it.
          const lit = group.skills.map((skill) => !searching || skillMatches(skill, parsedQuery));
          // The heading stays lit while any of its skills is, so a partly matched group
          // does not read as absent.
          const headingLit = lit.some(Boolean);

          return (
            <Fragment key={group.id}>
              <dt
                className={cn(
                  "text-step-0 font-medium",
                  headingLit ? DOMAIN_TEXT[group.domain] : "text-ink-3",
                )}
              >
                {group.category}
              </dt>
              {/* Every skill leads with its hairline, and the row is pulled left by
                  exactly one hairline plus its padding into a clipped edge. Whichever
                  skill starts a line, first or wrapped, loses its hairline to the clip,
                  so no line ever opens with one. */}
              <dd className="text-ink-2 overflow-x-clip">
                <div className="-ml-[calc(0.75rem_+_1px)] flex flex-wrap items-center">
                  {group.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className={cn(
                        "text-step-0 border-rule border-l px-3",
                        !lit[index] && "text-ink-3",
                      )}
                    >
                      {highlight(skill, parsedQuery)}
                    </span>
                  ))}
                </div>
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </div>
  );
}
