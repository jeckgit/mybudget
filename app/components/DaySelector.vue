<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const { state } = useStorage();
const { t, locale } = useI18n();

const scrollRef = ref<HTMLElement | null>(null);
const currentMonthDate = ref(new Date());

onMounted(async () => {
    // State is loaded by parent page/app.vue - no need to call loadState here
    // Just scroll to today if needed
    if (isToday(new Date())) {
        scrollToToday();
    }
});

// Month Picker State
const showMonthPicker = ref(false);
const pickerYear = ref(new Date().getFullYear());

const months = computed(() => {
    const formatter = new Intl.DateTimeFormat(locale.value, { month: 'short' });
    return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(2000, i, 1);
        return {
            index: i,
            name: formatter.format(date)
        };
    });
});

const toggleMonthPicker = () => {
    if (!showMonthPicker.value) {
        pickerYear.value = currentMonthDate.value.getFullYear();
    }
    showMonthPicker.value = !showMonthPicker.value;
};

const changePickerYear = (delta: number) => {
    pickerYear.value += delta;
};

const selectMonth = (monthIndex: number) => {
    currentMonthDate.value = new Date(pickerYear.value, monthIndex, 1);
    showMonthPicker.value = false;
};

// Calculate daily spending from transactions
const dayMoneyMap = computed(() => {
    const map = new Map<string, number>();
    state.value.transactions.forEach(tx => {
        if (!tx.date) return;
        const localDate = new Date(tx.date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;
        map.set(key, (map.get(key) || 0) + tx.amount);
    });
    return map;
});

// Generate all days for the current month
const visibleDays = computed(() => {
    const year = currentMonthDate.value.getFullYear();
    const month = currentMonthDate.value.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(year, month, i + 1);
    });
});

const dailyBudget = computed(() => {
    const daysInMonth = visibleDays.value.length;
    return state.value.config.monthlyLimit / (daysInMonth || 1);
});

// Calculate rollover budget for each day
// Formula: budget_for_day_i = (i * dailyBudget) - total_spent_until_day_i-1
const rolloverData = computed(() => {
    const map = new Map<string, { spent: number; available: number }>();
    let totalSpentUntilNow = 0;

    visibleDays.value.forEach((date, index) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;

        const daySpent = dayMoneyMap.value.get(key) || 0;

        // Available budget for today = (Days so far * Daily Budget) - Total spent including today
        // Wait, the user said: "Budget for Tuesday is 15 if I spend 5 on Monday (Budget 10/day)"
        // So Available(Monday) = 10. Spent(Monday) = 5.
        // Available(Tuesday) = 10 + (10 - 5) = 15.
        // General: Available(Day i) = DailyBudget + (Available(Day i-1) - Spent(Day i-1))
        // Which simplifies to: Available(Day i) = (i * DailyBudget) - (Total Spent until Day i-1)

        const available = ((index + 1) * dailyBudget.value) - totalSpentUntilNow;

        map.set(key, {
            spent: daySpent,
            available: available
        });

        totalSpentUntilNow += daySpent;
    });
    return map;
});

const getBudgetForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    return rolloverData.value.get(key) || { spent: 0, available: 0 };
};

const isToday = (date: Date) => {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
};

