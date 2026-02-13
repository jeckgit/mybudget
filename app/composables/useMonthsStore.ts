import type { MonthData } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

export const useMonthsStore = () => {
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const profileStore = useProfileStore();

  const months = useState<Record<string, MonthData>>('months-overrides', () => ({}));
  const isLoaded = useState<boolean>('months-loaded', () => false);

  const loadMonths = async () => {
    if (!user.value?.sub) return;

    try {
      const { data, error } = await client.from('months').select('*').eq('user_id', user.value.sub);

      if (error) throw error;

      months.value = (data || []).reduce((acc: Record<string, MonthData>, m) => {
        acc[m.key] = {
          budget: m.budget,
          income: m.income,
          data: m.data
        };
        return acc;
      }, {});
      isLoaded.value = true;
    } catch (e) {
      console.error('[useMonthsStore] Failed to load months:', e);
    }
  };

  const getMonthConfig = (date: string | Date) => {
    const key = getMonthKey(date);
    const monthData = months.value[key];

    // If specific month budget exists, use it. Otherwise default to global monthlyLimit from profileStore.
    const budget =
      monthData?.budget !== null && monthData?.budget !== undefined
        ? monthData.budget
        : profileStore.config.value.monthlyLimit;

    return {
      key,
      budget,
      income: monthData?.income || 0,
      meta: monthData?.data || {}
    };
  };

  const upsertMonth = async (key: string, data: Partial<MonthData>) => {
    if (!user.value?.sub) return;

    // Optimistic Update
    const existing = months.value[key] || {};
    const previous = { ...existing };

    months.value[key] = {
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
      console.error('[useMonthsStore] Failed to upsert month:', e);
      // Rollback on error
      months.value[key] = previous;
    }
  };

  const resetMonthsState = () => {
    months.value = {};
    isLoaded.value = false;
  };

  return {
    months,
    isLoaded,
    loadMonths,
    getMonthConfig,
    upsertMonth,
    resetMonthsState
  };
};

// Helper: Get Month Key (YYYY-MM)
function getMonthKey(date: string | Date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
