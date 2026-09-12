"use client";

import { Fragment } from "react";
import { skills } from "@/content";
import { useSearch } from "@/components/search/search-provider";
import { scoreItem } from "@/lib/search";
import { highlight } from "@/lib/highlight";
import { cn } from "@/lib/cn";

export function Skills() {
  const { tokens } = useSearch();
  const searching = tokens.length > 0;

  return (
    <div id="skills" className="scroll-mt-14">
      <h3 className="text-step-1 font-medium">Skills</h3>

      <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-[12rem_1fr]">
        {skills.map((group) => {
          // Skills are context for everything else on the page, so a group that
          // does not match is dimmed rather than removed.
          const dimmed = searching && scoreItem(group, tokens) === 0;

          return (
            <Fragment key={group.id}>
              <dt className={cn("text-step-0 font-medium", dimmed && "text-ink-3")}>
                {group.category}
              </dt>
              <dd className={cn("flex flex-wrap items-center", dimmed && "text-ink-3")}>
                {group.skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={cn(
                      "text-step-0",
                      index === 0 ? "pr-3" : "border-rule border-l px-3",
                    )}
                  >
                    {highlight(skill, tokens)}
                  </span>
                ))}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </div>
  );
}
