<template>
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative">
        <div class="max-w-md w-full transition-all duration-500 ease-in-out">
            <!-- Icon / Logo Area -->
            <div
                class="w-24 h-24 rounded-4xl bg-linear-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-accent/30 mb-8 mx-auto dark:from-white/10 dark:to-white/5 dark:border-white/10 dark:shadow-accent/20">
                <Wallet class="w-10 h-10 text-mint" :stroke-width="1.5" />
            </div>

            <!-- Step 1: Language Selection -->
            <div v-if="currentStep === 'language'" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome') }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('settings.language') }}</p>

                <div class="grid grid-cols-2 gap-4">
                    <button v-for="lang in languages" :key="lang.code" @click="handleSelectLanguage(lang.code)"
                        class="p-6 rounded-3xl backdrop-blur-md shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-3 group border-2"
                        :class="[
                            locale === lang.code
                                ? 'bg-white/80 border-accent dark:bg-white/10 dark:border-accent'
                                : 'bg-white/60 border-white/80 dark:bg-white/5 dark:border-white/10'
                        ]">
                        <span class="text-3xl group-hover:scale-110 transition-transform">{{ lang.flag }}</span>
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ lang.name }}</span>
                    </button>
                </div>
            </div>

            <!-- Step 2: Budget Setting -->
            <div v-else-if="currentStep === 'budget'" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome')
                }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('onboarding.tagline') }}</p>


                <GlassCard variant="glass" class="p-8 dark:bg-white/5 dark:border-white/10">
                    <div class="mb-6">
                        <label
                            class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest dark:text-slate-500">
                            {{ t('settings.currency') }}
                        </label>
                        <select v-model="selectedCurrency"
                            class="w-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none text-center cursor-pointer">
                            <option v-for="c in currencies" :key="c.code" :value="c.code">
                                {{ c.label }}
                            </option>
                        </select>
                    </div>

                    <label
                        class="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest dark:text-slate-500">
                        {{ t('onboarding.monthly_budget') }}
                    </label>
                    <div
                        class="flex items-center gap-4 mb-8 border-b-2 border-slate-200/50 dark:border-white/10 focus-within:border-accent transition-colors pb-2">
                        <span class="text-3xl font-medium text-slate-400 dark:text-slate-500">{{
                            selectedCurrency }}</span>
                        <input v-model="budgetInput" type="number"
                            class="w-full bg-transparent border-none p-0 text-5xl font-bold text-slate-800 focus:ring-0 focus:outline-none placeholder-slate-200 dark:text-white dark:placeholder-slate-700 leading-none outline-none"
                            placeholder="0" />
                    </div>
                    <p class="text-xs text-slate-400 font-medium mb-8 dark:text-slate-500">
                        {{ t('onboarding.budget_hint') }}
                    </p>

                    <!-- Calculator Toggle -->
                    <div class="mb-8">
                        <button @click="showCalculator = !showCalculator"
                            class="text-xs font-bold text-accent flex items-center justify-center gap-2 mx-auto hover:text-accent/80 transition-colors bg-accent/10 px-4 py-2 rounded-full">
                            <Calculator class="w-4 h-4" />
                            {{ t('onboarding.help_calculate') }}
                        </button>

                        <div v-if="showCalculator" class="mt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div class="space-y-4 text-left">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <label class="block text-xs font-bold text-slate-400 dark:text-slate-500">
                                            {{ t('onboarding.income') }}
                                        </label>
                                        <Tooltip :text="t('onboarding.income_hint')">
                                            <Info class="w-3 h-3 text-slate-400 hover:text-accent transition-colors" />
                                        </Tooltip>
                                    </div>
                                    <input v-model="incomeInput" type="number"
                                        class="w-full bg-slate-100 dark:bg-white/10 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-accent transition-all dark:text-white"
                                        placeholder="0" />
                                </div>

                                <div>
                                    <div class="mb-4">
                                        <div class="flex items-center gap-2 mb-2">
                                            <label
                                                class="block text-xs font-bold text-slate-400 tracking-widest dark:text-slate-500">
                                                {{ t('onboarding.fixed_costs') }}
                                            </label>
                                            <Tooltip :text="t('onboarding.fixed_costs_hint')">
                                                <Info
                                                    class="w-3 h-3 text-slate-400 hover:text-accent transition-colors" />
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <div class="space-y-2 mb-4">
                                        <div v-for="(item, index) in fixedCostItems" :key="item.id"
                                            class="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-300"
                                            :style="{ animationDelay: `${index * 50}ms` }">
                                            <input v-model="item.label" type="text"
                                                class="flex-1 bg-slate-100 dark:bg-white/10 rounded-xl px-4 py-3 text-base font-medium outline-none focus:ring-2 focus:ring-accent transition-all dark:text-white"
                                                :placeholder="t('onboarding.cost_name')" />
                                            <div class="relative w-32">
                                                <input v-model.number="item.amount" type="number"
                                                    class="w-full bg-slate-100 dark:bg-white/10 rounded-xl px-4 py-3 text-base font-medium outline-none focus:ring-2 focus:ring-accent transition-all dark:text-white text-right"
                                                    placeholder="0" />
                                            </div>
                                            <button @click="removeCostItem(item.id)"
                                                class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <X class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Suggestions Cloud -->
                                    <div class="flex flex-wrap gap-2 mb-6 animate-in fade-in duration-500">
                                        <button v-for="s in costSuggestions" :key="s.key" @click="addSuggestion(s)"
                                            class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-accent/10 hover:text-accent dark:bg-white/5 dark:hover:bg-accent/20 transition-all text-xs font-medium text-slate-600 dark:text-slate-300 border border-transparent hover:border-accent/30 active:scale-95">
                                            {{ s.icon }} {{ t(`onboarding.costs.${s.key}`) }}
                                        </button>

                                        <!-- Custom Add Button as Bubble -->
                                        <button @click="addCostItem"
                                            class="px-3 py-1.5 rounded-full border border-dashed border-slate-300 hover:border-accent hover:text-accent dark:border-white/20 dark:hover:border-accent transition-all text-xs font-medium text-slate-400 dark:text-slate-500 hover:bg-accent/5 active:scale-95 flex items-center gap-1">
                                            <Plus class="w-3 h-3" /> {{ t('onboarding.add_custom') }}
                                        </button>
                                    </div>

                                    <div
                                        class="flex justify-between items-center py-2 border-t border-slate-200/50 dark:border-white/10">
                                        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{
                                            t('onboarding.total_fixed_costs') }}</span>
                                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{
                                            totalFixedCosts }} {{ selectedCurrency }}</span>
                                    </div>

                                    <!-- Suggestions Cloud -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <GlassButton :full-width="true" @click="handleSetBudget">
                            {{ t('onboarding.start_journey') }}
                        </GlassButton>
                        <button @click="currentStep = 'language'"
                            class="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2">
                            {{ t('common.back') }}
                        </button>
                    </div>
                </GlassCard>
            </div>

            <!-- Step 3: Categories Info -->
            <div v-else-if="currentStep === 'categories'"
                class="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.categories_title') }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('onboarding.categories_subtitle')
                }}</p>

                <GlassCard variant="glass" class="p-8 dark:bg-white/5 dark:border-white/10">
                    <div class="grid grid-cols-3 gap-4 mb-8">
                        <div class="flex flex-col items-center gap-2">
                            <div
                                class="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl dark:bg-orange-500/20">
                                🛍️</div>
                            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{
                                t('categories.shopping')
                                }}</span>
                        </div>
                        <div class="flex flex-col items-center gap-2">
                            <div
                                class="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl dark:bg-blue-500/20">
                                🍔</div>
                            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ t('categories.food')
                            }}</span>
                        </div>
                        <div class="flex flex-col items-center gap-2">
                            <div
                                class="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl dark:bg-green-500/20">
                                🚌</div>
                            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{
                                t('categories.transport') }}</span>
                        </div>
                    </div>

                    <p class="text-sm text-slate-500 text-center mb-8 leading-relaxed dark:text-slate-400">
                        {{ t('onboarding.categories_desc') }}
                    </p>

                    <div class="flex flex-col gap-3">
                        <GlassButton :full-width="true" @click="handleFinish">
                            {{ t('onboarding.continue') }}
                        </GlassButton>
                        <button @click="currentStep = 'budget'"
                            class="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2">
                            {{ t('common.back') }}
                        </button>
                    </div>
                </GlassCard>
            </div>

            <!-- Step 4: Completing / Setup Screen -->
            <div v-else-if="currentStep === 'completing'" class="animate-in fade-in duration-700">
                <h1 class="text-4xl font-bold text-slate-800 mb-2 tracking-tight dark:text-white">{{
                    t('onboarding.welcome') }}</h1>
                <p class="text-slate-500 mb-10 font-medium dark:text-slate-400">{{ t('common.loading') }}</p>

                <GlassCard variant="glass" class="p-12 dark:bg-white/5 dark:border-white/10">
                    <div class="flex flex-col items-center gap-6">
                        <!-- Animated pulse circles -->
                        <div class="relative w-20 h-20">
                            <div class="absolute inset-0 rounded-full bg-accent/20 animate-ping"></div>
                            <div class="absolute inset-0 rounded-full bg-accent/40 animate-pulse"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="w-12 h-12 rounded-full bg-accent"></div>
                            </div>
                        </div>
                        <p class="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                            {{ t('onboarding.setting_up') }}
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>

        <StatusToast :visible="showToast" :message="validationError || ''" />
    </div>
