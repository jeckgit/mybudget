import type { Transaction } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

export const useTransactionsStore = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const transactions = useState<Transaction[]>('transactions-list', () => []);
  const isLoaded = useState<boolean>('transactions-loaded', () => false);

  const loadTransactions = async () => {
    if (!user.value?.sub) return;

    try {
      const { data, error } = await client
        .from('transactions')
        .select('*')
        .eq('user_id', user.value.sub)
        .order('date', { ascending: false });

      if (error) throw error;

      transactions.value = (data || []).map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.date || new Date().toISOString(),
        note: t.note || '',
        category: t.category || ''
      }));
      isLoaded.value = true;
    } catch (e) {
      console.error('[useTransactionsStore] Failed to load transactions:', e);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!user.value?.sub) return;

    // Optimistic update
    const tempId = transaction.id;
    transactions.value = [transaction, ...transactions.value];

    try {
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

      if (error) throw error;

      // Update the local transaction with the real ID
      if (data) {
        const index = transactions.value.findIndex((t) => t.id === tempId);
        if (index !== -1) {
          transactions.value[index]!.id = data.id;
        }
      }
    } catch (e) {
      console.error('[useTransactionsStore] Failed to add transaction:', e);
      // Rollback on error
      transactions.value = transactions.value.filter((t) => t.id !== tempId);
    }
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    if (!user.value?.sub) return;

    // Optimistic update
    const previousTxIndex = transactions.value.findIndex((t) => t.id === updatedTx.id);
    if (previousTxIndex === -1) return;

    const previousTx = { ...transactions.value[previousTxIndex]! };
    transactions.value[previousTxIndex] = updatedTx;

    try {
      const { error } = await client
        .from('transactions')
        .update({
          amount: updatedTx.amount,
          date: updatedTx.date,
          note: updatedTx.note,
          category: updatedTx.category
        })
        .eq('id', updatedTx.id);

      if (error) throw error;
    } catch (e) {
      console.error('[useTransactionsStore] Failed to update transaction:', e);
      // Rollback on error
      transactions.value[previousTxIndex] = previousTx;
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user.value?.sub) return;

    // Optimistic update
    const previousTransactions = [...transactions.value];
    transactions.value = transactions.value.filter((t) => t.id !== id);

    try {
      const { error } = await client.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error('[useTransactionsStore] Failed to delete transaction:', e);
      // Rollback on error
      transactions.value = previousTransactions;
    }
  };

  const clearTransactions = async () => {
    if (!user.value?.sub) return;
    transactions.value = [];
    try {
      await client.from('transactions').delete().eq('user_id', user.value.sub);
    } catch (e) {
      console.error('[useTransactionsStore] Failed to clear transactions:', e);
    }
  };

  return {
    transactions,
    isLoaded,
    loadTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearTransactions
  };
};
