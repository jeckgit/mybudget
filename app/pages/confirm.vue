<script setup lang="ts">
const user = useSupabaseUser()
const { t } = useI18n()

useHead({ title: t('common.loading') })

watch(user, () => {
    if (user.value) {
        return navigateTo('/dashboard')
    }
}, { immediate: true })
</script>

<template>
    <div class="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div class="text-center">
            <div class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
            </div>
            <p class="text-slate-600 dark:text-slate-400">Authenticating...</p>
        </div>
    </div>
</template>
