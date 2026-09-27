import type { Domain, ProjectItem } from "@/content";

/**
 * Status is plain mono text whose hue carries the meaning: finished work reads as
 * verified, work still in flight as the accent, archived as quiet ink.
 *
 * The adversary hue is deliberately absent. It means attack surface, and on a
 * status label a red word reads as failure — which it was doing to the newest and
 * most prominent project. A project's adversarial subject is already carried by
 * its domain, through the row bar, the dot field and the stack chips, so nothing
 * is lost by keeping status and subject on separate channels.
 */
export function projectStatusClass(project: Pick<ProjectItem, "status">): string {
  if (project.status === "complete") return "text-verified";
  if (project.status === "active") return "text-accent";
  return "text-ink-3";
}

// Tailwind only generates classes it can find as complete strings in source, so
// every domain utility is spelled out here rather than built as `text-${domain}`.

export const DOMAIN_TEXT: Record<Domain, string> = {
  retrieval: "text-retrieval",
  model: "text-model",
  infra: "text-infra",
  verified: "text-verified",
  adversary: "text-adversary",
};

export const DOMAIN_BG: Record<Domain, string> = {
  retrieval: "bg-retrieval",
  model: "bg-model",
  infra: "bg-infra",
  verified: "bg-verified",
  adversary: "bg-adversary",
};

export const DOMAIN_FILL: Record<Domain, string> = {
  retrieval: "fill-retrieval",
  model: "fill-model",
  infra: "fill-infra",
  verified: "fill-verified",
  adversary: "fill-adversary",
};

/**
 * Stack chips. 92% rather than a softer 80%: at 80% the infra hue on --bg (light)
 * and the adversary hue on --surface (dark) fall below WCAG AA for 15px text, and
 * 92% is the lowest single value that clears 4.5:1 for every hue in both themes.
 */
export const DOMAIN_CHIP: Record<Domain, string> = {
  retrieval: "text-retrieval/92 border-retrieval/92",
  model: "text-model/92 border-model/92",
  infra: "text-infra/92 border-infra/92",
  verified: "text-verified/92 border-verified/92",
  adversary: "text-adversary/92 border-adversary/92",
};