</template>

<script setup lang="ts">
import { Wallet, Calculator, Plus, X, Info } from 'lucide-vue-next';
import type { FixedCostItem } from '~/../shared/types';
import { v4 as uuidv4 } from 'uuid';

// Use storage
const { state, updateConfig } = useStorage();
const { t, setLocale, locale } = useI18n();

const budgetInput = ref('');
const currentStep = ref<'language' | 'budget' | 'categories' | 'completing'>('language');
const selectedCurrency = ref(state.value.config.currency || 'EUR');

// Calculator State
const showCalculator = ref(false);
const incomeInput = ref('');
const fixedCostItems = ref<FixedCostItem[]>([]);
const showToast = ref(false);

const totalFixedCosts = computed(() => {
    return fixedCostItems.value.reduce((sum, item) => sum + item.amount, 0);
});

const validationError = computed(() => {
    // 1. Calculator specific validation
    if (showCalculator.value) {
        if (fixedCostItems.value.length > 0 && (!incomeInput.value || Number(incomeInput.value) <= 0)) {
            return t('onboarding.error_missing_income');
        }
        if (Number(incomeInput.value) > 0 && totalFixedCosts.value > Number(incomeInput.value)) {
            return t('onboarding.error_negative_budget');
        }
    }

    // 2. General budget validation
    if (!budgetInput.value || Number(budgetInput.value) <= 0) {
        return t('onboarding.error_missing_budget');
    }

    return null;
});

