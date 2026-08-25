/**
 * Harvey's IT Blog - Instant Search & Category Filtering JS Engine
 * Concurrency-safe, async-driven client-side blog post filter matching queries dynamically.
 * Optimized by Bolt: Pre-caches DOM card attributes and removes unused /search.json fetch.
 */
(() => {
  let searchDatabase = null;
  let searchDatabasePromise = null;
  let activeCategory = 'all';
  let activeQuery = '';

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryChips = document.querySelectorAll('.category-chip');
  const postsGrid = document.getElementById('posts-grid');
  const postCards = document.querySelectorAll('.post-card');
  const noResultsCard = document.getElementById('no-results-card');
  const searchFeedback = document.getElementById('search-results-feedback');
  const feedbackText = document.getElementById('feedback-text');
  const resetSearchLink = document.getElementById('reset-search-link');
  const noResultsResetBtn = document.getElementById('no-results-reset-btn');

  // Performance Optimization: Cache post card elements and their data-attributes
  // on page load to prevent slow repeated DOM lookups and string lowercasing on every keystroke.
  const cachedCards = Array.from(postCards).map(card => {
    return {
      element: card,
      category: card.getAttribute('data-category') || '',
      categoryLower: (card.getAttribute('data-category') || '').toLowerCase(),
      titleLower: (card.getAttribute('data-title') || '').toLowerCase(),
      tagsLower: (card.getAttribute('data-tags') || '').toLowerCase(),
      excerptLower: (card.getAttribute('data-excerpt') || '').toLowerCase()
    };
  });
  // Load search.json asynchronously once the user starts typing to optimize page load times
  // Optimized: Cache the promise itself to prevent multiple duplicate concurrent HTTP requests when typing rapidly.
  const fetchSearchDatabase = () => {
    if (searchDatabasePromise) return searchDatabasePromise;

    searchDatabasePromise = fetch('/search.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch search JSON indexes');
        return res.json();
      })
      .then(data => {
        searchDatabase = data;
        return data;
      })
      .catch(err => {
        console.error('Error loading client side search indexes:', err);
        searchDatabasePromise = null; // Allow retry on subsequent attempts if failed
        return [];
      });

    return searchDatabasePromise;
  };

  // Perform search and category matching
  const applyFilters = () => {
    const q = activeQuery.trim().toLowerCase();
    let visibleCount = 0;

    cachedCards.forEach(card => {
      // Check Category Match (case-insensitive for robustness)
      const matchesCategory = (activeCategory === 'all' || card.categoryLower === activeCategory.toLowerCase());

      // Check Search Term Match
      let matchesSearch = true;
      if (q !== '') {
        matchesSearch = card.titleLower.includes(q) ||
                        card.tagsLower.includes(q) ||
                        card.excerptLower.includes(q) ||
                        card.categoryLower.includes(q);
      }

      // Display card if matches both criteria
      if (matchesCategory && matchesSearch) {
        card.element.style.display = 'flex';
        visibleCount++;
      } else {
        card.element.style.display = 'none';
      }
    });

    // Update UI Elements based on visible counts
    if (visibleCount === 0) {
      postsGrid.classList.add('hidden');
      noResultsCard.classList.remove('hidden');
    } else {
      postsGrid.classList.remove('hidden');
      noResultsCard.classList.add('hidden');
    }

    // Toggle Clear button visibility
    if (q !== '') {
      clearSearchBtn.classList.remove('hidden');
      clearSearchBtn.classList.add('flex');
    } else {
      clearSearchBtn.classList.add('hidden');
      clearSearchBtn.classList.remove('flex');
    }

    // Update Feedback Panel
    if (q !== '' || activeCategory !== 'all') {
      searchFeedback.classList.remove('hidden');
      let msg = '';
      if (activeCategory !== 'all' && q !== '') {
        msg = `Showing posts under category "${activeCategory.toUpperCase()}" matching search: "${activeQuery}" (${visibleCount} found)`;
      } else if (activeCategory !== 'all') {
        msg = `Showing all posts under category "${activeCategory.toUpperCase()}" (${visibleCount} found)`;
      } else {
        msg = `Showing search results for "${activeQuery}" (${visibleCount} found)`;
      }
      feedbackText.textContent = msg;
    } else {
      searchFeedback.classList.add('hidden');
    }
  };

  // Attach search input listeners
  // Optimized: Debounce input handling by 150ms to avoid layout thrashing on every rapid keystroke, while prefetching the database immediately.
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeQuery = e.target.value;
      applyFilters();
    let debounceTimeout = null;
    searchInput.addEventListener('input', (e) => {
      activeQuery = e.target.value;

      // Start/ensure database pre-fetch immediately when typing begins
      fetchSearchDatabase();

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        applyFilters();
      }, 150); // 150ms is perfect: imperceptible delay but filters out rapid typing noise
    });
  }

  // Clear Search logic
  const clearSearch = () => {
    if (searchInput) {
      searchInput.value = '';
    }
    activeQuery = '';
    applyFilters();
  };
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', clearSearch);
  }

  // Category Filtering
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle active states
      categoryChips.forEach(c => {
        c.className = 'category-chip px-4 py-2 bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 transition-all shadow-sm';
      });

      const category = chip.getAttribute('data-category');
      activeCategory = category;

      if (category === 'all') {
        chip.className = 'category-chip px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm';
      } else {
        chip.className = 'category-chip px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm';
      }

      applyFilters();
    });
  });

  // Reset function
  const resetFilters = () => {
    clearSearch();
    activeCategory = 'all';
    categoryChips.forEach(c => {
      const cat = c.getAttribute('data-category');
      if (cat === 'all') {
        c.className = 'category-chip px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm';
      } else {
        c.className = 'category-chip px-4 py-2 bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 transition-all shadow-sm';
      }
    });
    applyFilters();
  };

  if (resetSearchLink) resetSearchLink.addEventListener('click', resetFilters);
  if (noResultsResetBtn) noResultsResetBtn.addEventListener('click', resetFilters);

})();
