import type { Profile } from "./types";

/** Strips the protocol and any trailing slash, so a handle reads as text, not a URL. */
function handleOf(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/**
 * The single source for every contact and social destination. Nothing else in the
 * codebase writes one of these URLs literally: `profile.links`, the Contact
 * section, the footer and the JSON-LD `sameAs` all read from here, so a changed
 * handle changes everywhere at once.
 *
 * The LinkedIn URL is the canonical vanity path. A numeric member id, a `/feed/`
 * URL or anything carrying tracking query params is not interchangeable with it —
 * those rot, and they leak where the link was copied from.
 */
export const siteLinks = {
  email: "vinaywarrier2108@gmail.com",
  github: "https://github.com/vinay443",
  linkedin: "https://www.linkedin.com/in/vinay-warrier/",
  repo: "https://github.com/vinay443/portfolio",
} as const;

export const profile: Profile = {
  name: "Vinay Warrier",
  role: "AI Engineer",
  location: "Mumbai, India",
  email: siteLinks.email,
  summary:
    "U.S.-educated AI Engineer building enterprise AI platforms for banks: RAG pipelines, semantic search, and the FastAPI services that run them in production.",
  heroLine:
    "Builds AI systems for banks: retrieval-augmented generation, semantic search, and the FastAPI services that run them in production.",
  availability: "Open to roles in India and remote worldwide",
  lookingFor:
    "Looking for AI Engineer roles in India, or remote roles anywhere. The work I want involves LLM systems, retrieval, and the backend services around them.",
  links: [
    {
      label: "Email",
      href: `mailto:${siteLinks.email}`,
      handle: siteLinks.email,
    },
    {
      label: "GitHub",
      href: siteLinks.github,
      handle: handleOf(siteLinks.github),
    },
    {
      label: "LinkedIn",
      href: siteLinks.linkedin,
      handle: handleOf(siteLinks.linkedin),
    },
  ],
  resumeUrl: "/resume.pdf",
  resumeAvailable: false,
  repoUrl: siteLinks.repo,
};

/** Cycled through the hero query field as placeholder text. */
export const searchExamples: string[] = [
  "retrieval",
  "what have you shipped with Kafka",
  "red teaming",
  "banking compliance",
  "what did you study",
];
