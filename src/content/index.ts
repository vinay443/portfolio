import { education } from "./education";
import { experience } from "./experience";
import { projects } from "./projects";
import { skills } from "./skills";
import type { SearchableItem } from "./types";

export * from "./types";
export { profile, searchExamples } from "./profile";
export { experience } from "./experience";
export { projects } from "./projects";
export { skills } from "./skills";
export { degree, certifications, education } from "./education";

/** Every indexable item in one array, for the search layer to walk. */
export const allContent: SearchableItem[] = [...experience, ...projects, ...skills, ...education];
