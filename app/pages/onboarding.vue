<template>
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative">
        <div class="max-w-md w-full transition-all duration-500 ease-in-out">
            <!-- Icon / Logo Area -->
            <div
                class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-purple-200/50 mb-8 mx-auto dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:shadow-purple-900/20">
                <Wallet class="w-10 h-10 text-purple-500" :stroke-width="1.5" />
            </div>

            <!-- Step 1: Language Selection -->
            <div v-if="currentStep === 'language'" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome') }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('settings.language') }}</p>

                <div class="grid grid-cols-2 gap-4">
                    <button v-for="lang in languages" :key="lang.code" @click="handleSelectLanguage(lang.code)"
                        class="p-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/80 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-3 dark:bg-white/5 dark:border-white/10 group">
                        <span class="text-3xl group-hover:scale-110 transition-transform">{{ lang.flag }}</span>
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ lang.name }}</span>
                    </button>
                </div>
            </div>

            <!-- Step 2: Budget Setting -->
            <div v-else-if="currentStep === 'budget'" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome')
                }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('onboarding.tagline') }}</p>

                <GlassCard variant="glass" class="p-8 dark:bg-white/5 dark:border-white/10">
                    <label
                        class="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest dark:text-slate-500">
                        {{ t('onboarding.monthly_budget') }}
                    </label>
                    <div class="relative mb-8">
                        <span
                            class="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-medium text-slate-400 dark:text-slate-500">{{
                                state.config.currencySymbol }}</span>
                        <input v-model="budgetInput" type="number"
                            class="w-full bg-transparent border-b-2 border-slate-200/50 py-2 pl-8 text-5xl font-bold text-slate-800 focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-200 dark:text-white dark:border-white/10 dark:placeholder-slate-700"
                            placeholder="0" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <GlassButton :full-width="true" @click="handleSetBudget" :disabled="!budgetInput">
                            {{ t('onboarding.start_journey') }}
                        </GlassButton>
                        <button @click="currentStep = 'language'"
                            class="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2">
                            {{ t('common.back') }}
                        </button>
                    </div>
                </GlassCard>
            </div>

            <!-- Step 3: Completing / Setup Screen -->
            <div v-else-if="currentStep === 'completing'" class="animate-in fade-in duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome') }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('common.loading') }}</p>

                <GlassCard variant="glass" class="p-12 dark:bg-white/5 dark:border-white/10">
                    <div class="flex flex-col items-center gap-6">
                        <!-- Animated pulse circles -->
                        <div class="relative w-20 h-20">
                            <div class="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
                            <div class="absolute inset-0 rounded-full bg-purple-500/40 animate-pulse"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-12 h-12 rounded-full bg-purple-500"></div>
                            </div>
                        </div>
                        <p class="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                            Setting up your budget...
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Wallet } from 'lucide-vue-next';

// Use storage
const { state, updateConfig } = useStorage();
const { t, setLocale } = useI18n();

const budgetInput = ref('');
const currentStep = ref<'language' | 'budget' | 'completing'>('language');

const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

// Redirect if already complete - but not if we're in completing state
watchEffect(() => {
    if (state.value.config?.onboardingComplete && currentStep.value !== 'completing') {
        navigateTo('/dashboard');
    }
});

const handleSelectLanguage = async (code: string) => {
    await setLocale(code as any);
    await updateConfig({ language: code });
    currentStep.value = 'budget';
};

const handleSetBudget = async () => {
    const amount = Number(budgetInput.value);
    if (amount > 0) {
        // Immediately switch to completing state to prevent flash
        currentStep.value = 'completing';

        await updateConfig({
            monthlyLimit: amount,
            onboardingComplete: true
        });

        // Small delay to show the setup screen, then navigate
        await new Promise(resolve => setTimeout(resolve, 800));
        navigateTo('/');
    }
};
</script>
