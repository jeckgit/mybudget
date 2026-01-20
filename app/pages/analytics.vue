<script setup lang="ts">
// Use storage directly
const { state, loadState } = useStorage();
const { t, locale } = useI18n();

useHead({ title: t('common.analytics') })
import { ChevronLeft, ChevronRight, MoreHorizontal, FileDown, FileJson } from 'lucide-vue-next';
import { onClickOutside } from '@vueuse/core';

const { categories, getCategoryName } = useCategories();
const { calculateBudgetData } = useBudget();
const { formatCurrency } = useCurrency();

// Month Navigation State
const currentDate = ref(new Date());
const isMenuOpen = ref(false);
const menuRef = ref(null);

onClickOutside(menuRef, () => {
    isMenuOpen.value = false;
});

const currentMonthLabel = computed(() => {
    return currentDate.value.toLocaleString(locale.value, { month: 'long', year: 'numeric' });
});

const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

// Ensure state is loaded (calls loadState which has built-in dedup)
await loadState();

const budgetData = computed(() => calculateBudgetData(state.value, currentDate.value));

// Generate daily data for the selected month
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
const categorySpendingMap = computed(() => {
    const map = new Map<string, number>();

    budgetData.value.monthTransactions.forEach((tx) => {
        const catId = tx.category || 'other';
        map.set(catId, (map.get(catId) || 0) + tx.amount);
    });

    return map;
});

const totalSpent = computed(() =>
    Array.from(categorySpendingMap.value.values()).reduce((sum, val) => sum + val, 0)
);

const categoryStats = computed(() => {
    return categories.value.map(cat => {
        const amount = categorySpendingMap.value.get(cat.id) || 0;
        return {
            ...cat,
            amount,
            percentage: totalSpent.value > 0 ? (amount / totalSpent.value) * 100 : 0
        };
    }).filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount);
});

// Export Logic
const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

const exportAsCSV = () => {
    const headers = ["Date", "Amount", "Category", "Note"];
    const rows = budgetData.value.monthTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.amount,
        getCategoryName(categories.value.find(c => c.id === t.category)) || t.category,
        t.note || ""
    ]);

    const csvContent = [headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const monthStr = currentDate.value.toLocaleString('en', { month: 'short', year: 'numeric' }).replace(' ', '_');
    downloadFile(csvContent, `MySaldo_Expenses_${monthStr}.csv`, "text/csv");
    isMenuOpen.value = false;
};

