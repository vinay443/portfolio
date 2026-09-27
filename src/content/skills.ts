import { searchTextFrom, type Domain, type SkillGroup } from "./types";

const groups: { id: string; category: string; domain: Domain; skills: string[] }[] = [
  {
    id: "skills-ai-llm",
    category: "AI & LLM",
    domain: "model",
    skills: [
      "Large Language Models",
      "Retrieval-Augmented Generation",
      "Vector Embeddings",
      "Semantic Search",
      "Ollama",
      "nomic-embed-text",
      "scikit-learn",
      "TensorFlow",
      "Random Forest",
      "LSTM",
      "GAN",
    ],
  },
  {
    id: "skills-languages",
    category: "Languages",
    domain: "retrieval",
    skills: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "C", "C++", "R"],
  },
  {
    id: "skills-frameworks",
    category: "Frameworks",
    domain: "retrieval",
    skills: [
      "React",
      "Next.js",
      "Vite",
      "Tailwind CSS",
      "shadcn/ui",
      "FastAPI",
      "Pandas",
      "NumPy",
      "Matplotlib",
    ],
  },
  {
    id: "skills-cloud-devops",
    category: "Cloud & DevOps",
    domain: "infra",
    skills: [
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub",
      "GitHub Actions",
      "AWS (EC2, S3, Lambda)",
      "CI/CD",
    ],
  },
  {
    id: "skills-data-messaging",
    category: "Data & Messaging",
    domain: "infra",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "SQLite", "Kafka/Redpanda", "Redis"],
  },
  {
    id: "skills-enterprise",
    category: "Enterprise",
    domain: "infra",
    skills: ["Jira", "Confluence", "SonarQube", "Jenkins", "Azure DevOps", "Postman"],
  },
  {
    id: "skills-security",
    category: "Security",
    domain: "adversary",
    skills: ["Nmap", "Wireshark", "Burp Suite", "Metasploit", "Kali Linux"],
  },
];

/**
 * What people call the section rather than any one skill in it. "What are your
 * skills" names no technology, so without these it matched nothing here.
 */
const SKILL_TERMS = ["skills", "skillset", "tech stack", "technologies", "tools"];

/**
 * The index text for one skill. Skills are matched one at a time — by the hero's
 * count, the Skills section and the similarity field — so each carries the section's
 * terms itself.
 */
export function skillSearchText(skill: string): string {
  return searchTextFrom(skill, SKILL_TERMS);
}

export const skills: SkillGroup[] = groups.map((group) => ({
  id: group.id,
  kind: "skill",
  category: group.category,
  domain: group.domain,
  skills: group.skills,
  searchText: searchTextFrom(group.category, group.skills, SKILL_TERMS),
}));
