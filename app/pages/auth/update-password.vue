<script setup lang="ts">
const supabase = useSupabaseClient()
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleUpdate = async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        const { error } = await supabase.auth.updateUser({
            password: password.value
        })
        if (error) throw error
        navigateTo('/dashboard')
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
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-800 mb-2">Update Password</h1>
                <p class="text-slate-500">Enter your new password</p>
            </div>

            <form @submit.prevent="handleUpdate" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">New
                        Password</label>
                    <input v-model="password" type="password" required minlength="6"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-800"
                        placeholder="••••••••" />
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm text-center font-medium">
                    {{ errorMsg }}
                </div>

                <GlassButton type="submit" :full-width="true" :disabled="loading"
                    class="!bg-slate-900 !text-white hover:!bg-slate-800">
                    {{ loading ? 'Updating...' : 'Update Password' }}
                </GlassButton>
            </form>
        </GlassCard>
    </div>
</template>
