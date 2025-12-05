<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)
const message = ref('')
const errorMsg = ref('')

const handleReset = async () => {
    loading.value = true
    message.value = ''
    errorMsg.value = ''
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        })
        if (error) throw error
        message.value = 'Check your email for the password reset link.'
    } catch (e: any) {
        errorMsg.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <BackgroundMesh />
        <GlassCard variant="white" class="w-full max-w-md p-8 relative z-10 !bg-white/80">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800 mb-2">Reset Password</h1>
                <p class="text-slate-500">Enter your email to receive instructions</p>
            </div>

            <form @submit.prevent="handleReset" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email</label>
                    <input v-model="email" type="email" required
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800"
                        placeholder="hello@example.com" />
                </div>

                <div v-if="message" class="text-green-600 text-sm text-center font-medium">
                    {{ message }}
                </div>
                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium">
                    {{ errorMsg }}
                </div>

                <GlassButton type="submit" :full-width="true" :disabled="loading"
                    class="!bg-slate-900 !text-white hover:!bg-slate-800">
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </GlassButton>
            </form>

            <div class="mt-6 text-center">
                <NuxtLink to="/auth/login"
                    class="text-sm text-slate-500 hover:text-purple-600 font-medium transition-colors">
                    Back to Sign In
                </NuxtLink>
            </div>
        </GlassCard>
    </div>
</template>
