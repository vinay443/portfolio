export type ContentKind = "experience" | "project" | "skill" | "education";

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
  summary: string;
  /** One sentence for the hero, condensed from `summary`. */
  heroLine: string;
  /** Shown next to the location in the hero. */
  availability: string;
  /** Opening line of the contact section. */
  lookingFor: string;
  links: ProfileLink[];
  resumeUrl: string;
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
  period: string;
  stack: string[];
  highlights: string[];
  metrics?: ProjectMetric[];
  repoUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  /** Client-related work that must not be published in detail. */
  sensitive: boolean;
}

export interface SkillGroup extends ContentItem {
  kind: "skill";
  category: string;
  skills: string[];
}

export type EducationVariant = "degree" | "certification";

export interface EducationItem extends ContentItem {
  kind: "education";
  variant: EducationVariant;
  title: string;
  institution: string;
  location?: string;
  period: string;
  gpa?: string;
  honors?: string[];
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
