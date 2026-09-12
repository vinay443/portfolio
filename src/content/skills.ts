import { searchTextFrom, type SkillGroup } from "./types";

const groups: { id: string; category: string; skills: string[] }[] = [
  {
    id: "skills-ai-llm",
    category: "AI & LLM",
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
    skills: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "C", "C++", "R"],
  },
  {
    id: "skills-frameworks",
    category: "Frameworks",
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
    skills: ["MySQL", "PostgreSQL", "MongoDB", "SQLite", "Kafka/Redpanda", "Redis"],
  },
  {
    id: "skills-enterprise",
    category: "Enterprise",
    skills: ["Jira", "Confluence", "SonarQube", "Jenkins", "Azure DevOps", "Postman"],
  },
  {
    id: "skills-security",
    category: "Security",
    skills: ["Nmap", "Wireshark", "Burp Suite", "Metasploit", "Kali Linux"],
  },
];

export const skills: SkillGroup[] = groups.map((group) => ({
  id: group.id,
  kind: "skill",
  category: group.category,
  skills: group.skills,
  searchText: searchTextFrom(group.category, group.skills),
}));
