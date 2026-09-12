export type SemanticStatus = "idle" | "loading" | "ready" | "failed";

/** Must stay identical to MODEL in scripts/embed-content.mjs. */
export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

interface EmbeddingFile {
  model: string;
  dimensions: number;
  generatedAt: string;
  vectors: Record<string, number[]>;
}

/** Narrow view of the transformers.js pipeline — enough to call, nothing more. */
type Extractor = (
  text: string,
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: ArrayLike<number> }>;

let loadPromise: Promise<boolean> | null = null;
let extractor: Extractor | null = null;
let documentVectors: Record<string, number[]> = {};

function normalise(vector: number[]): number[] {
  let sumOfSquares = 0;
  for (const value of vector) sumOfSquares += value * value;
  const norm = Math.sqrt(sumOfSquares);
  if (norm === 0) return vector;
  return vector.map((value) => value / norm);
}

async function initialise(): Promise<boolean> {
  try {
    // Both imports are deferred so neither the model nor the vector file is
    // fetched until someone actually reaches for the search field.
    const file = (await import("@/generated/embeddings.json")).default as unknown as EmbeddingFile;
    if (!file || Object.keys(file.vectors).length === 0) return false;
    documentVectors = file.vectors;

    const { pipeline } = await import("@huggingface/transformers");
    extractor = (await pipeline("feature-extraction", EMBEDDING_MODEL)) as unknown as Extractor;

    return true;
  } catch {
    return false;
  }
}

/** Idempotent: concurrent callers share one download. */
export function loadSemantic(): Promise<boolean> {
  loadPromise ??= initialise();
  return loadPromise;
}

export async function embedQuery(text: string): Promise<number[] | null> {
  if (!extractor) return null;
  try {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return normalise(Array.from(output.data));
  } catch {
    return null;
  }
}

export function documentVector(id: string): number[] | undefined {
  return documentVectors[id];
}

/** Both sides are L2-normalised, so cosine similarity is just a dot product. */
export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    total += (a[index] ?? 0) * (b[index] ?? 0);
  }
  return total;
}
