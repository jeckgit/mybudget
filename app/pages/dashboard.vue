<script setup lang="ts">



// Inject state directly from storage
const { state, loadState, getMonthConfig } = useStorage();
const user = useSupabaseUser();
const { t } = useI18n();

const displayName = computed(() => {
    if (!user.value) return t('common.guest');
    return user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || t('common.user');
});

// Ensure state is loaded (calls loadState which has built-in dedup)
await loadState();

// Redirect to onboarding if not completed
if (state.value.config && !state.value.config.onboardingComplete) {
    navigateTo('/onboarding');
}

const { calculateBudgetData } = useBudget();
const { formatCurrency } = useCurrency();

const budgetData = computed(() => calculateBudgetData(state.value));

const currentMonthBudget = computed(() => {
    return getMonthConfig(new Date().toISOString()).budget;
});

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
        <!-- Main Budget Card -->
        <GlassCard variant="featured" class="p-6 mb-8 relative text-slate-900 dark:text-white overflow-hidden">
            <div class="relative z-10 flex flex-row items-end justify-between w-full">
                <div>
                    <p class="text-slate-600 font-medium text-sm mb-1 dark:text-slate-300">{{
                        t('dashboard.spent_today') }}</p>
                    <h2 class="text-4xl font-bold tracking-tighter">
                        {{ formatCurrency(budgetData.spentToday, state.config.currency) }}
                    </h2>
                </div>

                <div class="text-right">
                    <p class="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide dark:text-slate-400">
                        {{ t('dashboard.monthly_budget') }}</p>
                    <p class="font-bold text-lg text-slate-800 opacity-80 dark:text-white">
                        {{ formatCurrency(currentMonthBudget, state.config.currency) }}
                    </p>
                </div>
            </div>

            <!-- Decorative Elements -->
            <div class="absolute -right-10 -bottom-12 opacity-40 pointer-events-none mix-blend-overlay">
                <HaloRing :size="140" :stroke-width="30" :progress="0.65" color="white"
                    track-color="rgba(255,255,255,0.1)" />
            </div>
        </GlassCard>
        <!-- Day Selector -->
        <DaySelector />
    </div>
</template>
