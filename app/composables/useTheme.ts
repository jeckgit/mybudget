export const useTheme = () => {
  const colorMode = useState('color-mode', () => 'system');

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.value = theme;
    if (import.meta.client) {
      localStorage.setItem('nuxt-color-mode', theme);
      applyTheme(theme);
    }
  };

  const applyTheme = (theme: string) => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('nuxt-color-mode') as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        colorMode.value = savedTheme;
      }
      applyTheme(colorMode.value);

      // Listen for system changes if preference is system
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (colorMode.value === 'system') {
          applyTheme('system');
        }
      });
    }
  };

  return {
    colorMode,
    updateTheme,
    initTheme
  };
};
