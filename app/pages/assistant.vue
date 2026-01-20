<script setup lang="ts">
import { Sparkles, Bot } from 'lucide-vue-next';
const { t } = useI18n();
useHead({ title: t('assistant.title') })
</script>

<template>
    <div class="flex flex-col min-h-dvh px-6 pt-12 pb-32">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">{{ t('assistant.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400">{{ t('assistant.subtitle') }}</p>
        </header>

        <GlassCard variant="featured"
            class="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 rounded-3xl! border-dashed border-2 bg-white/30! dark:bg-white/5! border-slate-300 dark:border-white/10">

            <div class="relative">
                <div
                    class="w-24 h-24 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 animate-pulse">
                    <Bot class="w-12 h-12" />
                </div>
                <div class="absolute -top-2 -right-2">
                    <div class="bg-white dark:bg-slate-900 rounded-full p-2 shadow-lg">
                        <Sparkles class="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                </div>
            </div>

            <div class="max-w-xs mx-auto">
                <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-3">{{ t('assistant.coming_soon') }}</h2>
                <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {{ t('assistant.description') }}
                </p>
            </div>

            <button
                class="px-6 py-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                {{ t('assistant.notify_me') }}
            </button>
        </GlassCard>
    </div>
</template>
