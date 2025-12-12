import type { AppState, Transaction } from '~/types';
import type { Database } from '~/types/database.types';

const DEFAULT_STATE: AppState = {
  transactions: [],
  config: {
    monthlyLimit: 0,
    currencySymbol: '$',
    onboardingComplete: false
  }
};

export const useStorage = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const state = useState<AppState>('app-state', () => DEFAULT_STATE);

  const loadState = async () => {
    if (!user.value?.sub) {
      state.value = DEFAULT_STATE;
      return;
    }

    try {
      // Load Profile
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('user', user.value.sub)
        .maybeSingle();

      if (profileError) console.error('Error loading profile:', profileError);

      // Load Transactions
      const { data: transactions, error: txError } = await client
        .from('transactions')
        .select('*')
        .eq('user', user.value.sub)
        .order('date', { ascending: false });

      if (txError) console.error('Error loading transactions:', txError);

      // If we have no data at all (no profile AND no transactions), default
      if (!profile && (!transactions || transactions.length === 0)) {
        state.value = DEFAULT_STATE;
        return;
      }

      state.value = {
        config: {
          monthlyLimit: Number(profile?.monthly_limit || 0),
          currencySymbol: profile?.currency_symbol || '$',
          onboardingComplete: profile?.onboarding_complete || false,
          language: profile?.language || 'en',
          theme: profile?.theme || 'system'
        },
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
        user: user.value.sub,
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

    // Optimistic update
    state.value.transactions = [transaction, ...state.value.transactions];

    const { error } = await client.from('transactions').insert({
      user: user.value.sub,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note,
      category: transaction.category
    });

    if (error) {
      console.error('Failed to add transaction', error);
      // Revert on error could be implemented here
    }
  };

  const clearState = async () => {
    if (!user.value?.sub) return;
    state.value = DEFAULT_STATE;

    try {
      // Delete all transactions
      await client.from('transactions').delete().eq('user', user.value.sub);

      // Reset profile
      await client
        .from('profiles')
        .update({
          monthly_limit: 0,
          onboarding_complete: false
        })
        .eq('user', user.value.sub);
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
        user: user.value.sub,
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
    addTransaction,
    clearState
  };
};
