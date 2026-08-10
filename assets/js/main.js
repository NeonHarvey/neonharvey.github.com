/**
 * Harvey's IT Blog - Global Application Controller
 * Handles Dark/Light theme toggle persistence, Mobile Navigation Menu drawer, and Scroll-to-Top animations.
 */
(() => {
  // --- Dark Mode Toggling Persistence ---
  const desktopToggle = document.getElementById('theme-toggle-desktop');
  const mobileToggle = document.getElementById('theme-toggle-mobile');

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
  if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);


  // --- Mobile Hamburger Menu Drawer ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      if (mobileMenu.classList.contains('hidden')) {
        menuIcon.className = 'fa-solid fa-bars text-xl';
      } else {
        menuIcon.className = 'fa-solid fa-xmark text-xl';
      }
    });
  }


  // --- Dynamic Scroll to Top Animation Trigger ---
  const scrollTopBtn = document.getElementById('scroll-to-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        scrollTopBtn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        scrollTopBtn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        scrollTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
