import type { AppState, Transaction, MonthData } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

const DEFAULT_STATE: AppState = {
  transactions: [],
  categories: [],
  months: {},
  config: {
    monthlyLimit: 0,
    currency: 'EUR',
    onboardingComplete: false
  }
};

let globalLoadingPromise: Promise<void> | null = null;

export const useStorage = () => {
  const { $i18n } = useNuxtApp();
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { t, setLocale, locale } = $i18n as any;
  const state = useState<AppState>('app-state', () => DEFAULT_STATE);
  const { seedDefaultCategories } = useCategories();

  // Sync i18n locale with state language
  watch(
    () => state.value.config.language,
    (newLang) => {
      if (newLang && newLang !== locale.value) {
        setLocale(newLang);
      }
    },
    { immediate: true }
  );

  // Track if state has been loaded for the current user
  const isLoaded = useState<string | null>('budget-loaded-user', () => null);

  const loadState = async (force = false) => {
    if (!user.value?.sub) {
      state.value = { ...DEFAULT_STATE };
      isLoaded.value = null;
      return;
    }

    // Skip if already loaded for this user (unless forced)
    if (!force && isLoaded.value === user.value.sub) {
      return;
    }

    // Return existing promise if loading is already in progress to prevent duplicate requests
    if (globalLoadingPromise) {
      return globalLoadingPromise;
    }

    const loadTask = async () => {
      try {
        // Load Data in Parallel
        const [
          { data: profile, error: profileError },
          { data: transactions, error: txError },
          { data: categories, error: catError },
          { data: monthsData, error }
        ] = await Promise.all([
          client.from('profiles').select('*').eq('user_id', user.value!.sub).maybeSingle(),
          client.from('transactions').select('*').eq('user_id', user.value!.sub).order('date', { ascending: false }),
          client.from('categories').select('*').eq('user_id', user.value!.sub),
          client.from('months').select('*').eq('user_id', user.value!.sub)
        ]);

        if (profileError) console.error('Error loading profile:', profileError);
        if (txError) console.error('Error loading transactions:', txError);
        if (catError) console.error('Error loading categories:', catError);

        if (error) console.error('Error loading months:', error);

        let finalProfile = profile;
        let finalCategories = categories || [];

        // INITIALIZATION FOR NEW USERS
        // If no profile found, create one with defaults
        if (!finalProfile) {
          const { data: newProfile, error: pError } = await client
            .from('profiles')
            .upsert(
              {
                user_id: user.value!.sub,
                currency: 'EUR',
                onboarding_complete: false,
                language: 'en',
                theme: 'system'
              },
              { onConflict: 'user_id' }
            )
            .select()
            .single();

          if (pError) console.error('Error initializing profile:', pError);
          if (newProfile) finalProfile = newProfile;
        }

        // If no categories found, seed them automatically
        if (finalCategories.length === 0) {
          await seedDefaultCategories();

          // Reload categories after seeding to get the final list with IDs
          const { data: refreshedCats } = await client.from('categories').select('*').eq('user_id', user.value!.sub);
          if (refreshedCats) finalCategories = refreshedCats;
        }

        // Map legacy symbols to codes if strictly necessary, but SQL migration should have handled it.
        // We trust the DB to have valid codes now.
        const dbCurrency = finalProfile?.currency || 'EUR';

        state.value = {
          config: {
            monthlyLimit: Number(finalProfile?.monthly_limit || 0),
            currency: dbCurrency,
            onboardingComplete: finalProfile?.onboarding_complete || false,
            language: finalProfile?.language || 'en',
            theme: finalProfile?.theme || 'system'
          },
          categories: finalCategories.map((c) => ({
            id: c.id,
            emoji: c.emoji,
            name: c.name || '', // Handle nullable name for default categories
            key: c.key || undefined,
            user_id: c.user_id
          })),
          transactions: (transactions || []).map((t) => ({
            id: t.id,
            amount: Number(t.amount),
            date: t.date || new Date().toISOString(),
            note: t.note || '',
            category: t.category || ''
          })),
          months: (monthsData || []).reduce((acc: Record<string, MonthData>, m) => {
            acc[m.key] = {
              budget: m.budget,
              income: m.income,
              data: m.data
            };
            return acc;
          }, {})
        };
      } catch (e) {
        console.error('Failed to load state from Supabase', e);
        // Do not overwrite state with default on error to preserve potentially optimistic state
        // or at least don't wipe it unless necessary. But for now reverting to default on CATASTROPHIC error might be safe?
        // actually, if network fails, we probably shouldn't wipe local state if we had it.
        // But here we are loading FRESH state.
        state.value = DEFAULT_STATE;
      }
    };

    globalLoadingPromise = loadTask();
    try {
      await globalLoadingPromise;
      // Mark as loaded for this user
      isLoaded.value = user.value?.sub || null;
    } finally {
      globalLoadingPromise = null;
    }
  };

  const saveState = async (newState: AppState) => {
    if (!user.value?.sub) return;
    state.value = newState; // Update local state immediately

    try {
      const { error } = await client.from('profiles').upsert({
        user_id: user.value.sub,
        monthly_limit: newState.config.monthlyLimit,
        currency: newState.config.currency,
        onboarding_complete: newState.config.onboardingComplete,
        language: newState.config.language,
        theme: newState.config.theme
      });

      if (error) throw error;
    } catch (e) {
      console.error('Failed to save state to Supabase', e);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!user.value?.sub) return;

    // Optimistic update with temporary ID
    // We keep a reference to the temporary ID to replace it later
    const tempId = transaction.id;
    state.value.transactions = [transaction, ...state.value.transactions];

    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: user.value.sub,
        amount: transaction.amount,
        date: transaction.date,
        note: transaction.note,
        category: transaction.category
      })
      .select()
      .single();

    if (error) {
      console.error('[addTransaction] Failed to add transaction:', error);
      // Remove the optimistic transaction on error
      state.value.transactions = state.value.transactions.filter((t) => t.id !== tempId);
      return;
    }

    // Update the local transaction with the real ID from database
    if (data) {
      const index = state.value.transactions.findIndex((t) => t.id === tempId);
      if (index !== -1 && state.value.transactions[index]) {
        // MUTATE the existing object reference so that any UI components (like the open modal)
        // holding a reference to this transaction see the updated ID immediately.
        state.value.transactions[index]!.id = data.id;
      } else {
        console.warn('[addTransaction] Could not find optimistic transaction to update ID:', tempId);
      }
    }
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    if (!user.value?.sub) return;

    // Optimistic update
    const index = state.value.transactions.findIndex((t) => t.id === updatedTx.id);
    if (index !== -1) {
      state.value.transactions[index] = updatedTx;
    }
    const { data: updateData, error } = await client
      .from('transactions')
      .update({
        amount: updatedTx.amount,
        date: updatedTx.date,
        note: updatedTx.note,
        category: updatedTx.category
      })
      .eq('id', updatedTx.id)
      .select();

    if (error) {
      console.error('[updateTransaction] Failed to update transaction:', error);
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user.value?.sub) return;

    // Optimistic update
    state.value.transactions = state.value.transactions.filter((t) => t.id !== id);

    const { error } = await client.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('[removeTransaction] Failed to delete transaction:', error);
    }
  };

  const clearState = async () => {
    if (!user.value?.sub) return;
    state.value = DEFAULT_STATE;

    try {
      // Delete all transactions
      await client.from('transactions').delete().eq('user_id', user.value.sub);

      // Reset profile
      await client
        .from('profiles')
        .update({
          monthly_limit: 0,
          onboarding_complete: false
        })
        .eq('user_id', user.value.sub);

      // Delete all categories
      await client.from('categories').delete().eq('user_id', user.value.sub);
    } catch (e) {
      console.error('Failed to clear state', e);
    }
  };

  const updateConfig = async (partialConfig: Partial<AppState['config']>) => {
    if (!user.value?.sub) return;

    // Optimistically update local state
    state.value.config = { ...state.value.config, ...partialConfig };
    try {
      const { error } = await client.from('profiles').upsert({
        user_id: user.value.sub,
        monthly_limit: state.value.config.monthlyLimit,
        currency: state.value.config.currency,
        onboarding_complete: state.value.config.onboardingComplete,
        theme: state.value.config.theme,
        language: state.value.config.language
      });

      if (error) throw error;
    } catch (e) {
      console.error('Failed to update config', e);
      // Ideally revert state here if critical
    }
  };

  const getMonthConfig = (date: string) => {
    const key = getMonthKey(date);
    const monthData = state.value.months?.[key];

    // If specific month budget exists, use it. Otherwise default to global monthlyLimit.
    const budget =
      monthData?.budget !== null && monthData?.budget !== undefined
        ? monthData.budget
        : state.value.config.monthlyLimit;

    return {
      budget,
      income: monthData?.income || 0,
      meta: monthData?.data || {}
    };
  };

  const upsertMonth = async (key: string, data: Partial<MonthData>) => {
    if (!user.value?.sub) return;

    // Optimistic Update
    if (!state.value.months) state.value.months = {};
    const existing = state.value.months[key] || {};

    state.value.months[key] = {
      ...existing,
      ...data
    };

    try {
      const { error } = await client.from('months').upsert(
        {
          user_id: user.value.sub,
          key,
          budget: data.budget,
          income: data.income,
          data: data.data || existing.data || {}
        },
        { onConflict: 'user_id,key' }
      );

      if (error) throw error;
    } catch (e) {
      console.error('Failed to upsert month', e);
    }
  };

  return {
    state,
    loadState,
    saveState,
    updateConfig,
    updateTransaction,
    removeTransaction,
    addTransaction,
    clearState,
    getMonthConfig,
    upsertMonth
  };
};

// Helper: Get Month Key (YYYY-MM)
function getMonthKey(date: string | Date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
