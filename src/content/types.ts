export type ContentKind = "experience" | "project" | "skill" | "education";

/** What a piece of content is about. Drives its hue — see the --c-* tokens. */
export type Domain = "retrieval" | "model" | "infra" | "verified" | "adversary";

/** Every indexable piece of content carries these three fields. */
export interface ContentItem {
  id: string;
  kind: ContentKind;
  /** Lowercased title/role/description/bullets/tags, joined. Substrate for search. */
  searchText: string;
}

export interface ProfileLink {
  label: string;
  href: string;
  handle: string;
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  /** The default meta description. Keep it to 150–160 characters, where search results cut off. */
  summary: string;
  /** One sentence for the hero, condensed from `summary`. */
  heroLine: string;
  /** Shown next to the location in the hero. */
  availability: string;
  /** Opening line of the contact section. */
  lookingFor: string;
  links: ProfileLink[];
  resumeUrl: string;
  /** Résumé links render only when true. Flip it once public/resume.pdf exists. */
  resumeAvailable: boolean;
  /** This site's own source repository. */
  repoUrl: string;
}

export interface ExperienceItem extends ContentItem {
  kind: "experience";
  company: string;
  /** Set when the work was delivered for a named end client. */
  client?: string;
  role: string;
  location: string;
  start: string;
  end: string;
  period: string;
  bullets: string[];
  tags: string[];
  domain: Domain;
}

export type ProjectStatus = "active" | "complete" | "archived";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectItem extends ContentItem {
  kind: "project";
  slug: string;
  title: string;
  oneLiner: string;
  /** One string per paragraph. */
  longDescription: string[];
  role: string;
  /** Omitted when the dates are not known, rather than filled with a placeholder. */
  period?: string;
  stack: string[];
  highlights: string[];
  metrics?: ProjectMetric[];
  /** Explicitly null when there is no public repository. */
  repoUrl: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  /** Client-related work that must not be published in detail. */
  sensitive: boolean;
  domain: Domain;
}

export interface SkillGroup extends ContentItem {
  kind: "skill";
  category: string;
  skills: string[];
  domain: Domain;
}

export type EducationVariant = "degree" | "certification";

export interface EducationItem extends ContentItem {
  kind: "education";
  variant: EducationVariant;
  /** What the credential is. For a degree this is the programme, not the awarding body. */
  title: string;
  /** The awarding body. For a degree this is the line the block leads with. */
  institution: string;
  location?: string;
  /** Which campus of a multi-campus university. Renders ahead of `location`. */
  campus?: string;
  /** The school or college within the university. */
  school?: string;
  /**
   * How the programme is structured — "Double major". Stated rather than left to be
   * inferred from a title that happens to name two subjects.
   */
  qualifier?: string;
  /** Start of the range in the date gutter. Omitted rather than guessed when unknown. */
  start?: string;
  end?: string;
  /** The rendered date. Derived from `start` and `end` so the two cannot drift. */
  period: string;
  gpa?: string;
  /** Short credential labels, rendered as a row of tags rather than prose bullets. */
  honors?: string[];
  /** The particulars those short labels compress, kept to one quiet line. */
  honorsNote?: string;
  /** Hue for the accent rule and the honors tags — see the --c-* tokens. */
  domain?: Domain;
  description?: string;
}

export type SearchableItem = ExperienceItem | ProjectItem | SkillGroup | EducationItem;

/** Builds the `searchText` field so it can never drift from the item it describes. */
export function searchTextFrom(...parts: (string | string[] | undefined)[]): string {
  return parts
    .flat()
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
