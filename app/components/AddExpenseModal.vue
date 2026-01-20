<script lang="ts" setup>
import type { Transaction } from '~/../shared/types';
import { Trash2, ArrowRightLeft } from 'lucide-vue-next'; // Added Icon

const props = defineProps<{
    editingTransaction?: Transaction | null;
    isOpen: boolean;
}>();

const route = useRoute();
const { state, addTransaction, updateTransaction, removeTransaction } = useStorage();
const { categories, expenseCategories, incomeCategories, getCategoryByEmoji, getCategoryName, addCategory } = useCategories();
const { t, locale } = useI18n();
const emit = defineEmits(['close']);

// Initialize state based on props
const inputValue = ref("");
const currentStep = ref(1);
// We start with a placeholder, but we will compute the correct one
const selectedCategory = ref(categories.value[0]!);
const isIncome = ref(false); // [NEW] Track if it's income

// [NEW] Computed Categories to Display
const displayedCategories = computed(() => {
    return isIncome.value ? incomeCategories.value : expenseCategories.value;
});


// Reset state when modal opens
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.editingTransaction) {
            // Check if amount is negative (meaning it was Income)
            const rawAmount = props.editingTransaction.amount;
            isIncome.value = rawAmount < 0;
            inputValue.value = Math.abs(rawAmount).toString();
            currentStep.value = 2;
        } else {
            inputValue.value = "";
            currentStep.value = 1;
            isIncome.value = false;
        }

        // Wait for next tick so displayedCategories update based on isIncome
        nextTick(() => {
            selectedCategory.value = props.editingTransaction
                ? getCategoryByEmoji(props.editingTransaction.category || '') || displayedCategories.value[0]!
                : displayedCategories.value[0]!;
        });


        selectedDate.value = props.editingTransaction
            ? toDateTimeLocal(new Date(props.editingTransaction.date))
            : toDateTimeLocal(getInitialDate());
    }
});
// Watch isIncome to reset selection if categories change
watch(isIncome, () => {
    if (displayedCategories.value.length > 0) {
        selectedCategory.value = displayedCategories.value[0]!;
    }
});


// Date State
const now = new Date();
const toDateTimeLocal = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
};

// Determine initial date: Edit Tx > Route Param (Context) > Now
const getInitialDate = () => {
    if (props.editingTransaction) {
        return new Date(props.editingTransaction.date);
    }

    if (route.params.date && typeof route.params.date === 'string') {
        const routeDate = new Date(route.params.date);
        if (!isNaN(routeDate.getTime())) {
            const contextDate = new Date(now);
            contextDate.setFullYear(routeDate.getFullYear());
            contextDate.setMonth(routeDate.getMonth());
            contextDate.setDate(routeDate.getDate());
            return contextDate;
        }
    }

    return now;
};

const selectedDate = ref(toDateTimeLocal(getInitialDate()));

const modalCardStyle = computed(() => {
    // Only apply transform when swiping down
    const diff = Math.max(0, -lengthY.value);
    return {
        transform: isSwiping.value && diff > 0 ? `translateY(${diff}px)` : '',
        transition: isSwiping.value ? 'none' : 'transform 0.3s ease-out'
    };
});

