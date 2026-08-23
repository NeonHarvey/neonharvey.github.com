# Bolt's Journal

## 2026-08-23 - DOM Metadata Caching and Case Sensitivity in Category Filters
**Learning:** Pre-caching DOM card attributes (title, excerpt, category, tags) into an in-memory array prevents layout thrashing during client-side search filtering. However, when normalizing cached metadata to lowercase for fast substring matching, category filters set by UI elements (e.g. chips) must also be lowercased at check time (`activeCategory.toLowerCase()`) to avoid case mismatch regressions.
**Action:** Always ensure that normalized cached attributes are compared against similarly normalized dynamic state filters.

## 2025-08-10 - Empty Repository Discovered
**Learning:** Found that this repository is currently empty, containing only a README.md and no active application code. No performance bottleneck specific to this codebase's architecture could be identified or resolved since there are no source files.
**Action:** When working on empty repositories, verify if any submodules, branch structures, or hidden directories contain code first. If none exist, document the find and safely exit without introducing unnecessary changes.
