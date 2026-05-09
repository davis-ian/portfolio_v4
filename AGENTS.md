# AGENTS.md — Portfolio (Astro)

Coding and architecture standards for the iandavis.dev portfolio rewrite. All contributors and AI agents must follow these before writing or modifying any code.

---

## Stack

- **Framework:** Astro 5.x (static output by default, SSR opt-in per route if needed)
- **Interactivity:** Vue 3 islands only where genuine client-side state is required
- **Styling:** Scoped `<style>` blocks per component; global tokens in `src/styles/global.css`
- **Language:** TypeScript strict mode throughout
- **Deployment:** Netlify (static build, no adapter unless SSR route is added)

---

## Core Philosophy

Astro's contract is: **HTML by default, JavaScript by exception.** Every decision should be made through that lens.

- If a component has no client-side state or interactivity, it is an `.astro` component. Not Vue, not React.
- If a component needs reactivity, it is a Vue component used as an island with the appropriate `client:*` directive.
- Never reach for a `client:load` island when `client:visible` or `client:idle` would do. Hydration has a cost; pay it as late as possible.
- Never wrap static content in a Vue component just because it feels familiar. Familiarity is not a reason.

The goal stated in Astro's own docs applies here verbatim: it should be nearly impossible to build a slow page.

---

## Project Structure

```
src/
  components/       # Reusable .astro components (and .vue islands)
  layouts/          # Page shell layouts (BaseLayout.astro, etc.)
  pages/            # File-based routes — one file per route
  styles/           # global.css with CSS custom properties only
  content/          # Content collections (projects, etc.) — type-safe via Astro schema
public/             # Static assets copied as-is (fonts, favicon, og image)
astro.config.mjs
tsconfig.json
```

No exceptions to this structure without updating this file.

---

## Component Rules

### .astro components

- Use for all layout, structural, and presentational UI with no client-side interactivity.
- Props must be typed with a TypeScript `interface Props` declared in the frontmatter.
- Use scoped `<style>` blocks. Never use `is:global` unless applying a root-level reset or token.
- Prefer CSS custom properties (`var(--token)`) over hardcoded values.
- Do not co-locate business logic in the frontmatter. Extract utility functions to `src/utils/`.

```astro
---
interface Props {
  title: string;
  href: string;
  description?: string;
}
const { title, href, description } = Astro.props;
---
<a href={href} class="card">
  <h3>{title}</h3>
  {description && <p>{description}</p>}
</a>
<style>
  .card { ... }
</style>
```

### Vue islands

- Use only when the component requires client-side reactivity (toggle state, form interaction, animated counter, etc.).
- File naming: `ComponentName.vue`, PascalCase, same as `.astro` components.
- Always specify the least-eager hydration directive that still works:
  - `client:visible` — default for below-the-fold islands
  - `client:idle` — acceptable for low-priority UI loaded after page is interactive
  - `client:load` — only for islands that must be interactive on first paint (rare)
  - `client:only="vue"` — only when the component cannot be server-rendered at all
- Do not use Vuex or Pinia. If an island needs state, keep it local. If two islands need shared state, reconsider whether they should be one island or whether the state belongs in the URL/page.

---

## TypeScript

- Extend `astro/tsconfigs/strict` — no relaxing of strict flags.
- Use `import type` for type-only imports (`import type { CollectionEntry } from 'astro:content'`).
- All props interfaces are named `Props` and declared in the component frontmatter, not in a separate file unless shared.
- No `any`. If you are reaching for `any`, the type model is wrong.

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@utils/*": ["src/utils/*"],
      "@content/*": ["src/content/*"]
    },
    "verbatimModuleSyntax": true
  }
}
```

---

## Styling

- Global CSS lives in `src/styles/global.css` and contains **only** CSS custom properties (design tokens) and a base reset. No utility classes, no component styles.
- Component styles live in scoped `<style>` blocks. Low-specificity selectors (`h2 {}`, `p {}`) are fine inside scoped blocks — Astro compiles them safely.
- Do not use Tailwind. The site is small enough that utility-class overhead is noise, not signal.
- Dark mode via `prefers-color-scheme` media query on `:root` token overrides. No JS-toggled theme.
- Do not hardcode colors, spacing, or font sizes. Every value comes from a CSS custom property.

```css
/* global.css */
:root {
  --color-bg: #0a0a0a;
  --color-text: #e8e8e8;
  --color-accent: #4af;
  --font-sans: "Your Font", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
}
```

---

## Content Collections

- Projects are defined as a content collection with a Zod schema. No hardcoded project data in component props or page files.
- Every project entry must include: `title`, `slug`, `description`, `tags`, `metrics` (the impact number/statement), `repoUrl`, `order`.
- Optional: `demoUrl`, `caseStudy` (MDX file reference for the long-form write-up).

```ts
// src/content/config.ts
import { z, defineCollection } from "astro:content";

const projects = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    metrics: z.string(), // e.g. "20 min → under 2 min render time"
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    order: z.number(),
  }),
});

export const collections = { projects };
```

---

## Performance Rules

These are non-negotiable. The portfolio must score 100 on Lighthouse performance on every page.

- **Images:** Always use `<Image>` from `astro:assets`. Always set `format="webp"`, `loading="lazy"` (except hero/LCP image which gets `loading="eager"`), and meaningful `alt` text.
- **Fonts:** Self-host all fonts in `public/fonts/`. Use `font-display: swap`. Preload the primary font face in `<head>`.
- **No layout shift:** All images must have explicit `width` and `height` or known aspect ratios.
- **No render-blocking scripts:** No `<script>` tags in `<head>` without `defer` or `type="module"`.
- **Inline critical CSS:** If a layout's above-the-fold styles are small, use `is:inline` to inline them rather than a stylesheet import.

---

## SEO

- Every page must define `title`, `description`, and Open Graph tags via the `BaseLayout` props.
- `BaseLayout.astro` owns the `<head>` — no page should write its own `<head>` tags outside of the layout slot.
- `robots.txt` and `sitemap.xml` are generated via `@astrojs/sitemap`. Do not hand-edit either.
- Canonical URL is set from `Astro.url` — never hardcoded.

---

## Naming Conventions

| Thing                      | Convention           | Example                                |
| -------------------------- | -------------------- | -------------------------------------- |
| Astro components           | PascalCase           | `ProjectCard.astro`                    |
| Vue islands                | PascalCase           | `ContactForm.vue`                      |
| Pages                      | kebab-case           | `about.astro`, `projects/[slug].astro` |
| CSS custom properties      | `--kebab-case`       | `--color-accent`                       |
| Utility functions          | camelCase            | `formatDate.ts`                        |
| Content collection entries | kebab-case filenames | `render-engine.json`                   |

---

## What Not to Do

- Do not add a JS framework integration (React, Svelte, etc.) without a concrete reason. Vue is already available for islands.
- Do not use `client:only` as a default — it skips server rendering entirely and loses SEO and initial paint benefits.
- Do not add an npm package to solve a problem that 10 lines of vanilla JS or CSS would solve.
- Do not store page content as hardcoded strings in `.astro` files. Content goes in collections.
- Do not use `any` in TypeScript.
- Do not use `!important` in CSS.
- Do not put business logic in page frontmatter. Pages fetch and pass data; utility functions do the work.
