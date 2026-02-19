<script setup lang="ts">
const user = useSupabaseUser();
const client = useSupabaseClient();
const { t } = useI18n();
const profileStore = useProfileStore();

const errorState = ref<string | null>(null);

useHead({ title: computed(() => errorState.value ? t('common.error_occurred') : t('common.loading')) });

const completeVerification = async () => {
    if (!user.value?.sub) return;

    // Wait a brief moment for the session to be fully established
    await new Promise(resolve => setTimeout(resolve, 500));

    const { error } = await client.rpc('mark_email_verified');
    if (error) {
        console.error('[confirm] mark_email_verified failed:', error.message);
        // Even if RPC fails, we might still want to redirect
    } else {
        const nowIso = new Date().toISOString();
        await profileStore.updateConfig({ emailVerifiedAt: nowIso });
    }

    navigateTo('/dashboard');
};

onMounted(async () => {
    // 0. Check for errors in URL (Hash)
    // Supabase can return #error=...&error_description=...
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const error = params.get('error');
        const errorDesc = params.get('error_description');

        if (error) {
            console.error('[confirm] Error in URL:', error, errorDesc);
            errorState.value = errorDesc?.replace(/\+/g, ' ') || 'Authentication failed.';
            return; // Stop processing
        }
    }

    // 1. Immediate check
    if (user.value) {
        await completeVerification();
        return;
    }

    // 2. Manual session check (in case module didn't sync yet)
    const { data: { session } } = await client.auth.getSession();

    if (session) {
        await completeVerification();
        return;
    }

    // 3. Fallback: Manual Hash Parsing
    if (window.location.hash && window.location.hash.includes('access_token')) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
            const { error: setSessionError } = await client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
            });

            if (!setSessionError) {
                // Success - wait for the auth state change to fire or call completeVerification directly
                // Logic continues to the listener below which handles the actual completion
            }
        }
    }

    // 4. Listen for auth state changes
    console.log('[confirm] Setting up auth listener...');
    const { data } = client.auth.onAuthStateChange(async (event, session) => {
        console.log('[confirm] Auth event:', event, session?.user?.email);
        if (event === 'SIGNED_IN' || session) {
            await completeVerification();
        }
    });

    onUnmounted(() => {
        if (data?.subscription) data.subscription.unsubscribe();
    });
});

// Watcher as a backup
watch(user, async (newUser) => {
    if (newUser) {
        await completeVerification();
    }
});
</script>

<template>
    <div class="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div class="text-center max-w-sm w-full">
            <template v-if="errorState">
                <div
                    class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 dark:bg-red-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 class="text-xl font-bold text-slate-800 dark:text-white mb-2">{{ t('common.error_occurred') }}</h1>
                <p class="text-slate-500 dark:text-slate-400 mb-8">{{ errorState }}</p>

                <NuxtLink to="/auth/login">
                    <button
                        class="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                        {{ t('auth.back_to_sign_in') }}
                    </button>
                </NuxtLink>
            </template>

            <template v-else>
                <div
                    class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
                </div>
                <p class="text-slate-600 dark:text-slate-400">{{ t('auth.verifying') }}</p>
            </template>
        </div>
    </div>
</template>
