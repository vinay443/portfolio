import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function RuleList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("flex flex-col gap-2", className)}>{children}</ul>;
}

/**
 * A list row marked by a short hairline rule instead of a bullet glyph. `tone`
 * switches that rule to the adversary hue, reserved for security material.
 */
export function RuleListItem({
  children,
  tone = "rule",
}: {
  children: ReactNode;
  tone?: "rule" | "adversary";
}) {
  return (
    <li
      className={cn(
        "max-w-measure relative pl-6 leading-[1.6] before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3 before:content-['']",
        tone === "adversary" ? "before:bg-adversary" : "before:bg-rule",
      )}
    >
      {children}
    </li>
  );
}
