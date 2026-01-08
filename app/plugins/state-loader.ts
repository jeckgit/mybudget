export default defineNuxtPlugin((nuxtApp) => {
  // Wrap in runWithContext to ensure composables like useI18n work correctly in plugin
  return nuxtApp.runWithContext(() => {
    const { loadState } = useStorage();
    const user = useSupabaseUser();

    // Globally load state when user is authenticated
    watch(
      user,
      async (newUser) => {
        if (newUser) {
          await loadState();
        }
      },
      { immediate: true }
    );
  });
});
