# Bolt's Journal

## 2025-08-10 - Empty Repository Discovered
**Learning:** Found that this repository is currently empty, containing only a README.md and no active application code. No performance bottleneck specific to this codebase's architecture could be identified or resolved since there are no source files.
**Action:** When working on empty repositories, verify if any submodules, branch structures, or hidden directories contain code first. If none exist, document the find and safely exit without introducing unnecessary changes.

## 2025-08-20 - DOM Thrashing & Search Debouncing Optimization
**Learning:** Client-side search and category filtering in static Jekyll sites can trigger frequent DOM thrashing and layout shifts when querying `getAttribute()` and calling `.toLowerCase()` on every keystroke across all DOM elements.
**Action:** Pre-cache DOM element references and lowercased string attributes upon script initialization (`cardCache`), and apply a light debounce (150ms) to live search input listeners to eliminate redundant main-thread processing.
