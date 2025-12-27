<script setup lang="ts">
const { t } = useI18n();

const links = [
    { name: 'legal.imprint', path: '/legal/imprint' },
    { name: 'legal.privacy', path: '/legal/privacy' }
];
</script>

<template>
    <div class="min-h-screen pt-20 pb-24 px-6 md:px-0">
        <GlassCard variant="white" class="max-w-xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header class="mb-8">
                <NuxtLink to="/profile"
                    class="inline-flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 text-sm font-medium">
                    ← {{ t('legal.back') }}
                </NuxtLink>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-white">{{ t('legal.title') }}</h1>
            </header>

            <div class="space-y-4">
                <NuxtLink v-for="link in links" :key="link.path" :to="link.path"
                    class="block p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-100 dark:border-white/5">
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ t(link.name) }}</span>
                </NuxtLink>
            </div>
        </GlassCard>
    </div>
</template>
