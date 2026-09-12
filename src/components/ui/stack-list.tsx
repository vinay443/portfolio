import { cn } from "@/lib/cn";

/** Plain text entries divided by a hairline rule — not pills, not a joined string. */
export function StackList({ stack }: { stack: string[] }) {
  return (
    <ul className="flex flex-wrap items-center">
      {stack.map((entry, index) => (
        <li
          key={entry}
          className={cn(
            "text-step-neg1 text-ink-3",
            index === 0 ? "pr-3" : "border-rule border-l px-3",
          )}
        >
          {entry}
        </li>
      ))}
    </ul>
  );
}
