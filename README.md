# Vinay Warrier — Portfolio

A personal site that presents my work as a searchable, re-rankable index rather than a scrolling brochure.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-0F4C5C)
[![CI](https://github.com/vinay443/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/vinay443/portfolio/actions/workflows/ci.yml)

<!-- Screenshots section removed until docs/screenshot-light.png and docs/screenshot-dark.png exist. Restore it when they are added. -->

## What this is

My portfolio, built as a piece of work in its own right rather than a template fill-in. The hero contains a query field; typing filters and re-orders every entry on the page — roles, projects, skills, credentials — with an animated layout transition, and the resulting ranking is shareable through a `?q=` parameter.

That framing is deliberate. Retrieval is what I do professionally: building RAG pipelines, embedding pipelines and semantic search over regulatory and evidence repositories for a banking compliance platform. A CV is a small corpus with the same problem shape, so this site solves it in public.

The page is server-rendered and complete with an empty query. Search is an enhancement, never a requirement — with JavaScript disabled every item is still present, in a sensible default order.

## How the search works

**Ranking is field-weighted lexical scoring.** Nothing else runs: there are no embeddings and no vector index in the ranking path.

The scorer lives in `src/lib/search.ts`. It is a pure, dependency-free module with no React and no content imports, so it can be tested in isolation.

Queries are also expanded through a small, hand-curated synonym list in `src/lib/expansion.ts`, so "RAG" reaches items that say "retrieval", and matches reached only through a synonym are weighted at 0.4× a direct match and never highlighted. This is term expansion over a fixed list, not semantic similarity: a word that is not in the list reaches nothing it does not literally contain.

1. **Tokenization.** The query is lowercased, punctuation is stripped, and stopwords are dropped, from content and query alike: function words, question words and auxiliaries, pronouns, request verbs like "tell" and "show", and the fragments an apostrophe leaves behind. Visitors ask questions, so "what did you study" searches for "study" alone rather than for any project that happens to say "what". The full list is in `src/lib/search.ts`. `+` and `#` survive so `c++` stays one token, while `/` is treated as a separator so `kafka/redpanda` indexes as two.

2. **Field-weighted scoring.** Every item carries a precomputed `searchText` field — its title, role, description, bullets and tags, lowercased and concatenated. Per token: `+3` for a match in the title or role, `+2` for a match against a tag or stack entry, `+1` for a match anywhere in `searchText`, and `+0.5` when the last word of the query, the one still being typed, has three or more characters and starts a longer word — so "kaf" finds "Kafka", while a finished word, or any word followed by a space, gets no prefix credit. Every match is on word boundaries — "red" matches "red-teaming" but not "reducing" or "Redpanda" — with plurals and "-ing" forms folded together. The signals stack, so a token that hits the title also earns the `searchText` point. Highlighting does not have its own matching rules: it marks what the same `directMatches()` function finds, so a typed word is underlined only where it counts, stemmed matches included ("learning" underlines the "learn" in "scikit-learn").

3. **Normalization.** The total is divided by the token count, so a long query cannot outscore a short one merely by having more terms. The score a row shows is that figure over 3 (what a word earns as a tag or stack entry), capped at 1.00. It is absolute, not scaled to the best row: 1.00 means the item names every word typed, and a query that nothing answers well reads low rather than crowning its best match 1.00.

4. **Tiers, then score.** Items that contain a typed term — as a whole word, or for the word still being typed as the start of one — rank above items reached only through a synonym, and the page labels the second group "Related matches". Within each group items sort by their full score, and ties fall back to the original array index, so equal-scoring items never shuffle between keystrokes.

5. **Empty-query default.** A query with no usable tokens returns every item in its authored order with a score of zero — featured projects first. A query of nothing but stopwords is treated as no search at all, rather than as a search that matches everything.

Education, certifications and skills are also indexed under the words people use to ask about them — "degree", "college", "university", "study", "certificate", "skills", "tech stack" — which their rendered text does not spell out. They are scored but never removed: anything that does not match dims instead of disappearing, because it is the context the matches sit in. Skills dim one at a time, by the same test the hero's count uses, and a skill group's heading stays lit while any skill in it matches.

## Stack

| Technology | Why |
| --- | --- |
| Next.js 16 (App Router) | Server components keep the content in the initial HTML, which is what makes the no-JavaScript path work. |
| TypeScript (strict, `noUncheckedIndexedAccess`) | The content layer is typed at its source, so a missing project field is a compile error rather than a blank space. |
| Tailwind CSS v4 | CSS-first theming: every token is a custom property in `globals.css`, and `.dark` redefines the same names. |
| Motion | Layout animation for the re-ranking transition — the one interaction on the site worth animating. |
| Local theme provider | System, light and dark with no flash on load. Replaces next-themes, whose inline `<script>` triggers React 19's "Encountered a script tag" warning and whose dual CJS/ESM build can split the theme context in two. The pre-paint script is written through `useServerInsertedHTML`, outside React's client tree. |
| lucide-react | Consistent icon set, tree-shaken, no icon font to load. |
| GitHub Actions | Lint and build on every push and pull request. |

## Project structure

```
src/
├── app/
│   ├── layout.tsx              Fonts, providers, header + footer, metadata, JSON-LD
│   ├── page.tsx                Home: hero and sections
│   ├── globals.css             Every design token; the only place colour is defined
│   ├── opengraph-image.tsx     1200x630 social card, generated at build time
│   ├── sitemap.ts, robots.ts   Generated from the content layer
│   └── projects/[slug]/        Statically generated project detail routes
├── components/
│   ├── chrome/                 Header, footer, theme toggle
│   ├── hero/                   Headshot, and the similarity field — the live map of the index
│   ├── search/                 Search context, ranked list, result summary
│   ├── sections/               Hero, experience, projects, skills, background, contact
│   ├── theme/                  Theme provider and pre-paint script
│   └── ui/                     Section, empty state, rule list, stack list, row bar
├── content/                    All site copy, as typed modules — see below
└── lib/
    ├── search.ts               Tokenizer and lexical scoring (pure)
    ├── expansion.ts            Curated synonym groups for query expansion
    ├── highlight.tsx           Wraps matched tokens in <mark>, returns React nodes
    ├── domain.ts               Domain → colour class maps, project status colour
    ├── stack-domain.ts         Which domain each technology belongs to
    ├── prng.ts                 Seeded mulberry32 for the deterministic field layout
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
| `npm run format` | Prettier over the repository |
| `npm run format:check` | Prettier in check mode, no writes |

## Content

No copy is hardcoded in a component. Everything lives in `src/content/` as typed modules — `profile.ts`, `experience.ts`, `projects.ts`, `skills.ts`, `education.ts` — re-exported through `index.ts`, with the shapes in `types.ts`.

To add a project, append an entry to the `seeds` array in `src/content/projects.ts`:

- **Required:** `slug` (URL-safe, becomes `/projects/<slug>`), `title`, `oneLiner`, `longDescription` (an array, one string per paragraph), `role`, `stack`, `highlights`, `status` (`active`, `complete` or `archived`), `featured`, `sensitive`, `domain`, and `repoUrl` / `liveUrl` — each either a URL or an explicit `null`, never an invented link.
- **Optional:** `period` (omit it when the dates are not known), `metrics` (label/value pairs).

`domain` is one of `retrieval`, `model`, `infra`, `verified` or `adversary`. It sets the hue of the row's edge bar and, with `status`, the colour of its status text. Experience entries and skill groups carry one too.

Three fields carry behaviour:

- **`searchText`** is the substrate the ranker reads. It is built by `searchTextFrom()` when the array is mapped, so it cannot drift from the item it describes. Do not write it by hand.
- **`sensitive: true`** removes a project from the index, from `generateStaticParams` and from the sitemap, and makes its route return 404. Client work that cannot be published in detail belongs in `experience.ts` at resume level of detail instead.

- **`resumeAvailable`** in `profile.ts` is `false` by default, which hides the résumé links in the footer and the contact section. To enable them, drop the file at `public/resume.pdf` and set the flag to `true`.

Facts that are not yet confirmed are written as the literal string `TODO:` followed by what is missing. The UI checks for that prefix and omits the field rather than printing it.

## Design decisions

- One type family, IBM Plex, with the monospace reserved for genuine data — dates, metrics, status — and never used as decoration.
- Design tokens over hardcoded values. No component contains a hex code; `globals.css` defines every colour. The single exception is `src/lib/og-theme.ts`, because the OG image renderer cannot read CSS custom properties.
- Colour encodes what something is, never decoration. Five hues on one flat chroma plane — retrieval, model, infra, verified, adversary — mark domains on row edges, stack entries, skill groups and status. While a query is active, each row's edge bar also shows how strongly it matched, with its score beside it on a fixed 0–1 scale: the page explains its own ranking.
- Hairline rules and whitespace instead of cards and shadows. The only shadow on the site is the focus ring.
- Motion appears only on page load and in response to a query: rows re-rank, and the similarity field lights up the items that matched. Nothing animates on scroll, and nothing animates on hover beyond a colour transition.
- `prefers-reduced-motion` is honoured throughout — the load sequence, the re-ranking transition, the similarity field and the cycling placeholder all settle into their final state instead.
- Colour pairs meet WCAG AA at their intended text sizes in both themes.

## Deployment

Vercel — import the repository and it builds on the defaults. There are no external services.

One environment variable must be set before deploying: `NEXT_PUBLIC_SITE_URL`, the absolute origin of the deployed site with no trailing slash. It feeds `metadataBase`, the sitemap, `robots.txt` and the JSON-LD `url`. Next inlines it at build time, so set it in the Vercel project settings, for Production and Preview, before the first build. Unset, a production build fails with an error rather than baking `http://localhost:3000` into social cards and crawler directives; `next dev` still falls back to localhost. CI supplies a placeholder value for its own build. `.env.example` documents it — copy it to `.env.local` for local work.

## License

MIT — see [LICENSE](LICENSE).
