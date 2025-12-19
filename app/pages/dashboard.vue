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
            <button
                class="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm text-slate-600 active:scale-95 transition-transform dark:text-white dark:bg-white/10 dark:border-white/20">
                <Bell :size="20" />
            </button>
        </div>

        <!-- Main Budget Card -->
        <GlassCard variant="featured"
            class="p-8 mb-8 relative text-slate-900 min-h-[220px] flex flex-col justify-between dark:text-white">
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <p class="text-slate-600 font-medium text-sm mb-2 dark:text-slate-300">{{
                        t('dashboard.available_daily') }}</p>
                    <h2 class="text-5xl font-bold tracking-tighter">
                        {{ formatCurrency(budgetData.remainingToday, state.config.currencySymbol) }}
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
                <div
                    class="w-14 h-14 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg shadow-purple-900/5 text-slate-700 dark:text-white dark:bg-white/10 dark:border-white/20">
                    <ArrowUpRight :size="24" />
                </div>
            </div>

            <!-- Decorative Elements -->
            <div class="absolute -right-12 -bottom-24 opacity-30 pointer-events-none mix-blend-overlay">
                <HaloRing :size="320" :stroke-width="60" :progress="0.65" color="white"
                    track-color="rgba(255,255,255,0.1)" />
            </div>
        </GlassCard>

        <!-- Analytics Teaser -->
        <div class="flex gap-4 mb-8 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            <GlassCard variant="glass" class="min-w-[180px] p-5 flex-1">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm font-bold text-slate-700 dark:text-white">{{ t('dashboard.spending') }}</span>
                    <span
                        class="text-[10px] font-bold bg-white/40 px-2 py-1 rounded-full text-slate-500 dark:bg-white/10 dark:text-slate-400">{{
                            t('dashboard.week') }}</span>
                </div>
                <SimpleBarChart :data="weeklySpendingData" />
            </GlassCard>

            <GlassCard variant="glass" class="min-w-[180px] p-5 flex-1 flex flex-col justify-between">
                <div class="flex justify-between items-start mb-2">
                    <div
                        class="p-3 bg-green-100/50 backdrop-blur-sm text-green-600 rounded-2xl dark:bg-green-900/30 dark:text-green-400">
                        <Wallet :size="20" />
                    </div>
                </div>
                <div>
                    <p class="text-3xl font-bold text-slate-800 mb-1 dark:text-white">85%</p>
                    <p class="text-xs text-slate-400 font-bold uppercase dark:text-slate-500">{{
                        t('dashboard.budget_health') }}</p>
                </div>
            </GlassCard>
        </div>

        <!-- Recent Transactions -->
        <div class="flex justify-between items-center mb-5 px-1">
            <h3 class="font-bold text-xl text-slate-800 dark:text-white">{{ t('dashboard.recent') }}</h3>
            <button
                class="text-sm text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full dark:bg-white/10 dark:text-white">{{
                    t('common.see_all') }}</button>
        </div>

        <div class="space-y-3">
            <GlassCard v-for="tx in budgetData.monthTransactions.slice(0, 5)" :key="tx.id" variant="white"
                class="flex items-center justify-between p-4 !rounded-[1.5rem] !bg-white/60 dark:!bg-white/5 dark:!border dark:!border-white/10">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm border border-white dark:bg-white/10 dark:border-white/5 dark:text-white">
                        {{ tx.category || '💸' }}
                    </div>
                    <div>
                        <p class="font-bold text-slate-800 text-sm dark:text-white">{{ tx.note ||
                            t('dashboard.default_note') }}</p>
                        <p class="text-xs text-slate-400 font-medium dark:text-slate-400">{{ formatTime(tx.date) }}</p>
                    </div>
                </div>
                <span class="font-bold text-slate-800 dark:text-white">-${{ tx.amount }}</span>
            </GlassCard>

            <div v-if="budgetData.monthTransactions.length === 0"
                class="text-center py-12 text-slate-400 bg-white/30 backdrop-blur-md rounded-[2rem] border border-dashed border-white/50 dark:text-slate-500 dark:bg-white/5 dark:border-white/10">
                {{ t('dashboard.no_transactions') }}
            </div>
        </div>
    </div>
</template>
