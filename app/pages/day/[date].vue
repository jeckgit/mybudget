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

const expensesOnly = computed(() => {
    return dayTransactions.value
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);
});

const incomeOnly = computed(() => {
    return dayTransactions.value
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
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

const { confirm } = useConfirm();

const handleDeleteTransaction = async (id: string) => {
    if (await confirm({
        title: t('common.delete_confirm'),
        message: t('common.delete_confirm_desc') || t('common.delete_confirm'),
        confirmText: t('common.delete'),
        isDestructive: true
    })) {
        txStore.removeTransaction(id);
    }
}
</script>

<template>
    <div class="flex flex-col min-h-dvh pb-32">
        <!-- Header -->
        <div
            class="sticky top-[env(safe-area-inset-top)] z-20 px-6 pt-12 pb-6 bg-white/5 backdrop-blur-xl border-b border-white/5">
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
            <GlassCard variant="glass" class="p-8 mb-8 shadow-2xl shadow-purple-900/5 dark:shadow-none">
                <button @click="openNewExpenseModal" type="button"
                    class="w-full flex flex-col items-center transition-transform active:scale-95 cursor-pointer outline-none">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">
                        {{ t('day_selector.daily_spending') }}
                    </p>
                    <h2 class="text-5xl font-bold text-slate-800 dark:text-white tracking-tighter">
                        {{ formatCurrency(expensesOnly, profileStore.config.value.currency, false, {
                            minimumFractionDigits: 2
                        }) }}
                    </h2>
                    <p v-if="incomeOnly > 0"
                        class="mt-2 text-sm font-semibold text-emerald-500 dark:text-emerald-400 tracking-tight">
                        {{ t('day_selector.income_label') }}: +{{ formatCurrency(incomeOnly,
                            profileStore.config.value.currency, false, { minimumFractionDigits: 2 }) }}
                    </p>
                </button>
            </GlassCard>

            <!-- Transactions List -->
            <div class="space-y-4">
                <h3 class="font-bold text-lg text-slate-800 px-1 dark:text-white">{{ t('dashboard.recent') }}</h3>

                <div class="space-y-3">
                    <SwipeableTransaction v-for="tx in dayTransactions" :key="tx.id" :transaction="tx"
                        :category-emoji="getCategoryById(tx.category)?.emoji"
                        :category-name="getCategoryName(getCategoryById(tx.category))"
                        :formatted-time="formatTime(tx.date)"
                        :formatted-amount="formatCurrency(Math.abs(tx.amount), profileStore.config.value.currency, false, { minimumFractionDigits: 2 })"
                        :is-income="tx.amount < 0" @click="handleTransactionClick(tx)"
                        @delete="handleDeleteTransaction" />

                    <div v-if="dayTransactions.length === 0"
                        class="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                        <div
                            class="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 text-2xl">
                            ☁️
                        </div>
                        <p
                            class="text-sm font-bold uppercase tracking-widest bg-linear-to-b from-slate-400 to-slate-500 bg-clip-text text-transparent">
                            {{ t('dashboard.no_transactions') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <AddExpenseModal :is-open="isModalOpen" :editing-transaction="selectedTransaction" @close="handleModalClose" />
    </div>
</template>
