# Portfolio Improvements Plan

## Current Status
- Phase 1: Hash-based navigation for breadcrumbs (IN PROGRESS)
- Phase 2: Command palette "Go Back" verification (ALREADY IMPLEMENTED)
- Phase 3: Readability improvements (PENDING USER INPUT)

## Phase 1: Breadcrumb Navigation
**Problem**: Breadcrumbs on project pages link to `../index.html#section` but hash navigation doesn't scroll smoothly on arrival.

**Solution**: Add `handleHashNavigation()` function to `js/main.js` that:
1. Detects URL hash on page load
2. Smooth scrolls to the section
3. Updates active states in sidebar
4. Updates status bar

**Status**: ✅ COMPLETE - Implemented handleHashNavigation() in js/main.js

## Phase 2: Command Palette "Go Back"
**Status**: ✅ COMPLETE (with bug fix)

**Bug Found & Fixed**: The "Go Back" command existed but wasn't appearing because the CommandPalette initialized before the COMMANDS array was modified on project pages.

**Fix Applied**:
- Added `refreshCommands()` method to CommandPalette class in `js/main.js`
- Updated all 5 project pages to call `commandPalette.refreshCommands()` after modifying COMMANDS

All project pages now correctly show the "Go Back" command:
- `forma.html`
- `upnext.html`
- `callsign.html`
- `minigames.html`
- `ffmpeg-wa.html`

Command: `{ id: 'back', label: 'Go back to portfolio', action: () => window.location.href = '../index.html', category: 'Navigation', key: 'B' }`

## Phase 3: Readability Improvements
**Status**: Awaiting user preference

Options:
- A: Increase contrast on text colors
- B: Add "Readable Mode" toggle
- C: Increase font sizes and line-height
- D: Light theme variant

## Completed Work
- ✅ Phase 1: Implemented `handleHashNavigation()` in `js/main.js`
- ✅ Phase 2: All 5 project pages have working "Go Back" commands

## Next Steps
1. Gather user preference for Phase 3 readability approach
2. Implement chosen readability improvements

## Notes
- Terminal theme may have insufficient contrast for some users
- Consider testing on different screens/devices
- Keep the code/system aesthetic while improving accessibility

---

# TODO: Recruiter Recommended Upgrades

## Priority 1: CRITICAL
- [ ] Add Loading Performance Metrics section (Lighthouse scores, Core Web Vitals)
- [x] Update status bar: Change "NORMAL" to "INSERT" when command palette opens (with teal color)
- [x] Fix NaN position on homepage when scrollHeight equals viewport
- [x] Add dynamic page size calculation for project pages (actual KB based on HTML content)

## Recent Fixes
- **Status Bar Mode**: Now shows "INSERT" in teal when command palette is open, "NORMAL" in peach when closed
- **Homepage Position**: Fixed NaN error when page fits exactly in viewport (now shows "1:1")
- **Project Page Size**: KB values now calculated from actual HTML document size using `new Blob([document.documentElement.outerHTML]).size`

## Priority 2: HIGH
- [ ] Add interactive project demos (embed playable previews)
- [ ] Add "View Source" buttons linking to GitHub repos
- [ ] Add code samples with syntax highlighting
- [ ] Add testimonials/social proof section

## Priority 3: MEDIUM
- [ ] Add "Latest Writing" section (blog posts)
- [ ] Create visual skills matrix with proficiency levels
- [ ] Add Dark/Light mode toggle
- [ ] Add "Portfolio Stats" dashboard (visitor counts, etc.)

## Priority 4: LOW (Quick Wins)
- [ ] Add Open Graph images for better social sharing
- [ ] Create project READMEs with architecture diagrams
- [ ] Add "Now" page (current work in progress)
- [ ] Include downloadable case study PDF
- [ ] Add subtle scroll animations
- [ ] Add 404 page matching the terminal theme
- [ ] Add privacy policy (if using analytics)

## Content Strategy
- [ ] Replace "About" with "What I Do" (Architecture, Performance, DX)
- [ ] Add "Currently Learning" section
- [ ] Upgrade Contact section with "Schedule a Call" CTA
- [ ] Improve Project Cards with live preview GIFs
- [ ] Add mobile gesture hints (command palette hint hidden on mobile)
