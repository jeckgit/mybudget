import type { AppState, Transaction, BudgetConfig } from '~/types';
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

  // We'll use a local state to keep the UI reactive and sync in background
  // But for simplicity in this refactor, let's load on mount and save on change.

  const loadState = async (): Promise<AppState> => {
    if (!user.value) return DEFAULT_STATE;

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
        return DEFAULT_STATE;
      }

      return {
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
      return DEFAULT_STATE;
    }
  };

  const saveState = async (state: AppState) => {
    if (!user.value) return;

    try {
      await supabase.from('profiles').upsert({
        id: user.value.id,
        monthly_limit: state.config.monthlyLimit,
        currency_symbol: state.config.currencySymbol,
        onboarding_complete: state.config.onboardingComplete,
        language: state.config.language,
        theme: state.config.theme
      });
    } catch (e) {
      console.error('Failed to save state to Supabase', e);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!user.value) return;
    const { error } = await supabase.from('transactions').insert({
      user_id: user.value.id,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note,
      category: transaction.category
    });
    if (error) console.error('Failed to add transaction', error);
  };

  const clearState = async () => {
    if (!user.value) return;

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
    loadState,
    saveState,
    addTransaction,
    clearState
  };
};
