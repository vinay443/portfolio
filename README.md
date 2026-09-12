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

**This is lexical scoring, not semantic search.** There are no embeddings and no vector index in this repository. A query for "retrieval" will not match "RAG" unless that word actually appears in the text. The limitation is deliberate: the corpus is about thirty items, and an exact-match scorer is the honest tool at that size.

1. **Tokenization.** The query is lowercased, punctuation is stripped, and stopwords (`a`, `an`, `the`, `and`, `or`, `of`, `in`, `on`, `for`, `with`, `to`, `is`, `at`) are dropped. `+` and `#` survive so `c++` stays one token, while `/` is treated as a separator so `kafka/redpanda` indexes as two.

2. **Field-weighted scoring.** Every item carries a precomputed `searchText` field — its title, role, description, bullets and tags, lowercased and concatenated. Per token: `+3` for a whole-word match in the title or role, `+2` for a match against a tag or stack entry, `+1` for a substring match anywhere in `searchText`, and `+0.5` when a token of three or more characters is a prefix of a longer word. The signals stack, so a token that hits the title also earns the substring point.

3. **Normalization.** The total is divided by the token count, so a long query cannot outscore a short one merely by having more terms.

4. **Stable tie-breaking.** Items sort by score descending, and ties fall back to the original array index. Equal-scoring items never shuffle between keystrokes.

5. **Empty-query default.** A query with no usable tokens returns every item in its authored order with a score of zero — featured projects first. A query of nothing but stopwords is treated as no search at all, rather than as a search that matches everything.

Skills, education and certifications are scored but never removed: a group that does not match dims instead of disappearing, because it is the context the matches sit in.

## Stack

| Technology | Why |
| --- | --- |
| Next.js 16 (App Router) | Server components keep the content in the initial HTML, which is what makes the no-JavaScript path work. |
| TypeScript (strict, `noUncheckedIndexedAccess`) | The content layer is typed at its source, so a missing project field is a compile error rather than a blank space. |
| Tailwind CSS v4 | CSS-first theming: every token is a custom property in `globals.css`, and `.dark` redefines the same names. |
| Motion | Layout animation for the re-ranking transition — the one interaction on the site worth animating. |
| next-themes | System, light and dark without a flash of the wrong theme on load. |
| lucide-react | Consistent icon set, tree-shaken, no icon font to load. |
| GitHub Actions | Lint and build on every push and pull request. |

## Project structure

```
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
└── lib/
    ├── search.ts               Tokenizer and ranking function (pure)
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
