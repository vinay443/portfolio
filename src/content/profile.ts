import type { Profile } from "./types";

// The GitHub and LinkedIn hrefs are placeholders and will render as broken links
// until they are confirmed. Replace both before the site goes public.
export const profile: Profile = {
  name: "Vinay Warrier",
  role: "AI Engineer",
  location: "Mumbai, India",
  email: "vinaywarrier2108@gmail.com",
  summary:
    "U.S.-educated Computer Science graduate and AI Engineer with hands-on experience developing enterprise AI platforms for the banking sector. Proficient in Python, LLMs, RAG, vector embeddings, Docker, and enterprise integrations, with a strong background in AI application development, semantic search optimization, and production-ready software engineering.",
  heroLine:
    "Builds AI systems for banks: retrieval-augmented generation, semantic search, and the FastAPI services that run them in production.",
  availability: "Open to remote roles with US companies",
  lookingFor:
    "Looking for remote AI Engineer roles with US companies. The work I want involves LLM systems, retrieval, and the backend services around them.",
  links: [
    {
      label: "Email",
      href: "mailto:vinaywarrier2108@gmail.com",
      handle: "vinaywarrier2108@gmail.com",
    },
    {
      label: "GitHub",
      href: "TODO: confirm https://github.com/vinay443",
      handle: "TODO: confirm github.com/vinay443",
    },
    {
      label: "LinkedIn",
      href: "TODO: full LinkedIn URL needed",
      handle: "TODO: full LinkedIn URL needed",
    },
  ],
  resumeUrl: "/resume.pdf",
  repoUrl: "TODO: repo URL for this site",
};

/** Cycled through the hero query field as placeholder text. */
export const searchExamples: string[] = [
  "retrieval",
  "what have you shipped with Kafka",
  "red teaming",
  "banking compliance",
  "what did you study",
];
