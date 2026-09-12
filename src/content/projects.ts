import { searchTextFrom, type ProjectItem } from "./types";

type ProjectSeed = Omit<ProjectItem, "id" | "kind" | "searchText">;

const seeds: ProjectSeed[] = [
  {
    slug: "agent-redteam",
    title: "Agent Red-Teaming Lab",
    oneLiner:
      "A sandboxed harness that attacks a tool-using LLM agent and reports how often each class of attack succeeds.",
    longDescription: [
      "A sandboxed harness for measuring how often a tool-using LLM agent can be talked out of its instructions. The agent under test runs inside Docker with two tools, read_file and write_file, under CPU and memory limits and behind path-traversal guards, so an attack that lands does so inside a container rather than on the host.",
      "An attacker component expands a seed corpus of prompt-injection, tool-call-hijacking, and goal-drift attempts through an LLM variant generator, producing phrasings the seed set does not contain. A judge scores each transcript against the attack's stated objective — whether the agent read outside its working directory, called a tool it had been told to avoid, or abandoned the task it was given — and a runner aggregates the results into an attack success rate per category.",
      "The judge is deliberately a separate component from the attacker. A single model that both writes and grades attacks marks its own phrasings generously, which inflates the success rate and hides the categories that actually work.",
    ],
    role: "Sole developer",
    period: "TODO: confirm project period",
    stack: ["Python", "Docker", "LLMs", "Sandboxing", "Evaluation Harness"],
    highlights: [
      "Agent under test runs in Docker with resource limits and path-traversal guards on its file tools",
      "Seed corpus of prompt-injection, tool-call-hijacking, and goal-drift attacks expanded by an LLM variant generator",
      "Judge scores each transcript against the attack's stated objective, separately from the attacker that wrote it",
      "Runner reports attack success rate broken out by attack category",
    ],
    repoUrl: "TODO: confirm https://github.com/vinay443/agent-redteam",
    status: "active",
    featured: true,
    sensitive: false,
  },
  {
    slug: "fraud-detection-api",
    title: "Real-Time Fraud Detection API",
    oneLiner:
      "An XGBoost transaction scorer served over both a Kafka stream and a synchronous REST endpoint.",
    longDescription: [
      "A transaction scoring service that serves an XGBoost model over two paths. Transactions arrive on a Kafka/Redpanda topic for continuous scoring, and a FastAPI endpoint answers synchronous checks for callers that need a decision before a payment completes.",
      "Both paths load the same model artifact and share one feature-building module. That constraint is what holds the design together: when streaming and request/response code compute features separately the two drift, and a transaction scored in the stream stops matching the same transaction scored over HTTP. Fraud labels are a fraction of a percent of volume, so evaluation used precision and recall rather than accuracy, a measure under which a model that answers \"legitimate\" every time already scores above 99%.",
      "The service is containerized and deployed to Kubernetes, with the Kafka consumer group and the API scaled separately because their load profiles differ. Throughput and latency were measured over a replay of more than 100,000 transactions.",
    ],
    role: "Sole developer",
    period: "TODO: confirm project period",
    stack: ["Python", "XGBoost", "FastAPI", "Kafka/Redpanda", "Docker", "Kubernetes"],
    highlights: [
      "Streaming and REST serving paths share one model artifact and one feature-building module",
      "Evaluated on precision and recall to survive a class-imbalanced label distribution",
      "Consumer group and API scaled independently on Kubernetes",
      "Benchmarked over a replay of 100,000+ transactions",
    ],
    metrics: [{ label: "Transactions in benchmark replay", value: "100K+" }],
    status: "complete",
    featured: true,
    sensitive: false,
  },
  {
    slug: "adaptive-encryption-ml",
    title: "Adaptive Encryption with Machine Learning",
    oneLiner:
      "Rutgers research using Random Forest, LSTM, and GAN models to generate dynamic encryption keys, with decryption cheap enough to stay practical.",
    longDescription: [
      "Research at Rutgers on whether machine learning can produce key material that resists pattern analysis better than a fixed generator. Three model families — Random Forest, LSTM, and GAN — were each used to derive encryption keys from evolving input state rather than from a static seed.",
      "The sequence models were the interesting case. Where an algebraic key schedule lets an analyst holding part of the key history extrapolate forward, a learned generator makes that extrapolation require recovering the model itself. The cost is that such a generator is only as strong as its training distribution, which is why three model families were compared rather than one.",
      "Decryption was the practical constraint. A schedule that changes per message is only useful if the receiving side can reconstruct it cheaply, so the adaptive decryption routines were written in Python and profiled against the baseline to find where the overhead actually sat — which cut computational overhead while preserving the resistance the key generation was meant to provide.",
    ],
    role: "Machine Learning Research Assistant",
    period: "Mar 2024 – May 2025",
    stack: ["Python", "Random Forest", "LSTM", "GAN", "Cryptography"],
    highlights: [
      "Three model families compared as key generators rather than committing to one",
      "Keys derived from evolving input state instead of a static seed",
      "Adaptive decryption routines profiled against the baseline to locate the real overhead",
      "Reduced computational overhead while maintaining resistance to cryptanalysis",
    ],
    status: "complete",
    featured: true,
    sensitive: false,
  },
  {
    slug: "discord-activity-analysis",
    title: "Discord Community Activity Analysis",
    oneLiner:
      "A year of Valorant Discord chat analyzed in Python for activity and sentiment trends.",
    longDescription: [
      "One year of message history from a Valorant Discord server, analyzed in Python to describe how activity and tone moved over time.",
      "The export needed the most work. Chat is bursty and conversational, so a daily message count reports a healthy server on days when most of the volume came from two people talking to each other. Activity was therefore measured by unique participants alongside raw message counts, which separates a busy day from a loud one. Sentiment was scored per message but aggregated weekly rather than daily, so that a single argument does not move the trend line.",
      "The output was a set of Matplotlib visualizations covering activity over time, participation concentration, and sentiment trend, delivered to inform community engagement decisions.",
    ],
    role: "Sole developer",
    period: "TODO: confirm project period",
    stack: ["Python", "Pandas", "Matplotlib", "Sentiment Analysis"],
    highlights: [
      "Unique-participant counts used alongside message volume to separate a busy day from a loud one",
      "Sentiment aggregated weekly so single conversations do not distort the trend",
      "Visualizations covering activity over time, participation concentration, and sentiment",
    ],
    status: "complete",
    featured: false,
    sensitive: false,
  },
  {
    slug: "adam-optimizer",
    title: "Adam Optimizer from Scratch",
    oneLiner:
      "Adam implemented and tuned in Python, benchmarked against gradient descent on the Rosenbrock function.",
    longDescription: [
      "An implementation of the Adam optimizer written from scratch in Python — moment estimates, bias correction, and the update rule — rather than called from a framework, in order to see how each term affects convergence.",
      "It was benchmarked against plain gradient descent on the Rosenbrock function, a non-convex surface whose curved valley punishes optimizers that simply follow the steepest direction. Adam reached the target tolerance roughly 25% faster. The instructive part was bias correction: without it the first several steps are heavily damped, because both moment estimates start at zero, and on a surface like Rosenbrock those early steps decide which side of the valley the path settles into.",
      "The learning rate and both decay rates were tuned by sweep, with the loss trajectory recorded per configuration to show where the optimizer overshot the valley floor and where it stalled.",
    ],
    role: "Sole developer",
    period: "TODO: confirm project period",
    stack: ["Python", "NumPy", "Numerical Optimization"],
    highlights: [
      "Moment estimates, bias correction, and update rule implemented directly rather than imported",
      "Benchmarked against gradient descent on the non-convex Rosenbrock function",
      "Hyperparameters tuned by sweep with per-configuration loss trajectories recorded",
    ],
    metrics: [{ label: "Convergence vs. gradient descent", value: "~25% faster" }],
    status: "complete",
    featured: false,
    sensitive: false,
  },
];

export const projects: ProjectItem[] = seeds.map((seed) => ({
  ...seed,
  id: `project-${seed.slug}`,
  kind: "project",
  searchText: searchTextFrom(
    seed.title,
    seed.oneLiner,
    seed.longDescription,
    seed.role,
    seed.stack,
    seed.highlights,
    seed.status,
  ),
}));
