export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Safe load from localStorage - defaults to light theme
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('voltkart_theme_v2') || 'light';
  } catch (e) {
    console.warn('localStorage access failed:', e);
  }

  document.documentElement.setAttribute('data-theme', savedTheme);

  if (!themeToggle) return;

  themeToggle.addEventListener('click', (event) => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // If browser supports View Transitions API with circular reveal
    if (document.startViewTransition) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        applyTheme(newTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 550,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      applyTheme(newTheme);
    }
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('voltkart_theme_v2', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
    // Dispatch event so Three.js or canvas can adapt lighting
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
}
