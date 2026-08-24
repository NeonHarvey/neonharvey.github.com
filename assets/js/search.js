/**
 * Harvey's IT Blog - Instant Search & Category Filtering JS Engine
 * Concurrency-safe, async-driven client-side blog post filter matching queries dynamically.
 */
(() => {
  let searchDatabase = null;
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

  // Load search.json asynchronously once the user starts typing to optimize page load times
  const fetchSearchDatabase = async () => {
    if (searchDatabase) return searchDatabase;
    try {
      const res = await fetch('/search.json');
      if (!res.ok) throw new Error('Failed to fetch search JSON indexes');
      searchDatabase = await res.json();
      return searchDatabase;
    } catch (err) {
      console.error('Error loading client side search indexes:', err);
      return [];
    }
  };

  // Performance Optimization: Pre-parse and cache card dataset attributes in lowercase
  // to avoid repeated getAttribute calls and string lowering on every keystroke.
  const cardDataCache = Array.from(postCards).map(card => ({
    element: card,
    category: (card.getAttribute('data-category') || '').toLowerCase(),
    title: (card.getAttribute('data-title') || '').toLowerCase(),
    tags: (card.getAttribute('data-tags') || '').toLowerCase(),
    excerpt: (card.getAttribute('data-excerpt') || '').toLowerCase()
  }));

  // Utility: Debounce function to limit execution rate of frequent input events
  const debounce = (fn, delay = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Perform search and category matching using cached data
  const applyFilters = () => {
    const q = activeQuery.trim().toLowerCase();
    const cat = activeCategory.trim().toLowerCase();
    let visibleCount = 0;

    cardDataCache.forEach(item => {
      // Check Category Match (case-insensitive comparison using lowercased category)
      const matchesCategory = (cat === 'all' || item.category === cat);

      // Check Search Term Match
      let matchesSearch = true;
      if (q !== '') {
        matchesSearch = item.title.includes(q) ||
                        item.tags.includes(q) ||
                        item.excerpt.includes(q) ||
                        item.category.includes(q);
      }

      // Display card if matches both criteria
      if (matchesCategory && matchesSearch) {
        item.element.style.display = 'flex';
        visibleCount++;
      } else {
        item.element.style.display = 'none';
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

  // Attach search input listeners with debouncing (~150ms) to avoid main-thread jank during rapid typing
  if (searchInput) {
    const debouncedFilter = debounce(async () => {
      await fetchSearchDatabase(); // Pre-fetch search database index inside debounced function
      applyFilters();
    }, 150);

    searchInput.addEventListener('input', (e) => {
      activeQuery = e.target.value;
      debouncedFilter();
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
