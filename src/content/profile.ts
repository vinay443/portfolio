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
};
