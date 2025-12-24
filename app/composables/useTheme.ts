export const useTheme = () => {
  // Use cookie instead of localStorage for SSR compatibility
  const themeCookie = useCookie('theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  });

  const colorMode = computed({
    get: () => themeCookie.value,
    set: (val) => {
      themeCookie.value = val;
    }
  });

  // Determine effective theme (resolve 'system' to actual theme)
  const getEffectiveTheme = () => {
    if (themeCookie.value === 'system') {
      // On server, default to light; client will hydrate correctly
      if (import.meta.server) return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeCookie.value;
  };

  // Client-only DOM manipulation
  const applyTheme = () => {
    if (import.meta.client) {
      const effectiveTheme = getEffectiveTheme();
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (themeCookie.value === 'system') {
          applyTheme();
        }
      };
      mediaQuery.addEventListener('change', handleChange);
    }
  };

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    themeCookie.value = theme;
    applyTheme();
  };

  return {
    colorMode,
    updateTheme,
    initTheme: applyTheme,
    getEffectiveTheme
  };
};