const exportAsJSON = () => {
    const data = budgetData.value.monthTransactions.map(t => ({
        date: t.date,
        amount: t.amount,
        category: getCategoryName(categories.value.find(c => c.id === t.category)) || t.category,
        note: t.note
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    const monthStr = currentDate.value.toLocaleString('en', { month: 'short', year: 'numeric' }).replace(' ', '_');
    downloadFile(jsonContent, `MySaldo_Expenses_${monthStr}.json`, "application/json");
    isMenuOpen.value = false;
};
</script>

<template>
    <div class="min-h-dvh pb-32 px-6 pt-12">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <NuxtLink to="/"
                class="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center border border-white/50 dark:bg-white/10 dark:border-white/20">
                <ChevronLeft :size="24" class="text-slate-600 dark:text-white" />
            </NuxtLink>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">{{ t('analytics.title') }}</h2>

            <!-- More Menu -->
            <div class="ml-auto relative" ref="menuRef">
                <button @click="isMenuOpen = !isMenuOpen"
                    class="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-sm border border-white/50 dark:bg-white/10 dark:border-white/20 active:scale-95 transition-all">
                    <MoreHorizontal :size="20" class="text-slate-500 dark:text-white" />
                </button>

                <!-- Dropdown -->
                <Transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="transform scale-95 opacity-0 -translate-y-2"
                    enter-to-class="transform scale-100 opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="transform scale-100 opacity-100 translate-y-0"
                    leave-to-class="transform scale-95 opacity-0 -translate-y-2">
                    <div v-if="isMenuOpen"
                        class="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-purple-900/5 z-100 overflow-hidden dark:bg-slate-900/90 dark:border-white/10">
                        <div class="p-2 space-y-1">
                            <button @click="exportAsCSV"
                                class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <FileDown :size="18" class="text-purple-500" />
                                {{ t('analytics.export_csv') }}
                            </button>
                            <button @click="exportAsJSON"
                                class="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <FileJson :size="18" class="text-blue-500" />
                                {{ t('analytics.export_json') }}
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Month Selector -->
        <div class="flex items-center justify-between mb-6 px-1">
            <button @click="prevMonth"
                class="p-2 rounded-xl bg-white/40 border border-white/50 dark:bg-white/5 dark:border-white/10 active:scale-95 transition-all text-slate-600 dark:text-slate-400">
                <ChevronLeft :size="20" />
            </button>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{ currentMonthLabel }}</h3>
            <button @click="nextMonth"
                class="p-2 rounded-xl bg-white/40 border border-white/50 dark:bg-white/5 dark:border-white/10 active:scale-95 transition-all text-slate-600 dark:text-slate-400">
                <ChevronRight :size="20" />
            </button>
        </div>

        <!-- Main Stats Card -->
        <GlassCard variant="glass" class="p-6 mb-6 dark:bg-white/5 dark:border-white/10 overflow-hidden">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{{
                        t('analytics.total_spent') }}</p>
                    <h3 class="text-3xl font-bold text-slate-800 dark:text-white">
                        {{ formatCurrency(budgetData.totalSpentMonth, state.config.currency) }}
                    </h3>
                </div>
                <!-- Mini Halo for target progress -->
                <div v-if="state.config.monthlyLimit > 0" class="h-12 w-12 relative">
                    <HaloRing :size="48" :stroke-width="5"
                        :progress="budgetData.totalSpentMonth / state.config.monthlyLimit" color="#C084FC"
                        track-color="rgba(0,0,0,0.05)" />
                    <span
                        class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {{ Math.round((budgetData.totalSpentMonth / state.config.monthlyLimit) * 100) }}%
                    </span>
                </div>
            </div>

            <SpendingChart :data="dailyData" :daily-limit="budgetData.avgDaily" />
        </GlassCard>

        <!-- Category Visualization Section -->
        <div v-if="categoryStats.length > 0" class="mb-8">
            <h3 class="font-bold text-lg text-slate-800 mb-4 px-1 dark:text-white">{{ t('analytics.categories') }}</h3>

            <GlassCard variant="glass" class="p-6 mb-6 dark:bg-white/5 dark:border-white/10">
                <CategoryDonutChart :data="categoryStats" :total="totalSpent" :currency-code="state.config.currency" />
            </GlassCard>

            <!-- Unified Insight List -->
            <GlassCard variant="white" class="p-0! overflow-hidden dark:bg-white/5! dark:border-white/10!">
                <div v-for="(cat, index) in categoryStats" :key="cat.id"
                    class="group relative p-4 flex items-center gap-4 border-b border-slate-100 dark:border-white/5 last:border-0 transition-all hover:bg-purple-50/50 dark:hover:bg-white/5">

                    <!-- Rank / Icon -->
                    <div
                        class="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-white/5 font-bold text-lg shadow-sm border border-slate-100 dark:border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {{ cat.emoji }}
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-slate-700 dark:text-white text-sm truncate">{{
                                getCategoryName(cat) }}</span>
                            <div class="text-right flex items-center gap-2">
                                <span
                                    class="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
                                    {{ Math.round(cat.percentage) }}%
                                </span>
                                <span class="font-bold text-slate-800 dark:text-white tabular-nums text-sm">
                                    {{ formatCurrency(cat.amount, state.config.currency, false) }}
                                </span>
                            </div>
                        </div>

                        <!-- Sleek Bar -->
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
                            <div class="h-full rounded-full bg-slate-800 dark:bg-white group-hover:bg-purple-500 transition-colors duration-300"
                                :style="{ width: cat.percentage + '%', opacity: 0.8 }" />
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>

        <!-- No Data State -->
        <div v-else
            class="text-center py-20 text-slate-400 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/50 dark:text-slate-500 dark:bg-white/5 dark:border-white/10">
            <div class="text-4xl mb-4">📊</div>
            <p class="font-medium px-8">{{ t('analytics.no_data') }}</p>
        </div>
    </div>
</template>
