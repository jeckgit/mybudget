<script setup lang="ts">
const user = useSupabaseUser();
const client = useSupabaseClient();
const route = useRoute();
const { t } = useI18n();
const profileStore = useProfileStore();

useHead({ title: t('common.loading') });

const completeVerification = async () => {
    if (!user.value?.sub) return;
    if (route.query.verify !== '1') return;

    const { error } = await client.rpc('mark_email_verified');
    if (error) {
        console.error('[confirm] mark_email_verified failed:', error.message);
        return;
    }

    const nowIso = new Date().toISOString();
    await profileStore.updateConfig({ emailVerifiedAt: nowIso });
};

watch(user, async () => {
    if (user.value) {
        await completeVerification();
        return navigateTo('/dashboard');
    }
}, { immediate: true });
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
