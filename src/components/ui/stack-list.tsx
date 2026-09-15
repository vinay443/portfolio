import { highlight } from "@/lib/highlight";
import { EMPTY_QUERY, type ParsedQuery } from "@/lib/search";
import { DOMAIN_CHIP } from "@/lib/domain";
import { stackDomain } from "@/lib/stack-domain";
import { cn } from "@/lib/cn";

/**
 * Plain text entries tinted by what the technology is, each led by a hairline in
 * the same hue — not pills, not fills, not a joined string.
 */
export function StackList({
  stack,
  query = EMPTY_QUERY,
}: {
  stack: string[];
  query?: ParsedQuery;
}) {
  return (
    <ul className="flex flex-wrap items-center gap-y-1">
      {stack.map((entry) => (
        <li
          key={entry}
          className={cn("text-step-neg1 border-l pr-3 pl-2", DOMAIN_CHIP[stackDomain(entry)])}
        >
          {highlight(entry, query)}
        </li>
      ))}
    </ul>
  );
}
