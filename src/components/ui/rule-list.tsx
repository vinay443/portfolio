import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function RuleList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("flex flex-col gap-2", className)}>{children}</ul>;
}

/**
 * A list row marked by a short hairline rule instead of a bullet glyph. `tone`
 * switches that rule to --flag, which is reserved for adversarial or security
 * material.
 */
export function RuleListItem({
  children,
  tone = "rule",
}: {
  children: ReactNode;
  tone?: "rule" | "flag";
}) {
  return (
    <li
      className={cn(
        "max-w-measure relative pl-6 leading-[1.6] before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3 before:content-['']",
        tone === "flag" ? "before:bg-flag" : "before:bg-rule",
      )}
    >
      {children}
    </li>
  );
}
