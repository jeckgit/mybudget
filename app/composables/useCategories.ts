import type { Category, AppState } from '~/types';
import type { Database } from '~/types/database.types';

export const useCategories = () => {
  const { t } = useI18n();
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const state = useState<AppState>('app-state');

  const categories = computed(() => state.value.categories);

  const DEFAULT_CATEGORIES = [
    { emoji: '🛍️', name: t('categories.shopping') },
    { emoji: '🍔', name: t('categories.food') },
    { emoji: '🚗', name: t('categories.transport') },
    { emoji: '🎬', name: t('categories.entertainment') },
    { emoji: '☕', name: t('categories.coffee') },
    { emoji: '🏠', name: t('categories.utilities') }
  ];

  const seedDefaultCategories = async (force = false) => {
    if (!user.value?.sub) return;

    if (!force) {
      // Check if categories already exist to prevent duplicates
      const { count } = await client
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.sub);

      if (count && count > 0) return;
    }

    const defaults = DEFAULT_CATEGORIES.map((cat) => ({
      user_id: user.value!.sub,
      ...cat
    }));

    const { data, error } = await client.from('categories').insert(defaults).select();

    if (error) {
      console.error('[seedDefaultCategories] Error:', error);
      return;
    }

    if (data) {
      state.value.categories = data.map((c) => ({
        id: c.id,
        emoji: c.emoji,
        name: c.name,
        user_id: c.user_id
      }));
    }
  };

  const addCategory = async (emoji: string, name: string) => {
    if (!user.value?.sub) return;

    const { data, error } = await client
      .from('categories')
      .insert({
        user_id: user.value.sub,
        emoji,
        name
      })
      .select()
      .single();

    if (error) {
      console.error('[addCategory] Supabase error:', error);
      throw error;
    }

    if (data) {
      state.value.categories.push({
        id: data.id,
        emoji: data.emoji,
        name: data.name,
        user_id: data.user_id
      });
    }
  };

  const updateCategory = async (id: string, emoji: string, name: string) => {
    if (!user.value?.sub) return;

    const { error } = await client
      .from('categories')
      .update({ emoji, name })
      .eq('id', id)
      .eq('user_id', user.value.sub);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    const index = state.value.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.value.categories[index] = { ...state.value.categories[index]!, emoji, name };
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user.value?.sub) return;

    const { error } = await client.from('categories').delete().eq('id', id).eq('user_id', user.value.sub);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    state.value.categories = state.value.categories.filter((c) => c.id !== id);
  };

  const getCategoryById = (id: string) => categories.value.find((c) => c.id === id);
  const getCategoryByEmoji = (emoji: string) => categories.value.find((c) => c.emoji === emoji);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByEmoji,
    seedDefaultCategories
  };
};
