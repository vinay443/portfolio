"use client";

import { experience, type ExperienceItem } from "@/content";
import { RankedList } from "@/components/search/ranked-list";
import { useSearch } from "@/components/search/search-provider";
import { Section } from "@/components/ui/section";
import { RuleList, RuleListItem } from "@/components/ui/rule-list";
import { RowBar, ScoreReadout, type RowRank } from "@/components/ui/row-bar";
import { highlight } from "@/lib/highlight";

function ExperienceRow({
  item,
  tokens,
  rank,
}: {
  item: ExperienceItem;
  tokens: string[];
  rank: RowRank;
}) {
  return (
    <article className="group relative -mx-4 grid gap-2 px-4 md:grid-cols-[9rem_1fr] md:gap-10">
      <RowBar domain={item.domain} rank={rank} />

      <p className="text-step-neg1 text-ink-3 font-mono md:pt-2">{item.period}</p>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="text-step-2 font-medium">{item.role}</h3>
          <ScoreReadout rank={rank} />
        </div>
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
        renderItem={(item, rank) => <ExperienceRow item={item} tokens={tokens} rank={rank} />}
      />
    </Section>
  );
}
