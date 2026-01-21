export const useAppSync = () => {
  const user = useSupabaseUser();
  const profileStore = useProfileStore();
  const txStore = useTransactionsStore();
  const catStore = useCategoriesStore();
  const monthStore = useMonthsStore();

  const isInitialLoading = useState<boolean>('app-initial-loading', () => false);
  const loadingPromise = useState<Promise<void> | null>('app-loading-promise', () => null);

  const initApp = async (force = false) => {
    if (!user.value) return;

    // Skip if already loaded (unless forced)
    if (!force && profileStore.isLoaded.value && txStore.isLoaded.value) {
      return;
    }

    if (loadingPromise.value) return loadingPromise.value;

    const loadTask = async () => {
      isInitialLoading.value = true;
      try {
        // Load everything in parallel
        await Promise.all([
          profileStore.loadProfile(),
          txStore.loadTransactions(),
          catStore.loadCategories(),
          monthStore.loadMonths()
        ]);
      } catch (e) {
        console.error('[useAppSync] Failed to initialize app data:', e);
      } finally {
        isInitialLoading.value = false;
        loadingPromise.value = null;
      }
    };

    loadingPromise.value = loadTask();
    return loadingPromise.value;
  };

  const clearAllData = async () => {
    isInitialLoading.value = true;
    try {
      await Promise.all([
        txStore.clearTransactions(),
        catStore.clearCategories()
        // Reset profile defaults
      ]);
      await profileStore.updateConfig({
        monthlyLimit: 0,
        onboardingComplete: false,
        income: 0,
        fixedCosts: 0,
        fixedCostDetails: []
      });
    } catch (e) {
      console.error('[useAppSync] Failed to clear app data:', e);
    } finally {
      isInitialLoading.value = false;
    }
  };

  return {
    isInitialLoading,
    initApp,
    clearAllData
  };
};
