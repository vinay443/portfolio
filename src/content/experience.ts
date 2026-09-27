import { searchTextFrom, type ExperienceItem } from "./types";

const saksoftBullets = [
  "Built AI modules for a banking compliance platform, implementing Retrieval-Augmented Generation (RAG), semantic search, and vector embedding pipelines to improve knowledge discovery across regulatory and evidence repositories.",
  "Designed and benchmarked semantic search pipelines using Ollama and nomic-embed-text, tuning similarity thresholds and embedding strategies to improve retrieval relevance.",
  "Developed FastAPI backend services and control-evaluation engines automating compliance checks across cloud databases (Aurora MySQL, PostgreSQL, YugabyteDB) and infrastructure baselines, mapped to 15+ frameworks including PCI DSS, SOC 2, ISO 27001, and RBI Cyber Security.",
  "Led frontend migration from server-rendered Jinja2 templates to React + Next.js (App Router, TypeScript, Tailwind, shadcn/ui), modernizing the platform UI.",
  "Partnered with business and technical stakeholders on solution architecture, LLM token-consumption estimation, and AI cost optimization; validated integrations across Local and UAT environments using Docker and GitHub in an Agile workflow.",
];

const saksoftTags = [
  "RAG",
  "Semantic Search",
  "Vector Embeddings",
  "Ollama",
  "nomic-embed-text",
  "FastAPI",
  "Next.js",
  "TypeScript",
  "Docker",
  "PostgreSQL",
  "Compliance",
];

const rutgersBullets = [
  "Integrated ML models (Random Forest, LSTM, GAN) to generate dynamic encryption keys, strengthening resistance against cryptanalysis.",
  "Designed adaptive decryption methods using Python, reducing computational overhead while maintaining security.",
];

const rutgersTags = ["Random Forest", "LSTM", "GAN", "Python", "Cryptography", "Research"];

const insysBullets = [
  "Conducted 50+ penetration tests on client web applications, identifying vulnerabilities and strengthening overall security posture.",
  "Used Nmap, Wireshark, Burp Suite, and Metasploit on Kali Linux to detect and remediate 20+ security issues.",
];

const insysTags = [
  "Nmap",
  "Wireshark",
  "Burp Suite",
  "Metasploit",
  "Kali Linux",
  "Penetration Testing",
];

export const experience: ExperienceItem[] = [
  {
    id: "saksoft-ai-engineer",
    kind: "experience",
    domain: "retrieval",
    company: "Saksoft",
    client: "HDFC Bank",
    role: "AI Engineer",
    location: "Mumbai, India",
    start: "Jun 2026",
    end: "Present",
    period: "Jun 2026 – Present",
    bullets: saksoftBullets,
    tags: saksoftTags,
    searchText: searchTextFrom(
      "Saksoft",
      "HDFC Bank",
      "AI Engineer",
      "Mumbai, India",
      saksoftBullets,
      saksoftTags,
    ),
  },
  {
    id: "rutgers-ml-research-assistant",
    kind: "experience",
    domain: "model",
    company: "Rutgers University",
    role: "Machine Learning Research Assistant",
    location: "New Jersey, USA",
    start: "Mar 2024",
    end: "May 2025",
    period: "Mar 2024 – May 2025",
    bullets: rutgersBullets,
    tags: rutgersTags,
    searchText: searchTextFrom(
      "Rutgers University",
      "Machine Learning Research Assistant",
      "New Jersey, USA",
      rutgersBullets,
      rutgersTags,
    ),
  },
  {
    id: "insys-cybersecurity-intern",
    kind: "experience",
    domain: "adversary",
    company: "Insys Technologies",
    role: "Cyber Security Analyst Intern",
    location: "Mumbai, India",
    start: "Aug 2021",
    end: "Oct 2021",
    period: "Aug 2021 – Oct 2021",
    bullets: insysBullets,
    tags: insysTags,
    searchText: searchTextFrom(
      "Insys Technologies",
      "Cyber Security Analyst Intern",
      "Mumbai, India",
      insysBullets,
      insysTags,
    ),
  },
];
