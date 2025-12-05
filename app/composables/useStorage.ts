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
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const state = useState<AppState>('app-state', () => DEFAULT_STATE);

  const loadState = async () => {
    if (!user.value) {
      state.value = DEFAULT_STATE;
      return;
    }

    try {
      // Load Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.value.id).single();

      // Load Transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('date', { ascending: false });

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
      state.value = DEFAULT_STATE;
    }
  };

  const saveState = async (newState: AppState) => {
    if (!user.value) return;
    state.value = newState; // Update local state immediately

    try {
      await supabase.from('profiles').upsert({
        id: user.value.id,
        monthly_limit: newState.config.monthlyLimit,
        currency_symbol: newState.config.currencySymbol,
        onboarding_complete: newState.config.onboardingComplete,
        language: newState.config.language,
        theme: newState.config.theme
      });
    } catch (e) {
      console.error('Failed to save state to Supabase', e);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!user.value) return;

    // Optimistic update
    state.value.transactions = [transaction, ...state.value.transactions];

    const { error } = await supabase.from('transactions').insert({
      user_id: user.value.id,
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
    if (!user.value) return;
    state.value = DEFAULT_STATE;

    try {
      // Delete all transactions
      await supabase.from('transactions').delete().eq('user_id', user.value.id);

      // Reset profile
      await supabase
        .from('profiles')
        .update({
          monthly_limit: 0,
          onboarding_complete: false
        })
        .eq('id', user.value.id);
    } catch (e) {
      console.error('Failed to clear state', e);
    }
  };

  return {
    state,
    loadState,
    saveState,
    addTransaction,
    clearState
  };
};
