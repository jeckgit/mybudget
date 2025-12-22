<template>
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative">
        <div class="max-w-md w-full">
            <div
                class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-purple-200/50 mb-8 mx-auto dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:shadow-purple-900/20">
                <Wallet class="w-10 h-10 text-purple-500" :stroke-width="1.5" />
            </div>

            <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{ t('onboarding.welcome')
                }}</h1>
            <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('onboarding.tagline') }}</p>

            <GlassCard variant="glass" class="p-8 dark:bg-white/5 dark:border-white/10">
                <label
                    class="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest dark:text-slate-500">
                    {{ t('onboarding.monthly_goal') }}
                </label>
                <div class="relative mb-8">
                    <span
                        class="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-medium text-slate-400 dark:text-slate-500">{{
                            state.config.currencySymbol }}</span>
                    <input v-model="budgetInput" type="number"
                        class="w-full bg-transparent border-b-2 border-slate-200/50 py-2 pl-8 text-5xl font-bold text-slate-800 focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-200 dark:text-white dark:border-white/10 dark:placeholder-slate-700"
                        placeholder="0" />
                </div>
                <GlassButton :full-width="true" @click="handleSetBudget" :disabled="!budgetInput">
                    {{ t('onboarding.start_journey') }}
                </GlassButton>
            </GlassCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Wallet } from 'lucide-vue-next';

// Use storage
const { state, updateConfig } = useStorage();
const { t } = useI18n();

const budgetInput = ref('');

// Redirect if already complete
watchEffect(() => {
    if (state.value.config?.onboardingComplete) {
        navigateTo('/dashboard');
    }
});

const handleSetBudget = async () => {
    const amount = Number(budgetInput.value);
    if (amount > 0) {
        await updateConfig({
            monthlyLimit: amount,
            onboardingComplete: true
        });
        navigateTo('/');
    }
};
</script>
