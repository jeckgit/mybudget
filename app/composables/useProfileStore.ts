import type { BudgetConfig } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

const getInitialConfig = (currentLocale: string): BudgetConfig => ({
  monthlyLimit: 0,
  currency: 'EUR',
  onboardingComplete: false,
  emailVerifiedAt: null,
  language: currentLocale || 'en',
  theme: 'system',
  showRollover: false
});

export const useProfileStore = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { $i18n } = useNuxtApp();
  const { setLocale, locale } = $i18n as any;

  const config = useState<BudgetConfig>('profile-config', () => getInitialConfig(locale.value));
  const isLoaded = useState<boolean>('profile-loaded', () => false);

  // Sync i18n locale with state language
  watch(
    () => config.value.language,
    (newLang) => {
      if (newLang && newLang !== locale.value) {
        setLocale(newLang);
      }
    },
    { immediate: true }
  );

  const loadProfile = async () => {
    if (!user.value?.sub) return;

    try {
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', user.value.sub)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setProfileFromDb(profile);
      }
      isLoaded.value = true;
    } catch (e) {
      console.error('[useProfileStore] Failed to load profile:', e);
    }
  };

  const setProfileFromDb = (dbProfile: any) => {
    config.value = {
      monthlyLimit: Number(dbProfile.monthly_limit || 0),
      currency: dbProfile.currency || 'EUR',
      onboardingComplete: dbProfile.onboarding_complete || false,
      emailVerifiedAt: dbProfile.email_verified_at || null,
      language: dbProfile.language || 'en',
      theme: dbProfile.theme || 'system',
      income: Number(dbProfile.income || 0),
      fixedCosts: Number(dbProfile.fixed_costs || 0),
      fixedCostDetails: (dbProfile.fixed_cost_details as any) || [],
      showRollover: dbProfile.show_rollover || false
    };
  };

  const updateConfig = async (partialConfig: Partial<BudgetConfig>) => {
    // Optimistically update local state (handles guest state too)
    const previousConfig = { ...config.value };
    config.value = { ...config.value, ...partialConfig };

    if (!user.value?.sub) return true;

    try {
      const { error } = await client.from('profiles').upsert({
        user_id: user.value.sub,
        monthly_limit: config.value.monthlyLimit,
        currency: config.value.currency,
        onboarding_complete: config.value.onboardingComplete,
        email_verified_at: config.value.emailVerifiedAt,
        theme: config.value.theme,
        language: config.value.language,
        income: config.value.income,
        fixed_costs: config.value.fixedCosts,
        fixed_cost_details: config.value.fixedCostDetails as any,
        show_rollover: config.value.showRollover
      });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[useProfileStore] Failed to update config:', e);
      // Rollback on error
      config.value = previousConfig;
      return false;
    }
  };

  const resetProfileState = () => {
    config.value = getInitialConfig(locale.value);
    isLoaded.value = false;
  };

  return {
    config,
    isLoaded,
    loadProfile,
    updateConfig,
    resetProfileState
  };
};
