<template>
    <div class="p-6 pb-32 max-w-lg mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">{{ t('settings.title') }}</h1>
        </header>

        <div class="space-y-6">
            <!-- Preferences -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{{ t('settings.preferences')
                    }}</h2>
                <GlassCard variant="white" class="p-4 !rounded-2xl space-y-4 dark:!bg-slate-800/80">

                    <!-- Language -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Globe class="w-5 h-5" />
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.language')
                                }}</span>
                        </div>
                        <select :value="locale" @change="updateLanguage(($event.target as HTMLSelectElement).value)"
                            class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                                {{ lang.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Theme -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Moon class="w-5 h-5" v-if="colorMode.value === 'dark'" />
                                <Sun class="w-5 h-5" v-else-if="colorMode.value === 'light'" />
                                <Monitor class="w-5 h-5" v-else />
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.theme')
                                }}</span>
                        </div>
                        <div class="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button v-for="theme in ['light', 'system', 'dark']" :key="theme"
                                @click="updateTheme(theme)" class="p-2 rounded-md transition-all"
                                :class="colorMode.preference === theme ? 'bg-white dark:bg-slate-600 shadow-sm text-purple-600 dark:text-purple-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                                :title="t(`settings.themes.${theme}`)">
                                <Sun class="w-4 h-4" v-if="theme === 'light'" />
                                <Monitor class="w-4 h-4" v-if="theme === 'system'" />
                                <Moon class="w-4 h-4" v-if="theme === 'dark'" />
                            </button>
                        </div>
                    </div>

                    <!-- Currency -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span class="text-lg font-bold">$</span>
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.currency')
                                }}</span>
                        </div>
                        <div class="flex gap-2">
                            <button v-for="c in currencies" :key="c" @click="state.config.currencySymbol = c"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                                :class="state.config.currencySymbol === c ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700'">
                                {{ c }}
                            </button>
                        </div>
                    </div>

                </GlassCard>
            </section>

            <!-- Data -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{{ t('settings.data') }}</h2>
                <GlassCard variant="white" class="p-4 !rounded-2xl dark:!bg-slate-800/80">
                    <button @click="handleReset"
                        class="w-full flex items-center justify-between p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                <Trash2 class="w-5 h-5" />
                            </div>
                            <span class="font-medium">{{ t('settings.reset_data') }}</span>
                        </div>
                    </button>
                </GlassCard>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Trash2, Globe, Moon, Sun, Monitor } from 'lucide-vue-next';
import type { AppState } from '~/types';

const { loadState, clearState } = useStorage();
const state = inject('appState') as Ref<AppState>;
const { t, locale, setLocale } = useI18n();
const colorMode = useColorMode();

const currencies = ['$', '€', '£', '¥', 'CHF'];
const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
];

const handleReset = async () => {
    if (confirm(t('settings.reset_confirm'))) {
        await clearState();
        state.value = await loadState();
        navigateTo('/onboarding');
    }
};

const updateLanguage = (code: string) => {
    setLocale(code as any);
    state.value.config.language = code;
};

const updateTheme = (theme: string) => {
    colorMode.preference = theme;
    state.value.config.theme = theme;
};

// Sync local state with global settings on mount
onMounted(() => {
    if (state.value.config.language && state.value.config.language !== locale.value) {
        setLocale(state.value.config.language as any);
    }
    if (state.value.config.theme) {
        colorMode.preference = state.value.config.theme;
    }
});
</script>
