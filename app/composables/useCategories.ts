import type { AppState, Category } from '~/../shared/types';
import type { Database } from '~/../shared/types/database.types';

export const useCategories = () => {
  const { $i18n } = useNuxtApp();
  const { t } = $i18n as any;
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const state = useState<AppState>('app-state');

  const categories = computed(() => state.value.categories);
  const isSeeding = useState('is-seeding', () => false);

  const DEFAULT_CATEGORIES = [
    { emoji: '🛍️', key: 'shopping' },
    { emoji: '🍔', key: 'food' },
    { emoji: '🚗', key: 'transport' },
    { emoji: '🎬', key: 'entertainment' },
    { emoji: '☕', key: 'coffee' },
    { emoji: '🏠', key: 'utilities' }
  ];

  const seedDefaultCategories = async (force = false) => {
    if (!user.value?.sub || isSeeding.value) return;

    isSeeding.value = true;
    try {
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
        emoji: cat.emoji,
        key: cat.key,
        name: '' // Empty for default categories - we use key for translation
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
          name: c.name || '', // Use stored name, or empty string for default categories
          key: c.key || undefined,
          user_id: c.user_id
        }));
      }
    } finally {
      isSeeding.value = false;
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
        name: name, // Custom categories store name directly
        key: data.key || undefined,
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
      state.value.categories[index] = {
        ...state.value.categories[index]!,
        emoji,
        name,
        // Don't allow changing the key for default categories
        key: state.value.categories[index]!.key
      };
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

  // Helper to get the translated name for a category
  const getCategoryName = (category: Category | undefined) => {
    if (!category) return '';
    // If category has a key, use translation; otherwise use the stored name
    return category.key ? t(`categories.${category.key}`) : category.name;
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByEmoji,
    getCategoryName,
    seedDefaultCategories
  };
};
