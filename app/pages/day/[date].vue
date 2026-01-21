<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import type { Transaction } from '~/../shared/types';

const route = useRoute();
const txStore = useTransactionsStore();
const profileStore = useProfileStore();
const catStore = useCategoriesStore();
const { getCategoryById, getCategoryName } = catStore;
const { t, locale } = useI18n();
const dateStr = route.params.date as string;

const formatDayTitle = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale.value, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
};

useHead({ title: computed(() => formatDayTitle(dateStr)) })
const isModalOpen = ref(false);
const selectedTransaction = ref<Transaction | null>(null);

const dayTransactions = computed(() => {
    return txStore.transactions.value.filter(tx => {
        if (!tx.date) return false;
        const localDate = new Date(tx.date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}` === dateStr;
    });
});

const { formatCurrency } = useCurrency();

const totalForDay = computed(() => {
    return dayTransactions.value.reduce((sum, tx) => sum + tx.amount, 0);
});

const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' });
};

const goBack = () => {
    navigateTo('/dashboard');
};

const handleTransactionClick = (tx: Transaction) => {
    selectedTransaction.value = tx;
    isModalOpen.value = true;
};

const handleModalClose = () => {
    isModalOpen.value = false;
    selectedTransaction.value = null;
};

const openNewExpenseModal = () => {
    selectedTransaction.value = null;
    isModalOpen.value = true;
};
</script>

<template>
    <div class="flex flex-col min-h-dvh bg-slate-50 dark:bg-[#050505]">
        <!-- Header -->
        <div
            class="sticky top-[env(safe-area-inset-top)] z-20 px-6 pt-12 pb-6 bg-slate-50/80 backdrop-blur-xl dark:bg-[#050505]/80 border-b border-transparent transition-all duration-300">
            <div class="flex items-center gap-4">
                <button @click="goBack"
                    class="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm text-slate-600 active:scale-95 transition-transform dark:text-white dark:bg-white/5 dark:border-white/10">
                    <ChevronLeft :size="24" />
                </button>
                <div>
                    <p
                        class="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1 dark:text-slate-500">
                        {{ t('day_selector.details_title') }}
                    </p>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-white">
                        {{ formatDayTitle(dateStr) }}
                    </h1>
                </div>
            </div>
        </div>

        <div class="px-6 pt-4">
            <!-- Daily Summary Card -->
            <GlassCard variant="white"
                class="p-8 mb-8 bg-white/80! dark:bg-white/5! dark:border-white/10! shadow-2xl shadow-purple-900/5 dark:shadow-none">
                <button @click="openNewExpenseModal" type="button"
                    class="w-full flex flex-col items-center transition-transform active:scale-95 cursor-pointer outline-none">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
                        {{ t('day_selector.daily_spending') }}
                    </p>
                    <h2 class="text-5xl font-bold text-slate-800 dark:text-white tracking-tighter">
                        {{ formatCurrency(totalForDay, profileStore.config.value.currency, false, { minimumFractionDigits: 2 }) }}
                    </h2>
                </button>
            </GlassCard>

            <!-- Transactions List -->
            <div class="space-y-4">
                <h3 class="font-bold text-lg text-slate-800 px-1 dark:text-white">{{ t('dashboard.recent') }}</h3>

                <div class="space-y-3">
                    <GlassCard v-for="tx in dayTransactions" :key="tx.id" variant="white"
                        @click="handleTransactionClick(tx)"
                        class="flex items-center justify-between p-3 rounded-2xl! bg-white/60! dark:bg-white/5! dark:border! dark:border-white/10! active:scale-95 transition-all cursor-pointer hover:bg-white/80 dark:hover:bg-white/10">
                        <div class="flex items-center gap-3 min-w-0 flex-1 mr-4">
                            <div
                                class="w-10 h-10 shrink-0 rounded-xl bg-white/80 flex items-center justify-center text-lg shadow-sm border border-white dark:bg-white/10 dark:border-white/5 dark:text-white">
                                {{ getCategoryById(tx.category)?.emoji || '💸' }}
                            </div>
                            <div class="min-w-0">
                                <p class="font-bold text-slate-800 text-sm dark:text-white truncate">
                                    {{ getCategoryName(getCategoryById(tx.category)) || tx.note ||
                                        t('dashboard.default_note') }}
                                </p>
                                <p
                                    class="text-[10px] text-slate-400 font-bold uppercase tracking-wide dark:text-slate-500">
                                    {{ formatTime(tx.date) }}
                                </p>
                            </div>
                        </div>
                        <span class="font-bold whitespace-nowrap"
                            :class="{ 'text-green-600 dark:text-green-400': tx.amount < 0, 'text-slate-800 dark:text-white': tx.amount >= 0 }">
                            {{ tx.amount < 0 ? '+' : '' }} {{ formatCurrency(Math.abs(tx.amount), profileStore.config.value.currency,
                                false, { minimumFractionDigits: 2 }) }} </span>
                    </GlassCard>

                    <div v-if="dayTransactions.length === 0"
                        class="text-center py-16 text-slate-400 bg-white/30 backdrop-blur-md rounded-4xl border border-dashed border-white/50 dark:text-slate-600 dark:bg-white/5 dark:border-white/10">
                        {{ t('dashboard.no_transactions') }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <AddExpenseModal :is-open="isModalOpen" :editing-transaction="selectedTransaction" @close="handleModalClose" />
    </div>
</template>