const addCostItem = () => {
    fixedCostItems.value.push({
        id: uuidv4(),
        label: '',
        amount: 0
    });
};

const removeCostItem = (id: string) => {
    fixedCostItems.value = fixedCostItems.value.filter(item => item.id !== id);
};

// Start with one empty item

// Auto-calculate budget when calculator inputs change
watch([incomeInput, totalFixedCosts], ([newIncome, newFixed]) => {
    if (!showCalculator.value) return;

    const income = Number(newIncome);
    const fixed = Number(newFixed);

    if (income > 0) {
        const calculated = Math.max(0, income - fixed);
        budgetInput.value = calculated.toString();
    }
}, { deep: true });

const currencies = [
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'CHF', label: 'Swiss Franc (CHF)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' }
];

const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const costSuggestions = [
    { key: 'rent', icon: '🏠' },
    { key: 'electricity', icon: '⚡' },
    { key: 'internet', icon: '🌐' },
    { key: 'phone', icon: '📱' },
    { key: 'insurance', icon: '🛡️' },
    { key: 'streaming', icon: '🎬' },
    { key: 'gym', icon: '💪' },
    { key: 'transport', icon: '🚌' }
];

const addSuggestion = (suggestion: { key: string, icon: string }) => {
    fixedCostItems.value.push({
        id: uuidv4(),
        label: `${suggestion.icon} ${t(`onboarding.costs.${suggestion.key}`)}`,
        amount: 0
    });
};

// Redirect if already complete - but not if we're in completing state
watchEffect(() => {
    if (state.value.config?.onboardingComplete && currentStep.value !== 'completing') {
        navigateTo('/dashboard');
    }
});

const handleSelectLanguage = async (code: string) => {
    await setLocale(code as any);
    await updateConfig({ language: code });
    currentStep.value = 'budget';
};

const handleSetBudget = async () => {
    // Validation Check
    if (validationError.value) {
        showToast.value = true;
        setTimeout(() => {
            showToast.value = false;
        }, 3000);
        return;
    }

    const amount = Number(budgetInput.value);
    if (amount > 0) {
        currentStep.value = 'categories';

        await updateConfig({
            monthlyLimit: amount,
            currency: selectedCurrency.value,
            income: showCalculator.value ? Number(incomeInput.value) : undefined,
            fixedCosts: showCalculator.value ? totalFixedCosts.value : undefined,
            fixedCostDetails: showCalculator.value ? fixedCostItems.value : undefined
        });
    }
};

const handleFinish = async () => {
    // Immediately switch to completing state to prevent flash
    currentStep.value = 'completing';

    await updateConfig({
        onboardingComplete: true
    });

    // Small delay to show the setup screen, then navigate
    await new Promise(resolve => setTimeout(resolve, 800));
    navigateTo('/dashboard');
};
</script>
