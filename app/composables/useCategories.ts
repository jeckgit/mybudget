import type { Category } from '~/types';
import type { Database } from '~/types/database.types';

export const useCategories = () => {
  const { t } = useI18n();
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { state } = useStorage();

  const categories = computed(() => state.value.categories);

  const seedDefaultCategories = async () => {
    if (!user.value?.sub) return;

    const defaults = [
      { user_id: user.value.sub, emoji: '🛍️', name: t('categories.shopping') },
      { user_id: user.value.sub, emoji: '🍔', name: t('categories.food') },
      { user_id: user.value.sub, emoji: '🚗', name: t('categories.transport') },
      { user_id: user.value.sub, emoji: '🎬', name: t('categories.entertainment') },
      { user_id: user.value.sub, emoji: '☕', name: t('categories.coffee') },
      { user_id: user.value.sub, emoji: '🏠', name: t('categories.utilities') }
    ];

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

  const loadCategories = async () => {
    if (!user.value?.sub) return;

    const { data, error } = await client.from('categories').select('*').eq('user_id', user.value.sub);

    if (error) {
      console.error('Error loading categories:', error);
      return;
    }

    if (data && data.length > 0) {
      state.value.categories = data.map((c) => ({
        id: c.id,
        emoji: c.emoji,
        name: c.name,
        user_id: c.user_id
      }));
    } else {
      // If no categories found, seed them automatically
      await seedDefaultCategories();
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
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByEmoji,
    seedDefaultCategories
  };
};
