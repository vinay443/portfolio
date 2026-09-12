import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "@huggingface/transformers";
import { allContent } from "../src/content/index.ts";

// Must stay identical to EMBEDDING_MODEL in src/lib/semantic.ts. Document and
// query vectors are only comparable when they come from the same model.
const MODEL = "Xenova/all-MiniLM-L6-v2";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(here, "..", "src", "generated", "embeddings.json");

/**
 * Natural-language input reads better to a sentence embedding model than the
 * lowercased bag of words in `searchText`, which exists for the lexical scorer.
 */
function embeddingInput(item) {
  switch (item.kind) {
    case "experience": {
      const organisation = item.client
        ? `${item.company} (client: ${item.client})`
        : item.company;
      return [
        `${item.role} at ${organisation}, ${item.location}, ${item.period}.`,
        item.bullets.join(" "),
        `Tags: ${item.tags.join(", ")}.`,
      ].join(" ");
    }
    case "project":
      return [
        `${item.title}. ${item.oneLiner}`,
        item.longDescription.join(" "),
        item.highlights.join(" "),
        `Stack: ${item.stack.join(", ")}.`,
      ].join(" ");
    case "skill":
      return `${item.category}: ${item.skills.join(", ")}.`;
    case "education":
      return [
        `${item.title}, ${item.institution}.`,
        item.description ?? "",
        (item.honors ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" ");
    default:
      return item.searchText;
  }
}

function l2Normalise(vector) {
  let sumOfSquares = 0;
  for (const value of vector) sumOfSquares += value * value;
  const norm = Math.sqrt(sumOfSquares);
  if (norm === 0) return vector.map(() => 0);
  return vector.map((value) => value / norm);
}

async function main() {
  console.log(`Embedding ${allContent.length} items with ${MODEL}`);

  let extract;
  try {
    extract = await pipeline("feature-extraction", MODEL);
  } catch (error) {
    console.error("\nCould not load the embedding model.\n");
    console.error("  " + String(error?.message ?? error) + "\n");
    console.error("This step downloads the model from the Hugging Face hub on first run.");
    console.error("Check that you are online, then try again. If the failure mentions");
    console.error("onnxruntime-node, its install script has not run yet:\n");
    console.error("  npm approve-scripts --allow-scripts-pending\n");
    console.error("The model is cached afterwards, so later runs work offline.");
    process.exitCode = 1;
    return;
  }

  const vectors = {};
  let dimensions = 0;

  for (const [index, item] of allContent.entries()) {
    const output = await extract(embeddingInput(item), { pooling: "mean", normalize: true });
    const vector = l2Normalise(Array.from(output.data));
    dimensions = vector.length;
    // Six decimals keeps the committed file readable; the error it introduces in
    // a dot product is far below the similarity floor.
    vectors[item.id] = vector.map((value) => Number(value.toFixed(6)));

    const progress = `  [${index + 1}/${allContent.length}] ${item.id}`;
    process.stdout.write("\r" + progress.padEnd(76));
  }

  process.stdout.write("\n");

  const payload = {
    model: MODEL,
    dimensions,
    generatedAt: new Date().toISOString(),
    vectors,
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(`Wrote src/generated/embeddings.json — ${allContent.length} vectors, ${dimensions} dims`);
  console.log("Commit it: the deployed site reads this file and never runs a model server-side.");
}

await main();
