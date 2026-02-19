<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { computed, nextTick, onMounted, ref } from 'vue';

const profileStore = useProfileStore();
const { t, locale } = useI18n();
const { formatCurrency } = useCurrency();
const { calculateMonthlyBreakdown } = useBudget();

const scrollRef = ref<HTMLElement | null>(null);
const currentMonthDate = ref(new Date());

const monthBreakdown = computed(() => {
    return calculateMonthlyBreakdown(currentMonthDate.value);
});

const visibleDays = computed(() => monthBreakdown.value.dailyBreakdown);

onMounted(async () => {
    if (isToday(new Date())) {
        scrollToToday();
    }
});

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

const getBudgetForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return visibleDays.value.find(d => d.key === key) || { spent: 0, available: 0, isSkipped: false };
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
        const todayIndex = visibleDays.value.findIndex(d => isToday(d.date));
        if (todayIndex !== -1) {
            const list = scrollRef.value.querySelector('.day-list');
            const element = list?.children[todayIndex] as HTMLElement;
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
};

const handleTodayClick = async () => {
    currentMonthDate.value = new Date();
    await nextTick();
    scrollToToday();
};

const handleDayClick = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
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

const isRolloverMode = computed(() => profileStore.config.value.showRollover);
const displayModeKey = computed(() => isRolloverMode.value ? 'rollover' : 'daily-balance');

const formatBudgetDisplay = (amount: number) => {
    const absAmount = Math.abs(amount);

    if (absAmount >= 1 || absAmount === 0) {
        return formatCurrency(Math.floor(absAmount), profileStore.config.value.currency, true);
    }

    return new Intl.NumberFormat(locale.value, {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(absAmount);
};
</script>

<template>
    <div class="w-full mx-auto mb-8">
        <GlassCard variant="white"
            class="overflow-hidden rounded-[2.5rem]! border border-white/60 shadow-xl shadow-purple-900/5 dark:bg-white/5! dark:border-white/10! dark:shadow-black/40">
            <!-- Header -->
            <div
                class="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-200/80 bg-white/50 backdrop-blur-md shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-white/5">
                <h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-[0.15em]">
                    {{ formatMonthYear(currentMonthDate) }}
                </h3>
                <div class="flex items-center gap-2">
                    <button @click="handleTodayClick"
                        class="h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white/60 border border-white/80 text-slate-600 dark:bg-white/10 dark:border-white/10 dark:text-slate-300 active:scale-95 transition-all">
                        {{ t('day_selector.today') }}
                    </button>

                    <button @click="toggleMonthPicker" :class="['h-8 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 active:scale-95 transition-all',
                        showMonthPicker
                            ? 'px-4 bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                            : 'w-8 justify-center bg-white/60 border-white/80 text-slate-600 dark:bg-white/10 dark:border-white/10 dark:text-slate-300'
                    ]">
                        <CalendarDays :size="12" />
                        <span v-if="showMonthPicker">{{ t('common.cancel') }}</span>
                    </button>
                </div>
            </div>

            <!-- Month Picker Modal -->
            <Teleport to="body">
                <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
                    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                    <div v-if="showMonthPicker"
                        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        @click="showMonthPicker = false">
                        <div class="bg-white dark:bg-slate-900 rounded-4xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-white/10"
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
                class="h-95 overflow-y-auto overflow-x-hidden pt-4 pb-6 px-4 scrollbar-hide snap-y snap-mandatory"
                style="-webkit-overflow-scrolling: touch;">
                <div :key="displayModeKey" class="flex flex-col gap-3 day-list">
                    <button v-for="(day, index) in visibleDays" :key="index" @click="handleDayClick(day.date)" :class="[
                        'w-full p-4 flex items-center gap-4 rounded-[1.8rem] transition-all duration-300 border active:scale-[0.98] snap-center',
                        day.isSkipped ? 'opacity-40 grayscale bg-slate-50 border-slate-100 dark:bg-white/5 dark:border-white/5' : '',
                        !day.isSkipped && isToday(day.date)
                            ? 'bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-200 dark:bg-white/15 dark:text-white dark:border-white/20 dark:shadow-purple-900/20'
                            : !day.isSkipped ? 'bg-white border-slate-100 text-slate-700 shadow-sm shadow-slate-200/50 hover:bg-slate-50 dark:bg-white/5 dark:border-white/5 dark:text-slate-300' : ''
                    ]">
                        <!-- Left: Date -->
                        <div class="flex flex-col items-center min-w-12.5">
                            <span
                                :class="['text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-60', isToday(day.date) ? 'text-white/70 dark:text-white/60' : 'text-slate-400']">
                                {{ formatDay(day.date) }}
                            </span>
                            <span class="text-xl font-bold leading-none tracking-tighter">{{ formatDate(day.date)
                                }}</span>
                        </div>

                        <!-- Divider -->
                        <div
                            :class="['h-10 w-px', isToday(day.date) ? 'bg-white/20 dark:bg-white/10' : 'bg-slate-100 dark:bg-white/5']" />

                        <!-- Center: Available Budget (Dominant) -->
                        <div class="flex-1 flex flex-col items-center">
                            <template v-if="!day.isSkipped">
                                <span
                                    :class="['text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60', isToday(day.date) ? 'text-white/60' : 'text-slate-400']">
                                    {{ (isRolloverMode ? day.available : day.dailyBalance) >= 0
                                        ? t('day_selector.available') :
                                        t('day_selector.over') }}
                                </span>
                                <div :class="[
                                    'text-2xl font-black tracking-tighter transition-colors',
                                    (isRolloverMode ? day.available : day.dailyBalance) >= 0
                                        ? (isToday(day.date) ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400')
                                        : (isToday(day.date) ? 'text-rose-400' : 'text-rose-600 dark:text-rose-400')
                                ]">
                                    <span>{{ formatBudgetDisplay(isRolloverMode ? day.available
                                        :
                                        day.dailyBalance) }}</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="text-2xl font-black tracking-tighter text-slate-300 dark:text-slate-600">
                                    —
                                </div>
                            </template>
                        </div>

                        <!-- Right: Spent (Secondary) -->
                        <div class="flex flex-col items-end min-w-15">
                            <span class="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-0.5">
                                {{ t('dashboard.spending') }}
                            </span>
                            <span
                                :class="['text-xs font-bold tracking-tight', isToday(day.date) ? 'text-white/80' : 'text-slate-500']">
                                {{ formatBudgetDisplay(day.expensesOnly) }}
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
