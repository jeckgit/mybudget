import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES } from '../../shared/constants/categories';
import type { Database } from '../../shared/types/database.types';

export const initializeUserSetup = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  language: string = 'en'
) => {
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  try {
    // 1. Initialize Profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: userId,
        currency: 'EUR',
        onboarding_complete: false,
        language: language,
        theme: 'system',
        show_rollover: false
      },
      { onConflict: 'user_id' }
    );

    if (profileError) throw profileError;

    // 2. Seed Default Categories
    const allDefaults = [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
    const categoriesToInsert = allDefaults.map((cat) => ({
      user_id: userId,
      emoji: cat.emoji,
      key: cat.key,
      name: null,
      type: cat.type
    }));

    // Use ON CONFLICT DO NOTHING to prevent duplicates if somehow triggered twice
    const { error: categoryError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'user_id,key' });

    if (categoryError) {
      // If the unique constraint doesn't exist yet, we might get an error if we try to upsert with onConflict.
      // Let's try a regular insert if upsert fails or just swallow if it's already there
      // Actually, the plan includes adding a unique constraint, but for now let's be safe.
      const { error: insertError } = await supabase.from('categories').insert(categoriesToInsert);
      if (insertError && !insertError.message.includes('unique constraint')) {
        throw insertError;
      }
    }

    return { ok: true };
  } catch (error: any) {
    console.error('[signupInitialization] Failed to initialize user:', error);
    return { ok: false, error: error.message };
  }
};
