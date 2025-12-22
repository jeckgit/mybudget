<script setup lang="ts">
import { Bell, ArrowUpRight, Wallet } from 'lucide-vue-next';


// Inject state directly from storage
const { state, loadState } = useStorage();
const user = useSupabaseUser();
const { t } = useI18n();

const displayName = computed(() => {
    if (!user.value) return t('common.guest');
    return user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || t('common.user');
});

await useAsyncData('dashboard-state', async () => {
    await loadState();
    if (state.value.config && !state.value.config.onboardingComplete) {
        navigateTo('/onboarding');
    }
    return true;
});

const { formatCurrency, calculateBudgetData } = useBudget();

const budgetData = computed(() => calculateBudgetData(state.value));

const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Generate weekly spending data for the chart
const weeklySpendingData = computed(() => {
    const today = new Date();
    const weekData: number[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const daySpending = budgetData.value.monthTransactions
            .filter((t) => {
                const txDate = new Date(t.date);
                return txDate.toDateString() === date.toDateString();
            })
            .reduce((sum, tx) => sum + tx.amount, 0);

        weekData.push(daySpending);
    }

    return weekData;
});
const navigateToDetail = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    navigateTo(`/day/${dateStr}`);
};
</script>
<template>
    <div class="flex flex-col min-h-screen pb-32 px-6 pt-12">
        <!-- Top Header -->
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-4">
                <UserAvatar :name="displayName" :size="48" class="rounded-[0.8rem]" />
                <div>
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-wide dark:text-slate-400">{{
                        t('dashboard.good_morning') }}
                    </p>
                    <p class="text-xl font-bold text-slate-800 dark:text-white capitalize">{{ displayName }}</p>
                </div>
            </div>
        </div>

        <!-- Main Budget Card -->
        <GlassCard variant="featured"
            class="p-8 mb-8 relative text-slate-900 min-h-[220px] flex flex-col justify-between dark:text-white">
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <p class="text-slate-600 font-medium text-sm mb-2 dark:text-slate-300">{{
                        t('dashboard.spent_today') }}</p>
                    <h2 class="text-5xl font-bold tracking-tighter">
                        {{ formatCurrency(budgetData.spentToday, state.config.currencySymbol) }}
                    </h2>
                </div>
                <div
                    class="bg-white/40 backdrop-blur-md pl-3 pr-4 py-1.5 rounded-full flex items-center gap-2 border border-white/50 dark:bg-white/10 dark:border-white/20">
                    <div :class="['w-2 h-2 rounded-full', budgetData.isOverBudget ? 'bg-red-400' : 'bg-green-400']" />
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ budgetData.isOverBudget ?
                        t('dashboard.over_budget') : t('dashboard.on_track')
                        }}</span>
                </div>
            </div>

            <div class="flex items-end justify-between relative z-10 mt-6">
                <div>
                    <p class="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide dark:text-slate-400">
                        {{ t('dashboard.monthly_goal') }}</p>
                    <p class="font-bold text-xl text-slate-800 opacity-80 dark:text-white">
                        {{ formatCurrency(state.config.monthlyLimit, state.config.currencySymbol) }}
                    </p>
                </div>
                <div @click="navigateToDetail"
                    class="w-14 h-14 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg shadow-purple-900/5 text-slate-700 active:scale-90 transition-all cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20">
                    <ArrowUpRight :size="24" />
                </div>
            </div>

            <!-- Decorative Elements -->
            <div class="absolute -right-12 -bottom-24 opacity-30 pointer-events-none mix-blend-overlay">
                <HaloRing :size="320" :stroke-width="60" :progress="0.65" color="white"
                    track-color="rgba(255,255,255,0.1)" />
            </div>
        </GlassCard>
        <!-- Day Selector -->
        <DaySelector />
    </div>
</template>
