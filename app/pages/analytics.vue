<script setup lang="ts">
import { ChevronLeft, Coffee, MoreHorizontal, ShoppingBag } from 'lucide-vue-next';
import type { AppState } from '~/types';

// Inject state from layout
const state = inject<Ref<AppState>>('appState');

if (!state) {
    throw new Error('AppState not provided');
}

const { formatCurrency, calculateBudgetData } = useBudget();

const budgetData = computed(() => calculateBudgetData(state.value));

// Generate daily data for the current month
const dailyData = computed(() => {
    const data: { day: number; amount: number }[] = [];
    for (let i = 1; i <= budgetData.value.daysInMonth; i++) {
        data.push({ day: i, amount: 0 });
    }

    budgetData.value.monthTransactions.forEach((t) => {
        const d = new Date(t.date).getDate();
        const dayData = data[d - 1];
        if (dayData) {
            dayData.amount += t.amount;
        }
    });

    return data;
});

// Generate category spending data
const categoryData = computed(() => {
    const categories = new Map();

    budgetData.value.monthTransactions.forEach((tx) => {
        const cat = tx.category || '🛍️';
        categories.set(cat, (categories.get(cat) || 0) + tx.amount);
    });

    const total = Array.from(categories.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categories.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
    }));
});

const categories = computed(() =>
    [
        {
            name: 'Shopping',
            icon: ShoppingBag,
            bgColor: 'bg-pink-50 text-pink-500',
            color: '#F472B6',
            percentage: categoryData.value.find((c) => c.category === '🛍️')?.percentage || 0,
            amount: categoryData.value.find((c) => c.category === '🛍️')?.amount || 0
        },
        {
            name: 'Food',
            icon: Coffee,
            bgColor: 'bg-orange-50 text-orange-500',
            color: '#F87171',
            percentage: categoryData.value.find((c) => c.category === '🍔')?.percentage || 0,
            amount: categoryData.value.find((c) => c.category === '🍔')?.amount || 0
        },
        {
            name: 'Transport',
            icon: ShoppingBag,
            bgColor: 'bg-blue-50 text-blue-500',
            color: '#60A5FA',
            percentage: categoryData.value.find((c) => c.category === '🚗')?.percentage || 0,
            amount: categoryData.value.find((c) => c.category === '🚗')?.amount || 0
        },
        {
            name: 'Entertainment',
            icon: Coffee,
            bgColor: 'bg-purple-50 text-purple-500',
            color: '#C084FC',
            percentage: categoryData.value.find((c) => c.category === '🎬')?.percentage || 0,
            amount: categoryData.value.find((c) => c.category === '🎬')?.amount || 0
        }
    ].filter((cat) => cat.amount > 0)
);
</script>
<template>
    <div class="min-h-screen pb-32 px-6 pt-12">
        <div class="flex items-center gap-4 mb-8">
            <NuxtLink to="/"
                class="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center border border-white/50">
                <ChevronLeft :size="24" class="text-slate-600" />
            </NuxtLink>
            <h2 class="text-2xl font-bold text-slate-800">Statistics</h2>
            <div
                class="ml-auto w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-sm border border-white/50">
                <MoreHorizontal :size="20" class="text-slate-500" />
            </div>
        </div>

        <GlassCard variant="glass" class="p-6 mb-6">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <p class="text-sm text-slate-500 font-medium mb-1">Total Spent</p>
                    <h3 class="text-3xl font-bold text-slate-800">
                        {{ formatCurrency(budgetData.totalSpentMonth, state.config.currencySymbol) }}
                    </h3>
                </div>
                <div class="h-14 w-14 relative">
                    <HaloRing :size="56" :stroke-width="6"
                        :progress="budgetData.totalSpentMonth / state.config.monthlyLimit" color="#F472B6"
                        track-color="rgba(0,0,0,0.05)" />
                    <span
                        class="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-600">
                        {{ Math.round((budgetData.totalSpentMonth / state.config.monthlyLimit) * 100) }}%
                    </span>
                </div>
            </div>

            <SpendingChart :data="dailyData" :daily-limit="budgetData.avgDaily" />
        </GlassCard>

        <h3 class="font-bold text-lg text-slate-800 mb-4 px-1">Categories</h3>
        <div class="space-y-3">
            <GlassCard v-for="cat in categories" :key="cat.name" variant="white"
                class="flex items-center justify-between p-4 !rounded-[1.5rem] !bg-white/50">
                <div class="flex items-center gap-4">
                    <div :class="[
                        'w-12 h-12 rounded-2xl flex items-center justify-center border border-white/60 shadow-sm',
                        cat.bgColor
                    ]">
                        <component :is="cat.icon" :size="20" />
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-slate-700 text-sm">{{ cat.name }}</p>
                        <div class="w-24 h-1.5 bg-slate-200/50 rounded-full mt-2 overflow-hidden">
                            <div class="h-full rounded-full"
                                :style="{ width: cat.percentage + '%', backgroundColor: cat.color }" />
                        </div>
                    </div>
                </div>
                <span class="font-bold text-slate-800">${{ Math.round(cat.amount) }}</span>
            </GlassCard>

            <div v-if="categories.length === 0"
                class="text-center py-12 text-slate-400 bg-white/30 backdrop-blur-md rounded-[2rem] border border-dashed border-white/50">
                No spending data yet
            </div>
        </div>
    </div>
</template>
