import type { Category } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

export const useCategoriesStore = () => {
  const { $i18n } = useNuxtApp();
  const { t } = $i18n as any;
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const categories = useState<Category[]>('categories-list', () => []);
  const isLoaded = useState<boolean>('categories-loaded', () => false);
  const isSeeding = useState<boolean>('categories-seeding', () => false);

  const expenseCategories = computed(() => categories.value.filter((c) => c.type !== 'income'));
  const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'));

  const DEFAULT_CATEGORIES = [
    { emoji: '🛍️', key: 'shopping', type: 'expense' },
    { emoji: '🍔', key: 'food', type: 'expense' },
    { emoji: '🚗', key: 'transport', type: 'expense' },
    { emoji: '🎬', key: 'entertainment', type: 'expense' },
    { emoji: '☕', key: 'coffee', type: 'expense' },
    { emoji: '🏠', key: 'utilities', type: 'expense' }
  ];

  const INCOME_CATEGORIES = [
    { emoji: '💰', key: 'salary', type: 'income' },
    { emoji: '🎁', key: 'gift', type: 'income' },
    { emoji: '💸', key: 'refund', type: 'income' },
    { emoji: '🏷️', key: 'sale', type: 'income' }
  ];

  const loadCategories = async () => {
    if (!user.value?.sub) return;

    try {
      const { data, error } = await client.from('categories').select('*').eq('user_id', user.value.sub);

      if (error) throw error;

      if (data && data.length > 0) {
        categories.value = data.map((c: any) => ({
          id: c.id,
          emoji: c.emoji,
          name: c.name || '',
          key: c.key || undefined,
          type: (c.type as 'income' | 'expense') || 'expense',
          user_id: c.user_id
        }));
      } else {
        await seedDefaultCategories();
      }
      isLoaded.value = true;
    } catch (e) {
      console.error('[useCategoriesStore] Failed to load categories:', e);
    }
  };

  const seedDefaultCategories = async (force = false) => {
    if (!user.value?.sub || isSeeding.value) return;

    isSeeding.value = true;
    try {
      if (!force) {
        const { count } = await client
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.value.sub);

        if (count && count > 0) return;
      }

      const allDefaults = [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
      const defaults = allDefaults.map((cat) => ({
        user_id: user.value!.sub,
        emoji: cat.emoji,
        key: cat.key,
        name: '',
        type: cat.type
      }));

      const { data, error } = await client.from('categories').insert(defaults).select();

      if (error) throw error;

      if (data) {
        categories.value = data.map((c: any) => ({
          id: c.id,
          emoji: c.emoji,
          name: c.name || '',
          key: c.key || undefined,
          type: (c.type as 'income' | 'expense') || 'expense',
          user_id: c.user_id
        }));
      }
    } catch (e) {
      console.error('[useCategoriesStore] Failed to seed categories:', e);
    } finally {
      isSeeding.value = false;
    }
  };

  const addCategory = async (emoji: string, name: string, type: 'income' | 'expense' = 'expense') => {
    if (!user.value?.sub) return;

    try {
      const { data, error } = await client
        .from('categories')
        .insert({
          user_id: user.value.sub,
          emoji,
          name,
          type
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        categories.value.push({
          id: data.id,
          emoji: data.emoji,
          name: name,
          key: data.key || undefined,
          type: (data.type as 'income' | 'expense') || 'expense',
          user_id: data.user_id
        });
      }
    } catch (e) {
      console.error('[useCategoriesStore] Failed to add category:', e);
      throw e;
    }
  };

  const updateCategory = async (id: string, emoji: string, name: string) => {
    if (!user.value?.sub) return;

    try {
      const { error } = await client
        .from('categories')
        .update({ emoji, name })
        .eq('id', id)
        .eq('user_id', user.value.sub);

      if (error) throw error;

      const index = categories.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index]!,
          emoji,
          name
        };
      }
    } catch (e) {
      console.error('[useCategoriesStore] Failed to update category:', e);
      throw e;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user.value?.sub) return;

    try {
      const { error } = await client.from('categories').delete().eq('id', id).eq('user_id', user.value.sub);

      if (error) throw error;

      categories.value = categories.value.filter((c) => c.id !== id);
    } catch (e) {
      console.error('[useCategoriesStore] Failed to delete category:', e);
      throw e;
    }
  };

  const getCategoryById = (id: string) => categories.value.find((c) => c.id === id);
  const getCategoryByEmoji = (emoji: string) => categories.value.find((c) => c.emoji === emoji);

  const getCategoryName = (category: Category | undefined) => {
    if (!category) return '';
    return category.key ? t(`categories.${category.key}`) : category.name;
  };

  const clearCategories = async () => {
    if (!user.value?.sub) return;
    categories.value = [];
    try {
      await client.from('categories').delete().eq('user_id', user.value.sub);
    } catch (e) {
      console.error('[useCategoriesStore] Failed to clear categories:', e);
    }
  };

  return {
    categories,
    isLoaded,
    expenseCategories,
    incomeCategories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByEmoji,
    getCategoryName,
    seedDefaultCategories,
    clearCategories,
    INCOME_CATEGORIES
  };
};
