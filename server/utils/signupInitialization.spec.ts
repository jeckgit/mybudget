import { describe, expect, it, vi, beforeEach } from 'vitest';
import { initializeUserSetup } from './signupInitialization';
import { createClient } from '@supabase/supabase-js';

// Mock supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

describe('initializeUserSetup', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    upsert: vi.fn(),
    insert: vi.fn(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('successfully initializes profile and categories', async () => {
    mockSupabase.upsert.mockResolvedValue({ error: null });
    mockSupabase.insert.mockResolvedValue({ error: null });

    const result = await initializeUserSetup('url', 'key', 'user-123', 'de');

    expect(result.ok).toBe(true);

    // Check profile initialization
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        language: 'de'
      }),
      { onConflict: 'user_id' }
    );

    // Check categories initialization
    expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    expect(mockSupabase.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ user_id: 'user-123', key: 'shopping' }),
        expect.objectContaining({ user_id: 'user-123', key: 'salary' })
      ]),
      { onConflict: 'user_id,key' }
    );
  });

  it('returns error if profile initialization fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabase.upsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

    const result = await initializeUserSetup('url', 'key', 'user-123');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('DB Error');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[signupInitialization] Failed to initialize user:',
      expect.objectContaining({ message: 'DB Error' })
    );

    consoleSpy.mockRestore();
  });

  it('swallows error if categories already exist (unique constraint)', async () => {
    mockSupabase.upsert.mockResolvedValueOnce({ error: null }); // profile ok
    mockSupabase.upsert.mockResolvedValueOnce({ error: { message: 'unique constraint violation' } }); // upsert fails
    mockSupabase.insert.mockResolvedValueOnce({ error: { message: 'unique constraint violation' } }); // insert fails

    const result = await initializeUserSetup('url', 'key', 'user-123');

    expect(result.ok).toBe(true); // Should still return ok because we handle the constraint error
  });
});
