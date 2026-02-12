import type { BudgetConfig } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

const DEFAULT_CONFIG: BudgetConfig = {
  monthlyLimit: 0,
  currency: 'EUR',
  onboardingComplete: false,
  language: 'en',
  theme: 'system',
  showRollover: false
};

export const useProfileStore = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { $i18n } = useNuxtApp();
  const { setLocale, locale } = $i18n as any;

  const config = useState<BudgetConfig>('profile-config', () => DEFAULT_CONFIG);
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

      if (!profile) {
        // Initialize new profile if not found
        const { data: newProfile, error: pError } = await client
          .from('profiles')
          .upsert(
            {
              user_id: user.value.sub,
              currency: 'EUR',
              onboarding_complete: false,
              language: 'en',
              theme: 'system',
              show_rollover: false
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single();

        if (pError) throw pError;
        if (newProfile) setProfileFromDb(newProfile);
      } else {
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
      language: dbProfile.language || 'en',
      theme: dbProfile.theme || 'system',
      income: Number(dbProfile.income || 0),
      fixedCosts: Number(dbProfile.fixed_costs || 0),
      fixedCostDetails: (dbProfile.fixed_cost_details as any) || [],
      showRollover: dbProfile.show_rollover || false
    };
  };

  const updateConfig = async (partialConfig: Partial<BudgetConfig>) => {
    if (!user.value?.sub) return false;

    // Optimistically update local state
    const previousConfig = { ...config.value };
    config.value = { ...config.value, ...partialConfig };

    try {
      const { error } = await client.from('profiles').upsert({
        user_id: user.value.sub,
        monthly_limit: config.value.monthlyLimit,
        currency: config.value.currency,
        onboarding_complete: config.value.onboardingComplete,
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

  return {
    config,
    isLoaded,
    loadProfile,
    updateConfig
  };
};
