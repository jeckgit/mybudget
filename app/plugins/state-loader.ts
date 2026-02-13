export default defineNuxtPlugin((nuxtApp) => {
  // Wrap in runWithContext to ensure composables like useI18n work correctly in plugin
  return nuxtApp.runWithContext(() => {
    const { initApp, resetLocalState } = useAppSync();
    const user = useSupabaseUser();

    // Reset stale state whenever the auth user changes, then load fresh data.
    watch(
      () => user.value?.sub,
      async (newUserId, oldUserId) => {
        if (newUserId !== oldUserId) {
          resetLocalState();
        }

        if (newUserId) {
          await initApp(true);
        }
      },
      { immediate: true }
    );
  });
});
