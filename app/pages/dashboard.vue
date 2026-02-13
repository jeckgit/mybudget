<script setup lang="ts">
// Inject state directly from storage
const profileStore = useProfileStore();
const monthStore = useMonthsStore();
const { initApp } = useAppSync();
const { t, locale } = useI18n();
import { budgetSchema } from '~/schemas/numeric';
import { formatLocalized2, normalizeDecimalInput, parseLocalizedDecimal } from '~/utils/numberLocale';

useHead({ title: t('common.dashboard') })
const { calculateBudgetData } = useBudget();
const { formatCurrency } = useCurrency();

// Ensure state is loaded
await initApp();

// Budget Editing
const showBudgetEdit = ref(false);
const editingBudget = ref('');
const isSavingBudget = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

const budgetData = computed(() => calculateBudgetData());
const currentMonthBudget = computed(() => {
    return monthStore.getMonthConfig(new Date()).budget;
});
const remainingPercentage = computed(() => {
    if (currentMonthBudget.value === 0) return 0;
    return Math.max(0, (currentMonthBudget.value - budgetData.value.totalSpentMonth) / currentMonthBudget.value);
});

const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' });
};

const openBudgetEdit = () => {
    // Edit the budget for the current real month, as displayed in the dashboard
    const config = monthStore.getMonthConfig(new Date());
    editingBudget.value = formatLocalized2(config.budget, locale.value);
    showBudgetEdit.value = true;
};

const triggerErrorToast = (message: string) => {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toastMessage.value = message;
    showToast.value = true;
    toastTimeout = setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

const handleBudgetInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    editingBudget.value = normalizeDecimalInput(target.value);
};

const handleBudgetBlur = () => {
    const parsed = parseLocalizedDecimal(editingBudget.value, locale.value);
    if (parsed !== null) {
        editingBudget.value = formatLocalized2(parsed, locale.value);
    }
};

const saveMonthlyBudget = async () => {
    const parsed = budgetSchema(locale.value).safeParse(editingBudget.value);
    if (!parsed.success) {
        triggerErrorToast(t(parsed.error.issues[0]?.message || 'validation.number_invalid'));
        return;
    }

    isSavingBudget.value = true;
    try {
        const now = new Date();
        const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        await monthStore.upsertMonth(key, { budget: parsed.data });
        showBudgetEdit.value = false;
    } catch (e) {
        console.error("Failed to save budget", e);
        triggerErrorToast(t('common.error_occurred'));
    } finally {
        isSavingBudget.value = false;
    }
};

watch(() => locale.value, () => {
    const parsed = parseLocalizedDecimal(editingBudget.value, locale.value);
    if (showBudgetEdit.value && parsed !== null) {
        editingBudget.value = formatLocalized2(parsed, locale.value);
    }
});

onBeforeUnmount(() => {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
});
</script>
<template>
    <div class="flex flex-col px-6 pt-12">
        <!-- Main Budget Card -->
        <GlassCard variant="featured" class="p-6 mb-8 relative text-slate-900 dark:text-white overflow-hidden">
            <div class="relative z-10 flex flex-row items-end justify-between w-full">
                <div>
                    <p class="text-slate-600 font-medium text-sm mb-1 dark:text-slate-300">{{
                        t('dashboard.spent_today') }}</p>
                    <h2 class="text-4xl font-bold tracking-tighter">
                        {{ formatCurrency(budgetData.spentToday, profileStore.config.value.currency, false, {
                            minimumFractionDigits:
                                2
                        }) }}
                    </h2>
                    <div class="mt-2 flex items-center gap-1.5">
                        <span
                            class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">{{
                                t('dashboard.saved_total') }}</span>
                        <span
                            :class="['text-sm font-bold', budgetData.totalSaved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400']">
                            {{ formatCurrency(budgetData.totalSaved, profileStore.config.value.currency, false, {
                                minimumFractionDigits: 0
                            }) }}
                        </span>
                    </div>
                </div>

                <div class="text-right flex flex-col items-end">
                    <p class="text-xs text-slate-600 font-medium mb-1 uppercase tracking-wide dark:text-white">
                        {{ t('dashboard.monthly_budget') }}</p>
                    <button @click="openBudgetEdit"
                        class="font-bold text-lg text-slate-800 opacity-80 dark:text-white hover:opacity-100 border-b border-transparent hover:border-slate-800 dark:hover:border-white transition-all active:scale-95">
                        {{ formatCurrency(currentMonthBudget, profileStore.config.value.currency) }}
                    </button>
                </div>
            </div>

            <!-- Decorative Elements -->
            <div
                class="absolute -right-10 -bottom-12 opacity-40 pointer-events-none mix-blend-overlay text-blue-500 dark:text-white">
                <HaloRing :size="140" :stroke-width="30" :progress="remainingPercentage" color="currentColor"
                    track-color="rgba(255,255,255,0.1)" />
            </div>
        </GlassCard>
        <!-- Day Selector -->
        <DaySelector />

        <!-- Budget Edit Modal -->
        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="showBudgetEdit"
                    class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    @click="showBudgetEdit = false">
                    <div class="bg-white dark:bg-slate-900 rounded-4xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-white/10"
                        @click.stop>
                        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">
                            {{ t('settings.monthly_budget') }} ({{ formatMonthYear(new Date()) }})
                        </h3>

                        <div class="mb-6 relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{{
                                profileStore.config.value.currency }}</span>
                            <input :value="editingBudget" type="text" inputmode="decimal" @input="handleBudgetInput"
                                @blur="handleBudgetBlur"
                                class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-center"
                                placeholder="0" />
                        </div>

                        <div class="flex gap-3">
                            <button @click="showBudgetEdit = false"
                                class="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 rounded-xl">
                                {{ t('common.cancel') }}
                            </button>
                            <button @click="saveMonthlyBudget" :disabled="isSavingBudget"
                                class="flex-1 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center">
                                <span v-if="isSavingBudget"
                                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span v-else>{{ t('common.save') }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <StatusToast :visible="showToast" :message="toastMessage" type="error" />
    </div>
</template>
