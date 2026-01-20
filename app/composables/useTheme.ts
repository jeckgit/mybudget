export const useTheme = () => {
  const colorMode = useColorMode();

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.preference = theme;
  };

  // No-op as @nuxtjs/color-mode handles initialization
  const initTheme = () => {};

  const getEffectiveTheme = () => {
    return colorMode.value;
  };

  return {
    colorMode: computed({
      get: () => colorMode.preference,
      set: (val) => {
        colorMode.preference = val;
      }
    }),
    updateTheme,
    initTheme,
    getEffectiveTheme
  };
};
