# Astro Rewrite Plan (No UI Changes)

This plan migrates the current portfolio from static HTML to Astro while preserving the existing design, UI, copy, behavior, and public URLs. It follows `AGENTS.md` standards and prioritizes performance, page load time, and zero layout instability (including FOUT and image/video-induced shift).

## Scope and Guarantees

- Migrate as-is with no intentional visual or UX redesign.
- Preserve existing external URL expectations by keeping equivalent project routes, including `ffmpeg-wa`.
- Maintain current interactions (sidebar toggle, keyboard shortcuts, command palette, hash navigation, resume/email actions).
- Enforce strict performance practices: minimal client JS, stable media dimensions, and font loading strategy to reduce FOUT/CLS.

## Target Routes

- `/` (from `index.html`)
- `/projects/forma` (from `projects/forma.html`)
- `/projects/media-toolkit` (from `projects/media-toolkit.html`)
- `/projects/upnext` (from `projects/upnext.html`)
- `/projects/callsign` (from `projects/callsign.html`)
- `/projects/minigames` (from `projects/minigames.html`)
- `/projects/ffmpeg-wa` (from `projects/ffmpeg-wa.html`)

## File-by-File Implementation Checklist

- [ ] **Scaffold Astro + TS strict**
  - Create `package.json` scripts (`dev`, `build`, `preview`, `check`)
  - Create `astro.config.mjs` (static output, Netlify-friendly, sitemap integration)
  - Create `tsconfig.json` extending `astro/tsconfigs/strict` with AGENTS path aliases

- [ ] **Create required structure**
  - `src/pages/`
  - `src/layouts/`
  - `src/components/`
  - `src/styles/`
  - `src/content/projects/`
  - `src/content/config.ts`
  - `src/utils/`
  - `public/` (assets copied from current root-level static files)

- [ ] **Move static assets without URL breakage**
  - Keep publicly served assets in `public/`:
    - `favicon.ico`
    - `social-preview.png`
    - `iandavis_resume2026.pdf`
    - `videos/optimized/*`
    - `fonts/*`
    - `images/optimized/*` (if preserving existing URL paths used in markup)
  - Preserve external URL expectations for all project route slugs

- [ ] **Global stylesheet split per AGENTS**
  - Create `src/styles/global.css` with:
    - token variables (colors, spacing, type scale)
    - base reset only
    - font-face declarations (self-hosted)
  - Remove component/page-specific rules from global file

- [ ] **Base layout and SEO head**
  - Create `src/layouts/BaseLayout.astro` with typed `Props`:
    - `title`, `description`, optional OG/Twitter image/title/desc
  - Implement canonical from `Astro.url`
  - Add preload links for critical self-hosted font faces
  - Add favicon and shared meta tags
  - Ensure no page writes custom head outside layout

- [ ] **Shared structural components (UI parity)**
  - `src/components/MobileMenuButton.astro`
  - `src/components/Sidebar.astro`
  - `src/components/Breadcrumbs.astro`
  - `src/components/StatusBar.astro`
  - `src/components/CommandPalette.astro`
  - Keep existing class names/DOM structure where possible to avoid visual drift
  - Move inline styles into each component’s scoped `<style>`

- [ ] **Homepage migration**
  - `src/pages/index.astro` from current `index.html`
  - Preserve section IDs and hash anchors:
    - `hero`, `featured`, `work`, `about`, `experience`, `contact`
  - Keep keyboard hints/status UI unchanged visually
  - Keep all existing copy as-is

- [ ] **Project route migration (as-is URLs preserved)**
  - `src/pages/projects/forma.astro`
  - `src/pages/projects/media-toolkit.astro`
  - `src/pages/projects/upnext.astro`
  - `src/pages/projects/callsign.astro`
  - `src/pages/projects/minigames.astro`
  - `src/pages/projects/ffmpeg-wa.astro`
  - Preserve same visual content blocks and nav patterns per page

- [ ] **Content collections for projects (no UI change)**
  - `src/content/config.ts` project schema per AGENTS
  - Data files:
    - `src/content/projects/forma.json`
    - `src/content/projects/media-toolkit.json`
    - `src/content/projects/upnext.json`
    - `src/content/projects/callsign.json`
    - `src/content/projects/minigames.json`
    - `src/content/projects/ffmpeg-wa.json`
  - Wire homepage “Selected Works” and sidebar project list from collection data
  - Keep order and wording aligned with current site

- [ ] **Image migration with CLS protection**
  - Replace raw `<img>/<picture>` where practical with `astro:assets` `<Image>`
  - Ensure explicit `width`/`height` on every image
  - Keep `loading="lazy"` for non-LCP media
  - Use `format="webp"` default per AGENTS (or keep existing multi-format where required for exact parity, then verify)

- [ ] **Video/layout stability**
  - Keep explicit aspect ratio containers for demo video blocks
  - Maintain `preload="metadata"` and current autoplay/muted/loop behavior where present
  - Ensure no layout jump before media load

- [ ] **JS behavior migration (no framework islands by default)**
  - Port `js/main.js` logic into module(s), e.g.:
    - `src/scripts/navigation.ts`
    - `src/scripts/command-palette.ts`
    - `src/scripts/actions.ts`
    - `src/scripts/init.ts`
  - Replace inline `onclick` with event listeners
  - Preserve:
    - folder toggles
    - command palette and shortcuts
    - status updates
    - resume/email actions
    - hash navigation

- [ ] **Sitemap + robots**
  - Configure `@astrojs/sitemap`
  - Keep robots behavior equivalent to current `robots.txt`
  - Avoid hand-maintained sitemap output

- [ ] **Netlify config update**
  - Update `netlify.toml` build publish directory for Astro output (`dist`)
  - Keep/improve cache headers for fonts/images/videos/static assets
  - Retain security header(s) already present

- [ ] **Parity QA pass**
  - Route-by-route visual compare:
    - `/`
    - `/projects/forma`
    - `/projects/media-toolkit`
    - `/projects/upnext`
    - `/projects/callsign`
    - `/projects/minigames`
    - `/projects/ffmpeg-wa`
  - Verify desktop + mobile behavior and sidebar/menu interactions

- [ ] **Performance + FOUT/CLS validation**
  - Lighthouse per route (focus CLS/LCP/TTI)
  - Confirm no font-induced layout shift
  - Confirm no image/video-induced layout shift
  - Confirm JS payload only where needed

## Suggested Build Order

1. Foundation (`astro.config.mjs`, `tsconfig.json`, `BaseLayout.astro`, `global.css`)
2. Shared components + homepage
3. One project template migration, then fan out all project routes
4. Content collection wiring
5. JS module cleanup + inline handler removal
6. Performance/SEO/Netlify hardening
7. Final parity + Lighthouse audit

## Acceptance Criteria

- No intentional UI/design changes vs current HTML site.
- All listed routes resolve and preserve content/behavior.
- No obvious CLS during load/scroll/media reveal.
- Font loading avoids disruptive FOUT and metric shifts.
- Pages remain mostly static HTML with JS by exception.
- Lighthouse performance remains top-tier with strong Core Web Vitals.
