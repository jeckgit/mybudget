<template>
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative">
        <div class="max-w-md w-full">
            <div
                class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-purple-200/50 mb-8 mx-auto">
                <Wallet class="w-10 h-10 text-purple-500" :stroke-width="1.5" />
            </div>

            <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight">Lume</h1>
            <p class="text-slate-500 mb-10 font-medium">Mindful spending, liquid clarity.</p>

            <GlassCard variant="glass" class="p-8">
                <label class="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                    Monthly Goal
                </label>
                <div class="relative mb-8">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-medium text-slate-400">$</span>
                    <input v-model="budgetInput" type="number"
                        class="w-full bg-transparent border-b-2 border-slate-200/50 py-2 pl-8 text-5xl font-bold text-slate-800 focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-200"
                        placeholder="0" />
                </div>
                <GlassButton :full-width="true" @click="handleSetBudget" :disabled="!budgetInput">
                    Start Journey
                </GlassButton>
            </GlassCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Wallet } from 'lucide-vue-next';
import type { AppState } from '~/types';

// Use storage
const { state, updateConfig } = useStorage();

const budgetInput = ref('');

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
