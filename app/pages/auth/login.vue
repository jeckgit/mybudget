<script setup lang="ts">
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
    console.log('toggling');
    // isSignUp.value = !isSignUp.value;
};

const handleAuth = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        if (isSignUp.value) {
            const { error } = await supabase.auth.signUp({
                email: email.value,
                password: password.value,
            });
            if (error) throw error;
            // Create profile record if needed, though triggers are better. 
            // For now we rely on the user being created.
            alert('Check your email for the login link!');
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

        <GlassCard variant="white" class="w-full max-w-md p-8 relative z-10 !bg-white/80">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800 mb-2">Welcome</h1>
                <p class="text-slate-500">{{ isSignUp ? 'Create an account' : 'Sign in to continue' }}</p>
            </div>
            <template v-if="isOAuth">
                <div class="space-y-3 mb-6">
                    <button @click="handleOAuth('google')"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm">
                        <img src="~/assets/icons/google.svg" class="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>
                    <button @click="handleOAuth('github')"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#24292F] hover:bg-[#24292F]/90 transition-colors text-white font-bold text-sm">
                        <img src="~/assets/icons/github.svg" class="w-5 h-5 invert" alt="GitHub" />
                        Continue with GitHub
                    </button>
                </div>

                <div class="relative mb-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-slate-200"></div>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                        <span class="bg-white/80 px-2 text-slate-400 font-bold tracking-wider">Or with email</span>
                    </div>
                </div>
            </template>

            <form @submit.prevent="handleAuth" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email</label>
                    <input v-model="email" type="email" required
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800"
                        placeholder="hello@example.com" />
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Password</label>
                    <input v-model="password" type="password" required
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800"
                        placeholder="••••••••" />
                    <div class="flex justify-end mt-1">
                        <NuxtLink to="/auth/forgot-password"
                            class="text-xs text-slate-500 hover:text-purple-600 transition-colors">
                            Forgot Password?
                        </NuxtLink>
                    </div>
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium">
                    {{ errorMsg }}
                </div>

                <GlassButton type="submit" :full-width="true" :disabled="loading"
                    class="bg-slate-900! text-white! hover:bg-slate-800!">
                    {{ loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
                </GlassButton>
            </form>

            <div class="mt-6 text-center">
                <button @click="toggleSignup" type="button"
                    class="cursor-pointer text-sm text-slate-500 hover:text-purple-600 font-medium transition-colors">
                    {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
                </button>
            </div>
        </GlassCard>
    </div>
</template>
