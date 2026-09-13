import type { Domain } from "@/content";

const STACK_DOMAIN: Record<string, Domain> = {
  python: "retrieval",
  typescript: "retrieval",
  r: "retrieval",

  llms: "model",
  xgboost: "model",
  lstm: "model",
  gan: "model",
  "random forest": "model",
  sandboxing: "model",
  "evaluation harness": "model",
  "sentiment analysis": "model",
  "numerical optimization": "model",

  docker: "infra",
  kubernetes: "infra",
  fastapi: "infra",
  "kafka/redpanda": "infra",
  kafka: "infra",
  redpanda: "infra",
  postgresql: "infra",
  redis: "infra",
  aws: "infra",

  cryptography: "adversary",
};

/** Unlisted technologies fall back to retrieval, the site's neutral hue. */
export function stackDomain(technology: string): Domain {
  return STACK_DOMAIN[technology.trim().toLowerCase()] ?? "retrieval";
}
