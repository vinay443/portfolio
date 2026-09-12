"use client";

import { experience, type ExperienceItem } from "@/content";
import { RankedList } from "@/components/search/ranked-list";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { RuleList, RuleListItem } from "@/components/ui/rule-list";
import { highlight } from "@/lib/highlight";

function ExperienceRow({ item, tokens }: { item: ExperienceItem; tokens: string[] }) {
  return (
    <article className="grid gap-2 md:grid-cols-[9rem_1fr] md:gap-10">
      <p className="text-step-neg1 text-ink-3 font-mono md:pt-2">{item.period}</p>

      <div>
        <h3 className="text-step-2 font-medium">{item.role}</h3>
        <p className="text-step-0 text-ink-2 mt-1">
          {item.client ? `${item.company} (${item.client})` : item.company}
        </p>
        <p className="text-step-neg1 text-ink-3 mt-1">{item.location}</p>

        <RuleList className="mt-5">
          {item.bullets.map((bullet) => (
            <RuleListItem key={bullet}>{highlight(bullet, tokens)}</RuleListItem>
          ))}
        </RuleList>
      </div>
    </article>
  );
}

export function Experience() {
  const { tokens } = useSearch();

  return (
    <Section id="work" title="Work">
      <RankedList
        items={experience}
        label="roles"
        className="gap-10"
        renderItem={(item) => <ExperienceRow item={item} tokens={tokens} />}
      />
    </Section>
  );
}
