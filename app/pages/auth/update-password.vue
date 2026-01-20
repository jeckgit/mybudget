<script setup lang="ts">
const { t } = useI18n()
useHead({ title: t('auth.update_password') })

definePageMeta({
    hideBottomNav: true
});
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const verifying = ref(true)

onMounted(async () => {
    // Wait a brief moment for the session to be restored from the hash
    setTimeout(() => {
        if (!user.value) {
            // If still no user, check if we have a session in the URL to establish
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'PASSWORD_RECOVERY' || session) {
                    verifying.value = false;
                } else if (event === 'SIGNED_OUT') {
                    // If we end up signed out, the link might be invalid or expired
                    errorMsg.value = t('auth.invalid_link');
                    verifying.value = false;
                }
            });
        } else {
            verifying.value = false;
        }
    }, 1000);
});

const handleUpdate = async () => {
    if (!user.value) {
        errorMsg.value = t('auth.session_expired');
        return;
    }

    loading.value = true
    errorMsg.value = ''
    try {
        const { error } = await supabase.auth.updateUser({
            password: password.value
        })
        if (error) throw error

        // Sign out then redirect to login to force fresh login with new password
        // Or just redirect to dashboard if we want to keep them logged in. 
        // Best practice often is to keep them logged in.
        navigateTo('/dashboard')
    } catch (e: any) {
        errorMsg.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden">
        <BackgroundMesh />
        <GlassCard variant="white"
            class="w-full max-w-md p-8 relative z-10 bg-white/80! dark:bg-white/5! dark:border! dark:border-white/10! dark:shadow-black/20">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800 mb-2 dark:text-white">{{ t('auth.update_password') }}</h1>
                <p class="text-slate-500 dark:text-slate-400">{{ t('auth.new_password') }}</p>
            </div>

            <div v-if="verifying" class="text-center py-8">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4 dark:border-white">
                </div>
                <p class="text-slate-500 font-medium dark:text-slate-400">{{ t('auth.verifying') }}</p>
            </div>

            <form v-else @submit.prevent="handleUpdate" class="space-y-4">
                <div>
                    <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 dark:text-slate-400">{{
                            t('auth.new_password') }}</label>
                    <input v-model="password" type="password" required minlength="6"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        :placeholder="t('auth.password_placeholder')" />
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium">
                    {{ errorMsg }}
                </div>

                <GlassButton type="submit" :full-width="true" :disabled="loading"
                    class="bg-slate-900! text-white! hover:bg-slate-800! dark:bg-white! dark:text-black! dark:hover:bg-slate-200!">
                    {{ loading ? t('auth.updating') : t('auth.update_password') }}
                </GlassButton>
            </form>
        </GlassCard>
    </div>
</template>
