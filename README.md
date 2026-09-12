# Vinay Warrier — Portfolio

A personal site that presents my work as a searchable, re-rankable index rather than a scrolling brochure.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-0F4C5C)
[![CI](https://github.com/TODO-github-user/TODO-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/TODO-github-user/TODO-repo/actions/workflows/ci.yml)

<!-- TODO: replace TODO-github-user/TODO-repo in the badge URLs above with the real repository path. -->

## Screenshots

![The site in its light theme](docs/screenshot-light.png)

![The site in its dark theme](docs/screenshot-dark.png)

## What this is

My portfolio, built as a piece of work in its own right rather than a template fill-in. The hero contains a query field; typing filters and re-orders every entry on the page — roles, projects, skills, credentials — with an animated layout transition, and the resulting ranking is shareable through a `?q=` parameter.

That framing is deliberate. Retrieval is what I do professionally: building RAG pipelines, embedding pipelines and semantic search over regulatory and evidence repositories for a banking compliance platform. A CV is a small corpus with the same problem shape, so this site solves it in public.

The page is server-rendered and complete with an empty query. Search is an enhancement, never a requirement — with JavaScript disabled every item is still present, in a sensible default order.

## How the search works

The ranking lives in `src/lib/search.ts`. It is a pure, dependency-free module with no React and no content imports, so it can be tested in isolation.

This half is purely lexical: no embeddings, no vector index. On its own it cannot connect "retrieval" to "RAG" unless the word is actually present. Closing that gap is what the semantic layer below is for — the two are blended, not swapped.

1. **Tokenization.** The query is lowercased, punctuation is stripped, and stopwords (`a`, `an`, `the`, `and`, `or`, `of`, `in`, `on`, `for`, `with`, `to`, `is`, `at`) are dropped. `+` and `#` survive so `c++` stays one token, while `/` is treated as a separator so `kafka/redpanda` indexes as two.

2. **Field-weighted scoring.** Every item carries a precomputed `searchText` field — its title, role, description, bullets and tags, lowercased and concatenated. Per token: `+3` for a whole-word match in the title or role, `+2` for a match against a tag or stack entry, `+1` for a substring match anywhere in `searchText`, and `+0.5` when a token of three or more characters is a prefix of a longer word. The signals stack, so a token that hits the title also earns the substring point.

3. **Normalization.** The total is divided by the token count, so a long query cannot outscore a short one merely by having more terms.

4. **Stable tie-breaking.** Items sort by score descending, and ties fall back to the original array index. Equal-scoring items never shuffle between keystrokes.

5. **Empty-query default.** A query with no usable tokens returns every item in its authored order with a score of zero — featured projects first. A query of nothing but stopwords is treated as no search at all, rather than as a search that matches everything.

Skills, education and certifications are scored but never removed: a group that does not match dims instead of disappearing, because it is the context the matches sit in.

## Semantic search

Lexical scoring alone cannot answer "what have you shipped with Kafka" unless the words appear verbatim. The site also runs genuine semantic retrieval — entirely in the browser, with no backend, no API key and no inference server.

**Document vectors are precomputed and committed.** `npm run embed` reads every item from `src/content/`, builds a natural-language string from it, embeds it, L2-normalizes the result and writes `src/generated/embeddings.json`. That file is committed to the repository. It is deliberately *not* wired into `npm run build`: a deploy must never depend on a model being present on the build machine, and the vectors only change when the content does.

**Query vectors are computed in the browser.** The visitor's query is embedded client-side by transformers.js running the model over WASM. The model is lazy-loaded on first focus of the search field and never on page load, so nobody pays for it unless they actually search.

**Both sides must come from the same model — this is the constraint that shaped the design.** The first version embedded documents with a local Ollama instance running `nomic-embed-text`, which is what I use at work. That could not survive contact with the browser. Ollama is a server; there is none in production, and the query therefore had to be embedded by some other model. Vectors from two different models are not comparable — cosine similarity between them is noise, because they are points in unrelated spaces that merely happen to have a similar shape. Averaging, projecting or rescaling between them does not fix it. The only real fix is to pick one model that runs in both places, so the build step and the browser now both use `Xenova/all-MiniLM-L6-v2` (384 dimensions): under Node for the offline pass, under WASM for the query. Ollama was dropped entirely.

**Retrieval is a dot product.** Because both sides are L2-normalized at write time, cosine similarity reduces to a dot product with no per-query normalization. Around thirty documents at 384 dimensions is a few thousand multiply-adds per keystroke, which is nothing.

**Scoring is hybrid:** `0.6 * semantic + 0.4 * lexical`. The lexical score is first divided by the most a single token can earn (`MAX_TOKEN_SCORE`, 6.5), so both terms sit on a 0–1 scale and the weights mean what they appear to mean. Semantic similarity below `SEMANTIC_FLOOR` (0.28, in `src/lib/hybrid.ts`) is discarded: the model assigns every pair *some* similarity, so without a floor a query that matches nothing still quietly reorders the entire page. The value was tuned by hand against this corpus.

**Failure is silent.** If the model cannot be downloaded, the browser has no WASM, or `embeddings.json` has not been generated yet, ranking falls back to pure lexical scoring and nothing visibly breaks. A small line under the query field reads "semantic search loading" and then "semantic"; if it failed it says nothing at all.

One limitation worth stating plainly: MiniLM truncates at 256 tokens, so only the opening of a long project description makes it into the vector. The lexical half still reads the whole text.

## Stack

| Technology | Why |
| --- | --- |
| Next.js 16 (App Router) | Server components keep the content in the initial HTML, which is what makes the no-JavaScript path work. |
| TypeScript (strict, `noUncheckedIndexedAccess`) | The content layer is typed at its source, so a missing project field is a compile error rather than a blank space. |
| Tailwind CSS v4 | CSS-first theming: every token is a custom property in `globals.css`, and `.dark` redefines the same names. |
| transformers.js (`@huggingface/transformers`) | Runs the embedding model in the browser over WASM, so semantic search needs no server and no key. |
| Motion | Layout animation for the re-ranking transition — the one interaction on the site worth animating. |
| next-themes | System, light and dark without a flash of the wrong theme on load. |
| lucide-react | Consistent icon set, tree-shaken, no icon font to load. |
| GitHub Actions | Lint and build on every push and pull request. |

## Project structure

```
scripts/
└── embed-content.mjs           Build-time embedding pass, run by hand (npm run embed)

src/
├── app/
│   ├── layout.tsx              Fonts, theme + search providers, metadata, JSON-LD
│   ├── page.tsx                Home: hero, sections, chrome
│   ├── globals.css             Every design token; the only place colour is defined
│   ├── opengraph-image.tsx     1200x630 social card, generated at build time
│   ├── sitemap.ts, robots.ts   Generated from the content layer
│   └── projects/[slug]/        Statically generated project detail routes
├── components/
│   ├── chrome/                 Header, footer, theme toggle
│   ├── search/                 Search context, ranked list, result summary
│   ├── sections/               Hero, experience, projects, skills, background, contact
│   └── ui/                     Section, empty state, rule list, stack list
├── content/                    All site copy, as typed modules — see below
├── generated/                  Committed embeddings.json — never edited by hand
└── lib/
    ├── search.ts               Tokenizer and lexical scoring (pure)
    ├── semantic.ts             Lazy in-browser model, query embedding, cosine
    ├── hybrid.ts               Weighted blend of the two, plus the similarity floor
    ├── highlight.tsx           Wraps matched tokens in <mark>, returns React nodes
    ├── format.ts               Date-range and placeholder helpers
    └── cn.ts                   clsx + tailwind-merge, extended for project tokens
```

## Running locally

The Node version is pinned in `.nvmrc` (Node 22).

```bash
nvm use
npm ci
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run embed` | Regenerate `src/generated/embeddings.json`. Run after changing content, then commit the result. |
| `npm run format` | Prettier over the repository |
| `npm run format:check` | Prettier in check mode, no writes |

## Content

No copy is hardcoded in a component. Everything lives in `src/content/` as typed modules — `profile.ts`, `experience.ts`, `projects.ts`, `skills.ts`, `education.ts` — re-exported through `index.ts`, with the shapes in `types.ts`.

To add a project, append an entry to the `seeds` array in `src/content/projects.ts`:

- **Required:** `slug` (URL-safe, becomes `/projects/<slug>`), `title`, `oneLiner`, `longDescription` (an array, one string per paragraph), `role`, `period`, `stack`, `highlights`, `status` (`active`, `complete` or `archived`), `featured`, `sensitive`.
- **Optional:** `metrics` (label/value pairs), `repoUrl`, `liveUrl`.

Two fields carry behaviour:

- **`searchText`** is the substrate the ranker reads. It is built by `searchTextFrom()` when the array is mapped, so it cannot drift from the item it describes. Do not write it by hand.
- **`sensitive: true`** removes a project from the index, from `generateStaticParams` and from the sitemap, and makes its route return 404. Client work that cannot be published in detail belongs in `experience.ts` at resume level of detail instead.

Facts that are not yet confirmed are written as the literal string `TODO:` followed by what is missing. The UI checks for that prefix and omits the field rather than printing it.

## Design decisions

- One type family, IBM Plex, with the monospace reserved for genuine data — dates, metrics, status — and never used as decoration.
- Design tokens over hardcoded values. No component contains a hex code; `globals.css` is the only place colour is defined.
- Hairline rules and whitespace instead of cards and shadows. The only shadow on the site is the focus ring.
- Motion appears twice: once on page load, and once for user-triggered re-ranking. Nothing animates on scroll, and nothing animates on hover beyond a colour transition.
- `prefers-reduced-motion` is honoured throughout — the load sequence, the re-ranking transition and the cycling placeholder all settle into their final state instead.
- Colour pairs meet WCAG AA at their intended text sizes in both themes.

## Deployment

Vercel, zero configuration — import the repository and it builds on the defaults. There are no environment variables and no external services.

One value must be changed before deploying: `SITE_URL` in `src/lib/site.ts` is a placeholder. It feeds `metadataBase`, the sitemap and `robots.txt`, so social cards and crawler directives point at the wrong host until it is set to the real domain.

## License

MIT — see [LICENSE](LICENSE).
