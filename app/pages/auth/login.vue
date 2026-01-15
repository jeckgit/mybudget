<script setup lang="ts">
const { t } = useI18n();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isOAuth = ref(false);

const loading = ref(false);
const email = ref('');
const password = ref('');
const isSignUp = ref(false);
const errorMsg = ref('');

watchEffect(() => {
    if (user.value) {
        navigateTo('/dashboard');
    }
});

const toggleSignup = () => {
    isSignUp.value = !isSignUp.value;
};

const handleAuth = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        if (isSignUp.value) {
            const { data, error } = await supabase.auth.signUp({
                email: email.value,
                password: password.value,
            });
            if (error) throw error;

            // If "Confirm email" is disabled in Supabase, data.session will be present
            if (data.session) {
                navigateTo('/dashboard');
            } else {
                alert(t('auth.check_email'));
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            });
            if (error) throw error;
        }
    } catch (error: any) {
        errorMsg.value = error.message;
    } finally {
        loading.value = false;
    }
};

const handleOAuth = async (provider: 'google' | 'github') => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            }
        });
        if (error) throw error;
    } catch (error: any) {
        errorMsg.value = error.message;
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <BackgroundMesh />

        <GlassCard variant="white"
            class="w-full max-w-md p-8 relative z-10 !bg-white/80 dark:!bg-white/5 dark:!border dark:!border-white/10 dark:shadow-black/20">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800 mb-2 dark:text-white">{{ t('auth.welcome') }}</h1>
                <p class="text-slate-500 dark:text-slate-400">{{ isSignUp ? t('auth.create_account') :
                    t('auth.sign_in_desc') }}</p>
            </div>
            <template v-if="isOAuth">
                <div class="space-y-3 mb-6">
                    <button @click="handleOAuth('google')"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20">
                        <img src="~/assets/icons/google.svg" class="w-5 h-5" alt="Google" />
                        {{ t('auth.continue_google') }}
                    </button>
                    <button @click="handleOAuth('github')"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#24292F] hover:bg-[#24292F]/90 transition-colors text-white font-bold text-sm">
                        <img src="~/assets/icons/github.svg" class="w-5 h-5 invert" alt="GitHub" />
                        {{ t('auth.continue_github') }}
                    </button>
                </div>

                <div class="relative mb-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-slate-200 dark:border-white/10"></div>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span
                            class="bg-white/80 px-2 text-slate-400 font-bold tracking-wider dark:bg-transparent dark:text-slate-500">
                            {{ t('auth.or_email') }}
                        </span>
                    </div>
                </div>
            </template>

            <form @submit.prevent="handleAuth" class="space-y-4">
                <div>
                    <label for="email"
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 dark:text-slate-400">{{
                        t('auth.email') }}</label>
                    <input id="email" v-model="email" type="email" name="email" autocomplete="username" required
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        :placeholder="t('auth.email_placeholder')" />
                </div>

                <div>
                    <label for="password"
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 dark:text-slate-400">{{
                            t('auth.password') }}</label>
                    <input id="password" v-model="password" type="password" name="password"
                        :autocomplete="isSignUp ? 'new-password' : 'current-password'" required
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        :placeholder="t('auth.password_placeholder')" />
                    <div class="flex justify-end mt-1">
                        <NuxtLink to="/auth/forgot-password"
                            class="text-xs text-slate-500 hover:text-accent transition-colors dark:text-slate-400 dark:hover:text-white">
                            {{ t('auth.forgot_password') }}
                        </NuxtLink>
                    </div>
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium">
                    {{ errorMsg }}
                </div>

                <GlassButton type="submit" :full-width="true" :disabled="loading"
                    class="bg-slate-900! text-white! hover:bg-slate-800! dark:bg-white! dark:text-black! dark:hover:bg-slate-200!">
                    {{ loading ? t('auth.loading') : (isSignUp ? t('auth.sign_up') : t('auth.sign_in')) }}
                </GlassButton>
            </form>

            <div class="mt-6 text-center">
                <button @click="toggleSignup" type="button"
                    class="cursor-pointer text-sm text-slate-500 hover:text-accent font-medium transition-colors dark:text-slate-400 dark:hover:text-white">
                    {{ isSignUp ? t('auth.have_account') : t('auth.no_account') }}
                </button>
            </div>
        </GlassCard>
    </div>
</template>
