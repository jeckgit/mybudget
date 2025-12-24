import type { AppState, Transaction } from '~/types';
import type { Database } from '~/types/database.types';

const DEFAULT_STATE: AppState = {
  transactions: [],
  categories: [],
  config: {
    monthlyLimit: 0,
    currencySymbol: '€',
    onboardingComplete: false
  }
};

export const useStorage = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { t, setLocale, locale } = useI18n();
  const state = useState<AppState>('app-state', () => DEFAULT_STATE);
  const { seedDefaultCategories } = useCategories();

  // Sync i18n locale with state language
  watch(
    () => state.value.config.language,
    (newLang) => {
      if (newLang && newLang !== locale.value) {
        setLocale(newLang as any);
      }
    },
    { immediate: true }
  );

  const loadState = async () => {
    if (!user.value?.sub) {
      state.value = { ...DEFAULT_STATE };
      return;
    }

    try {
      // Load Profile
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', user.value.sub)
        .maybeSingle();

      if (profileError) console.error('Error loading profile:', profileError);

      // Load Transactions
      const { data: transactions, error: txError } = await client
        .from('transactions')
        .select('*')
        .eq('user_id', user.value.sub)
        .order('date', { ascending: false });

      if (txError) console.error('Error loading transactions:', txError);

      // Load Categories
      const { data: categories, error: catError } = await client
        .from('categories')
        .select('*')
        .eq('user_id', user.value.sub);

      if (catError) console.error('Error loading categories:', catError);

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
              currency_symbol: '€',
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

      state.value = {
        config: {
          monthlyLimit: Number(finalProfile?.monthly_limit || 0),
          currencySymbol: finalProfile?.currency_symbol || '€',
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
        }))
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

  const saveState = async (newState: AppState) => {
    if (!user.value?.sub) return;
    state.value = newState; // Update local state immediately

    try {
      const { error } = await client.from('profiles').upsert({
        user_id: user.value.sub,
        monthly_limit: newState.config.monthlyLimit,
        currency_symbol: newState.config.currencySymbol,
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
        currency_symbol: state.value.config.currencySymbol,
        onboarding_complete: state.value.config.onboardingComplete,
        language: state.value.config.language,
        theme: state.value.config.theme
      });

      if (error) throw error;
    } catch (e) {
      console.error('Failed to update config', e);
      // Ideally revert state here if critical
    }
  };

  // Automatically load state if user is logged in and not already loaded (or on server)
  // useAsyncData ensures this runs on server and hydrates, or runs on client.
  useAsyncData(
    'budget-data',
    async () => {
      if (user.value?.sub) {
        await loadState();
      }
      return true;
    },
    {
      watch: [user] // Re-fetch if user changes
    }
  );

  return {
    state,
    loadState,
    saveState,
    updateConfig,
    updateTransaction,
    removeTransaction,
    addTransaction,
    clearState
  };
};