const scrollToToday = () => {
    if (scrollRef.value) {
        const todayIndex = visibleDays.value.findIndex(d => isToday(d));
        if (todayIndex !== -1) {
            const list = scrollRef.value.querySelector('.day-list');
            const element = list?.children[todayIndex] as HTMLElement;
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
};

const handleDayClick = (date: Date) => {
    // Navigate instantly to detail page
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    navigateTo(`/day/${dateStr}`);
};

const formatDay = (date: Date) => {
    return date.toLocaleDateString(locale.value, { weekday: 'short' });
};

const formatDate = (date: Date) => {
    return date.getDate();
};

const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' });
};
</script>

<template>
    <div class="w-full mx-auto mb-8">
        <GlassCard variant="white"
            class="overflow-hidden !rounded-[2.5rem] border border-white/60 shadow-xl shadow-purple-900/5 dark:!bg-white/5 dark:!border-white/10 dark:shadow-black/40">
            <!-- Header -->
            <div
                class="flex items-center justify-between px-6 py-5 border-b border-slate-100/50 bg-white/30 dark:border-white/5 dark:bg-white/5">
                <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-[0.15em]">
                    {{ formatMonthYear(currentMonthDate) }}
                </h3>
                <button @click="toggleMonthPicker" :class="['h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 active:scale-95 transition-all',
                    showMonthPicker
                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                        : 'bg-white/60 border-white/80 text-slate-600 dark:bg-white/10 dark:border-white/10 dark:text-slate-300'
                ]">
                    <CalendarDays :size="12" />
                    {{ showMonthPicker ? t('common.cancel') : t('day_selector.selected_date') }}
                </button>
            </div>

            <!-- Month Picker Modal -->
            <Teleport to="body">
                <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
                    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                    <div v-if="showMonthPicker"
                        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        @click="showMonthPicker = false">
                        <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-white/10"
                            @click.stop>
                            <!-- Modal Header -->
                            <div class="flex items-center justify-between mb-8">
                                <button @click="changePickerYear(-1)"
                                    class="p-3 hover:bg-slate-50 rounded-full dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors">
                                    <ChevronLeft class="w-6 h-6" />
                                </button>
                                <span class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{{
                                    pickerYear }}</span>
                                <button @click="changePickerYear(1)"
                                    class="p-3 hover:bg-slate-50 rounded-full dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors">
                                    <ChevronRight class="w-6 h-6" />
                                </button>
                            </div>

                            <!-- Months Grid -->
                            <div class="grid grid-cols-3 gap-3">
                                <button v-for="month in months" :key="month.index" @click="selectMonth(month.index)"
                                    :class="[
                                        'py-4 rounded-2xl text-sm font-bold transition-all duration-200',
                                        (month.index === currentMonthDate.getMonth() && pickerYear === currentMonthDate.getFullYear())
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:shadow-white/10 scale-105'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                                    ]">
                                    {{ month.name }}
                                </button>
                            </div>

                            <div class="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                <button @click="showMonthPicker = false"
                                    class="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                                    {{ t('common.cancel') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <!-- Scrollable Day List - Viewport fits ~5 items -->
            <div ref="scrollRef"
                class="h-[380px] overflow-y-auto overflow-x-hidden pt-4 pb-6 px-4 scrollbar-hide snap-y snap-mandatory"
                style="-webkit-overflow-scrolling: touch;">
                <div class="flex flex-col gap-3 day-list">
                    <button v-for="(date, index) in visibleDays" :key="index" @click="handleDayClick(date)" :class="[
                        'w-full p-4 flex items-center gap-4 rounded-[1.8rem] transition-all duration-300 border active:scale-[0.98] snap-center',
                        isToday(date)
                            ? 'bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-200 dark:bg-white/15 dark:text-white dark:border-white/20 dark:shadow-purple-900/20'
                            : 'bg-white border-slate-100 text-slate-700 shadow-sm shadow-slate-200/50 hover:bg-slate-50 dark:bg-white/5 dark:border-white/5 dark:text-slate-300'
                    ]">
                        <!-- Left: Date -->
                        <div class="flex flex-col items-center min-w-[50px]">
                            <span
                                :class="['text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-60', isToday(date) ? 'text-white/70 dark:text-white/60' : 'text-slate-400']">
                                {{ formatDay(date) }}
                            </span>
                            <span class="text-xl font-bold leading-none tracking-tighter">{{ formatDate(date) }}</span>
                        </div>

                        <!-- Divider -->
                        <div
                            :class="['h-10 w-[1px]', isToday(date) ? 'bg-white/20 dark:bg-white/10' : 'bg-slate-100 dark:bg-white/5']" />

                        <!-- Center: Available Budget (Dominant) -->
                        <div class="flex-1 flex flex-col items-center">
                            <span
                                :class="['text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60', isToday(date) ? 'text-white/60' : 'text-slate-400']">
                                {{ getBudgetForDate(date).available >= 0 ? t('day_selector.available') :
                                    t('day_selector.over') }}
                            </span>
                            <div :class="[
                                'text-2xl font-black tracking-tighter transition-colors',
                                getBudgetForDate(date).available >= 0
                                    ? (isToday(date) ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400')
                                    : (isToday(date) ? 'text-rose-400' : 'text-rose-600 dark:text-rose-400')
                            ]">
                                <span>{{ state.config.currencySymbol }}</span>
                                {{ Math.abs(getBudgetForDate(date).available).toFixed(2) }}
                            </div>
                        </div>

                        <!-- Right: Spent (Secondary) -->
                        <div class="flex flex-col items-end min-w-[60px]">
                            <span class="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-0.5">
                                {{ t('dashboard.spending') }}
                            </span>
                            <span
                                :class="['text-xs font-bold tracking-tight', isToday(date) ? 'text-white/80' : 'text-slate-500']">
                                {{ getBudgetForDate(date).spent.toFixed(2) }}
                            </span>
                        </div>
                    </button>
                </div>
            </div>
        </GlassCard>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