const formattedDateDisplay = computed(() => {
    const date = new Date(selectedDate.value);
    return date.toLocaleString(locale.value, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
});

const handleAddTransaction = async (cat?: typeof categories.value[0]) => {
    let amount = parseFloat(inputValue.value);
    if (isNaN(amount) || amount <= 0) return;

    // [NEW] Negate amount if Income
    if (isIncome.value) {
        amount = -amount;
    }

    if (currentStep.value === 1 && !cat) {
        currentStep.value = 2;
        return;
    }

    let finalCategory = cat || selectedCategory.value;



    const finalDate = new Date(selectedDate.value).toISOString();

    if (props.editingTransaction) {
        const updatedTx: Transaction = {
            ...props.editingTransaction,
            amount,
            date: finalDate,
            category: finalCategory.id,
        };
        updateTransaction(updatedTx);
    } else {
        const newTx: Transaction = {
            id: Date.now().toString(),
            amount,
            date: finalDate,
            category: finalCategory.id,
        };
        addTransaction(newTx);
    }

    useState('showSuccessAnimation').value = true;
    inputValue.value = "";
    emit('close');
};

const { confirm } = useConfirm();

const handleDeleteTransaction = async () => {
    if (!props.editingTransaction) return;

    if (await confirm({
        title: t('common.delete_confirm'),
        message: t('common.delete_confirm_desc') || t('common.delete_confirm'),
        confirmText: t('common.delete'),
        isDestructive: true
    })) {
        removeTransaction(props.editingTransaction.id);
        emit('close');
    }
}

const handleBack = () => {
    currentStep.value = 1;
};

const handleInput = (n: string | number) => {
    inputValue.value += n.toString();
};

const handleDelete = () => {
    inputValue.value = inputValue.value.slice(0, -1);
}



// Swipe to Close Logic
const modalCard = ref<HTMLElement | null>(null);
const { lengthY, isSwiping } = useSwipe(modalCard, {
    passive: false,
    onSwipeEnd(e, direction) {
        // swipe downward: lengthY = startY - endY. So endY > startY means lengthY < 0.
        // We close if dragged down more than 100px.
        if (lengthY.value < -100) {
            emit('close');
        }
    }
});

</script>
<template>
    <Teleport to="body">
        <div class="relative z-100">
            <!-- Backdrop -->
            <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="isOpen" class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm dark:bg-black/60"
                    @click="emit('close')" />
            </Transition>

            <!-- Modal Content -->
            <Transition enter-active-class="transition duration-300 ease-out"
                enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-full opacity-0">
                <div v-if="isOpen" class="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
                    <div class="pointer-events-auto" ref="modalCard" :style="modalCardStyle">
                        <GlassCard variant="white"
                            class="p-8 pb-10 rounded-[2.5rem]! shadow-2xl shadow-purple-900/10 dark:bg-white/5! dark:backdrop-blur-2xl dark:border! dark:border-white/10! dark:shadow-black/50">
                            <div @click="emit('close')"
                                class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 dark:bg-white/10 cursor-pointer hover:bg-slate-300 dark:hover:bg-white/20 transition-colors z-20 relative" />

                            <!-- Edit Mode Header with Delete -->
                            <div v-if="editingTransaction"
                                class="flex justify-between items-center absolute top-6 right-6 left-6 pointer-events-none z-30">
                                <div /> <!-- Spacer -->
                                <button @click="handleDeleteTransaction"
                                    class="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors pointer-events-auto">
                                    <Trash2 class="w-5 h-5" />
                                </button>
                            </div>

                            <template v-if="currentStep === 1">
                                <div class="text-center mb-6">
                                    <!-- Income Toggle Switch -->
                                    <div class="flex justify-center mb-4">
                                        <div
                                            class="flex bg-slate-100 p-1 rounded-full dark:bg-white/5 border border-slate-200 dark:border-white/10 relative">
                                            <!-- Sliding Background -->
                                            <div class="absolute inset-y-1 rounded-full bg-white shadow-sm dark:bg-white/10 transition-all duration-300 ease-out w-[calc(50%-4px)]"
                                                :class="{ 'translate-x-full left-0': isIncome, 'translate-x-0 left-1': !isIncome }">
                                            </div>

                                            <button @click="isIncome = false"
                                                class="relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300"
                                                :class="{ 'text-slate-800 dark:text-white': !isIncome, 'text-slate-400 dark:text-slate-500 hover:text-slate-600': isIncome }">
                                                {{ t('common.expense') }}
                                            </button>
                                            <button @click="isIncome = true"
                                                class="relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300"
                                                :class="{ 'text-green-600 dark:text-green-400': isIncome, 'text-slate-400 dark:text-slate-500 hover:text-slate-600': !isIncome }">
                                                {{ t('common.income') }}
                                            </button>
                                        </div>
                                    </div>


                                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 dark:text-slate-400 transition-colors"
                                        :class="{ 'text-green-500! dark:text-green-400!': isIncome }">
                                        {{ isIncome ? (editingTransaction ? t('common.edit_income') :
                                            t('common.add_income_modal')) :
                                            (editingTransaction ? t('common.edit_expense') : t('common.add_expense_modal'))
                                        }}
                                    </p>
                                    <div class="flex items-center justify-center gap-1 transition-colors duration-300"
                                        :class="{ 'text-green-500': isIncome }">
                                        <!-- Removed Currency Symbol as requested -->
                                        <span class="text-7xl font-bold text-slate-800 tracking-tighter dark:text-white"
                                            :class="{ 'text-green-600! dark:text-green-400!': isIncome }">
                                            {{ inputValue || "0" }}
                                        </span>
                                    </div>
                                </div>

                                <NumberPad :value="inputValue" @input="handleInput" @delete="handleDelete"
                                    @submit="handleAddTransaction" :submit-label="t('common.next')" />
                            </template>

                            <template v-else>
                                <div class="flex items-center justify-between mb-6">
                                    <button @click="handleBack"
                                        class="p-3 rounded-full bg-slate-100 text-slate-400 active:scale-95 transition-all dark:bg-white/5 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div class="text-center">
                                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest dark:text-slate-500 transition-colors"
                                            :class="{ 'text-green-500!': isIncome }">
                                            {{ t('common.select_category') }}
                                        </p>
                                        <p class="text-2xl font-bold text-slate-800 dark:text-white transition-colors"
                                            :class="{ 'text-green-600! dark:text-green-400!': isIncome }">
                                            <!-- Removed Currency Symbol here too -->
                                            {{ inputValue }}
                                        </p>
                                    </div>
                                    <div class="w-12 h-12" /> <!-- Spacer for centering -->
                                </div>

                                <!-- Date Picker Badge -->
                                <div class="flex justify-center mb-6">
                                    <label class="relative cursor-pointer group">
                                        <input type="datetime-local" v-model="selectedDate"
                                            class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                        <div class="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-bold border border-purple-100 group-hover:bg-purple-100 transition-colors dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500/30 dark:group-hover:bg-purple-900/40"
                                            :class="{ 'bg-green-50! text-green-600! border-green-100! group-hover:bg-green-100! dark:bg-green-900/20! dark:text-green-300! dark:border-green-500/30!': isIncome }">
                                            <span>📅</span>
                                            <span>{{ formattedDateDisplay }}</span>
                                        </div>
                                    </label>
                                </div>

                                <div class="grid grid-cols-2 gap-3 mb-4">
                                    <button v-for="cat in displayedCategories" :key="cat.id"
                                        @click="handleAddTransaction(cat)"
                                        class="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 active:scale-95 transition-all duration-300 dark:bg-white/5 dark:border-white/5 dark:text-slate-300"
                                        :class="{
                                            'bg-purple-50! border-purple-200! text-purple-600! dark:bg-purple-900/20! dark:border-purple-500/30!': selectedCategory.id === cat.id && !isIncome,
                                            'bg-green-50! border-green-200! text-green-600! dark:bg-green-900/20! dark:border-green-500/30!': selectedCategory.id === cat.id && isIncome
                                        }">
                                        <span class="text-4xl mb-2">{{ cat.emoji }}</span>
                                        <span class="text-xs font-bold uppercase tracking-wider opacity-80">{{
                                            getCategoryName(cat) }}</span>
                                    </button>
                                </div>
                            </template>
                        </GlassCard>
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>\