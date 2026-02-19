import { nextTick, ref, watch } from 'vue';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const userRef = ref<{ sub: string; email: string } | null>(null);
const initAppMock = vi.fn();
const resetLocalStateMock = vi.fn();
const defineNuxtPluginMock = vi.fn((plugin: any) => plugin);

beforeAll(() => {
  vi.stubGlobal('defineNuxtPlugin', defineNuxtPluginMock);
  vi.stubGlobal('watch', watch);
  vi.stubGlobal('useSupabaseUser', () => userRef);
  vi.stubGlobal('useAppSync', () => ({
    initApp: initAppMock,
    resetLocalState: resetLocalStateMock
  }));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('state loader auth transitions', () => {
  beforeEach(() => {
    userRef.value = null;
    initAppMock.mockReset();
    resetLocalStateMock.mockReset();
    defineNuxtPluginMock.mockClear();
    initAppMock.mockResolvedValue(undefined);
  });

  it('resets state and forces reload when account is recreated with same email', async () => {
    userRef.value = { sub: 'old-user-id', email: 'same@example.com' };

    const plugin = (await import('../../plugins/state-loader')).default;
    plugin({
      runWithContext: (fn: () => unknown) => fn()
    } as any);
    await nextTick();

    // Initial authenticated load
    expect(resetLocalStateMock).toHaveBeenCalledTimes(1);
    expect(initAppMock).toHaveBeenCalledWith(true);

    resetLocalStateMock.mockClear();
    initAppMock.mockClear();

    // User deletes account/signs out
    userRef.value = null;
    await nextTick();

    expect(resetLocalStateMock).toHaveBeenCalledTimes(1);
    expect(initAppMock).not.toHaveBeenCalled();

    // New account with same email but new auth subject
    userRef.value = { sub: 'new-user-id', email: 'same@example.com' };
    await nextTick();

    expect(resetLocalStateMock).toHaveBeenCalledTimes(2);
    expect(initAppMock).toHaveBeenCalledTimes(1);
    expect(initAppMock).toHaveBeenCalledWith(true);
  });
});
