import { searchTextFrom, type ProjectItem } from "./types";

type ProjectSeed = Omit<ProjectItem, "id" | "kind" | "searchText"> & {
  /** Extra words for `searchText` only. Never rendered, and not carried onto the item. */
  searchTerms?: string[];
};

const seeds: ProjectSeed[] = [
  {
    slug: "agent-redteam",
    title: "Agent Red-Teaming Lab",
    oneLiner:
      "A red-teaming lab that attacks a tool-using LLM agent inside a locked-down container and measures which attacks get through — and which layer stopped the rest.",
    longDescription: [
      "A harness for measuring how often a tool-using LLM agent can be talked out of its instructions. The target agent has real file-system tools, read_file and write_file, and runs inside a Docker container with CPU, memory and process limits, a read-only filesystem, path-traversal guards and an egress allowlist, so an attack that lands does so inside the box rather than on the host.",
      "An LLM-driven attacker expands a hand-written seed corpus into variants across four categories: prompt injection, goal hijacking, permission escalation and system-prompt exfiltration. Each category has a concrete definition of \"the attacker won\". Where the outcome can be checked mechanically, code decides: a per-run canary token for exfiltration, a file operation that escaped the sandbox root for escalation, an artefact the agent only produces if it obeyed an injection. An LLM judge with an explicit rubric is used only where code can't decide, such as whether the agent abandoned the user's task.",
      "Beyond the success rate, the report separates attacks blocked by a code boundary from attacks the model declined. That split is between structural safety, which holds whatever model is behind it, and behavioural safety, which depends on the model. Every attack, tool call and verdict is logged with a timestamp to SQLite and JSONL. Each run records its backend, models and a SHA-256 fingerprint of the system-prompt template, so results can't silently drift between prompt versions.",
      "Across two 80-attack sandboxed campaigns, zero tool calls escaped the sandbox. The first campaign used qwen3:8b and the second qwen3:4b. The overall attack success rate fell from 34.3% to 10.5%, and the write-up explains why that is not evidence of a safer system: switching models changed the attacker, target and judge at once. The one directly comparable result is containment, which is enforced in code and held in both runs.",
    ],
    role: "Sole developer",
    stack: [
      "Python",
      "Docker",
      "Ollama (qwen3)",
      "Anthropic API",
      "SQLite",
      "pytest",
      "GitHub Actions",
    ],
    highlights: [
      "Target agent sandboxed in Docker: resource limits, read-only filesystem, path-traversal guards, egress allowlist",
      "Four attack categories, seeded by hand and expanded by an LLM variant generator",
      "Code-based success checks where possible, including canary tokens and sandbox-escape detection; a rubric LLM judge only where needed",
      "Reports blocked-by-code vs model-refused, separating structural from behavioural safety",
      "0 sandbox escapes across 160 attacks in two campaigns",
      "Provider-neutral LLM client: local Ollama (qwen3) or the Anthropic API with one config switch",
      "Offline pytest suite, run in CI on GitHub Actions",
    ],
    // Index-only: the words people search for this with, where the copy phrases them
    // differently or not at all ("qwen" alone never matches "qwen3").
    searchTerms: [
      "prompt injection",
      "goal hijacking",
      "permission escalation",
      "system prompt exfiltration",
      "jailbreak",
      "red teaming",
      "AI safety",
      "LLM security",
      "Ollama",
      "qwen",
      "sandbox",
      "containment",
    ],
    // Rendered as a live link. Verify this repository is public before deploying;
    // a private repo shows visitors a GitHub 404.
    repoUrl: "https://github.com/vinay443/agent-redteam",
    liveUrl: null,
    status: "active",
    featured: true,
    sensitive: false,
    domain: "adversary",
  },
  {
    slug: "fraud-detection-api",
    title: "Real-Time Fraud Detection API",
    oneLiner:
      "A supervised machine learning transaction scorer, trained with XGBoost and served over both a Kafka stream and a synchronous REST endpoint.",
    longDescription: [
      "A transaction scoring service that serves an XGBoost model over two paths. Transactions arrive on a Kafka/Redpanda topic for continuous scoring, and a FastAPI endpoint answers synchronous checks for callers that need a decision before a payment completes.",
      "Both paths load the same model artifact and share one feature-building module. That constraint is what holds the design together: when streaming and request/response code compute features separately the two drift, and a transaction scored in the stream stops matching the same transaction scored over HTTP. Fraud labels are a fraction of a percent of volume, so evaluation used precision and recall rather than accuracy, a measure under which a model that answers \"legitimate\" every time already scores above 99%.",
      "The service is containerized and deployed to Kubernetes, with the Kafka consumer group and the API scaled separately because their load profiles differ. Throughput and latency were measured over a replay of more than 100,000 transactions.",
    ],
    role: "Sole developer",
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
    repoUrl: "https://github.com/vinay443/fraud_detection_api",
    liveUrl: null,
    sensitive: false,
    domain: "infra",
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
    repoUrl: null,
    liveUrl: null,
    sensitive: false,
    domain: "adversary",
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
    stack: ["Python", "Pandas", "Matplotlib", "Sentiment Analysis"],
    highlights: [
      "Unique-participant counts used alongside message volume to separate a busy day from a loud one",
      "Sentiment aggregated weekly so single conversations do not distort the trend",
      "Visualizations covering activity over time, participation concentration, and sentiment",
    ],
    status: "complete",
    featured: false,
    repoUrl: "https://github.com/vinay443/Discord-Server-Activity-Pattern",
    liveUrl: null,
    sensitive: false,
    domain: "model",
  },
  {
    slug: "adam-optimizer",
    title: "Adam Optimizer from Scratch",
    oneLiner:
      "Adam implemented and tuned in Python, benchmarked against gradient descent on the Rosenbrock function.",
    longDescription: [
      "The Adam optimizer, implemented from scratch in Python to minimize the Rosenbrock function and compared against plain gradient descent on the same surface. Adam converged roughly 25% faster. The moment estimates, bias correction, and update rule were written directly rather than called from a framework, in order to see how each term affects convergence.",
      "Rosenbrock is non-convex: its minimum sits inside a long, curved valley that punishes an optimizer which simply follows the steepest direction. Plain gradient descent uses one step size for every parameter, so a step small enough not to overshoot across the narrow valley makes slow progress along its floor. Adam scales each parameter's step by that parameter's own gradient history, which is the adaptability the comparison showed. Bias correction mattered most at the start: both moment estimates begin at zero, so without it the first several steps are heavily damped, and on this surface those early steps decide which side of the valley the path settles into.",
      "The hyperparameters — the learning rate and both decay rates — were tuned by sweep, with the loss trajectory recorded per configuration to show where the optimizer overshot the valley floor and where it stalled.",
    ],
    role: "Sole developer",
    stack: ["Python", "NumPy", "Numerical Optimization"],
    highlights: [
      "Moment estimates, bias correction, and update rule implemented directly rather than imported",
      "Benchmarked against gradient descent on the non-convex Rosenbrock function",
      "Hyperparameters tuned by sweep with per-configuration loss trajectories recorded",
    ],
    metrics: [{ label: "Convergence vs. gradient descent", value: "~25% faster" }],
    status: "complete",
    featured: false,
    repoUrl: "https://github.com/vinay443/ADAM-optimizer-algorithm",
    liveUrl: null,
    sensitive: false,
    domain: "model",
  },
  {
    slug: "multithreaded-web-crawler",
    title: "Multithreaded Web Crawler in C",
    oneLiner:
      "A crawler in C that fetches pages across POSIX threads through libcurl, extracts each page's hyperlinks with libxml2, and shares one mutex-locked URL queue.",
    longDescription: [
      "A web crawler written in C at Rutgers University. POSIX threads fetch several URLs at once through libcurl, and libxml2 parses the HTML of each fetched page to extract its hyperlinks, which become the next URLs to crawl.",
      "Fetching in parallel is where the speed comes from, and the URL queue is where that parallelism can go wrong. The threads share one queue, and a mutex locks it for every read and write. Without the lock, two threads can take the same URL, or one can read the queue while another is part-way through modifying it, and the failures that follow appear on some runs and not others. Memory needs the same discipline: a response arrives from libcurl in pieces whose total size is not known in advance, so the data for each HTTP request is held in dynamically allocated memory while the response is processed.",
      "A log records the crawl's activity as it runs, and shutdown goes through a structured cleanup path rather than a bare exit. In C nothing is released unless the program releases it, and with several threads holding memory and library state at the same time, termination is where leaks and use-after-free errors collect.",
    ],
    role: "Developer",
    period: "Jan 2024 – May 2024",
    stack: ["C", "libcurl", "libxml2", "Multithreading"],
    highlights: [
      "POSIX threads fetch multiple URLs concurrently through libcurl",
      "Hyperlinks extracted from each fetched page's HTML with libxml2",
      "One URL queue shared across threads and synchronized with mutex locks",
      "Dynamic memory allocation for HTTP transfers, and a structured cleanup path for resources on exit",
    ],
    status: "complete",
    featured: false,
    repoUrl: null,
    liveUrl: null,
    sensitive: false,
    domain: "infra",
  },
];

export const projects: ProjectItem[] = seeds.map(({ searchTerms, ...seed }) => ({
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
    searchTerms,
    // `status` is left out: "active" and "complete" describe the page, not the work,
    // and would direct-match every finished project for a reason no reader would see.
  ),
}));
