<script setup lang="ts">
// Composables
const user = useSupabaseUser();
const client = useSupabaseClient();
const { t, locale, setLocale } = useI18n();

useHead({ title: t('profile.title') })
import {
    AlertCircle,
    ArrowRightLeft,
    ChevronRight,
    Globe,
    Info,
    LogOut,
    Mail,
    Monitor,
    Moon,
    Save,
    Scale,
    Sun,
    Tag,
    Trash2
} from 'lucide-vue-next';
import { budgetSchema } from '~/schemas/numeric';
import { formatLocalized2, normalizeDecimalInput, parseLocalizedDecimal } from '~/utils/numberLocale';

const { colorMode, updateTheme } = useTheme();
const profileStore = useProfileStore();
const appSync = useAppSync();
const { getCurrencySymbol } = useCurrency();

// Ensure state is loaded
await appSync.initApp();

// --- Profile/Email Logic ---
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const newEmail = ref('');
const showToast = ref(false);
const toastType = ref<'success' | 'error'>('success');
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
const showDeleteConfirm = ref(false);
const deleteConfirmationInput = ref('');
const isDeleting = ref(false);

const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    successMsg.value = type === 'success' ? msg : '';
    errorMsg.value = type === 'error' ? msg : '';
    toastType.value = type;
    showToast.value = true;

    toastTimeout = setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

onBeforeUnmount(() => {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
});

// --- Settings Logic ---
const currencies = [
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'CHF', label: 'Swiss Franc (CHF)' },
    { code: 'JPY', label: 'Japanese Yen (¥)' }
];
const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
];

// Local state for settings to allow manual save
const localLanguage = ref(locale.value as string);
const localCurrency = ref(profileStore.config.value.currency);
const localBudget = ref(formatLocalized2(profileStore.config.value.monthlyLimit, locale.value));
const localShowRollover = ref(profileStore.config.value.showRollover);

const parsedLocalBudget = computed(() => {
    const parsed = budgetSchema(locale.value).safeParse(localBudget.value);
    return parsed.success ? parsed.data : null;
});

const hasChanges = computed(() => {
    const budgetChanged = parsedLocalBudget.value === null
        ? localBudget.value !== formatLocalized2(profileStore.config.value.monthlyLimit, locale.value)
        : parsedLocalBudget.value !== profileStore.config.value.monthlyLimit;

    return localLanguage.value !== locale.value ||
        localCurrency.value !== profileStore.config.value.currency ||
        budgetChanged ||
        localShowRollover.value !== profileStore.config.value.showRollover;
});

const isSaving = ref(false);

const handleSaveSettings = async () => {
    isSaving.value = true;
    try {
        const parsedBudget = budgetSchema(locale.value).safeParse(localBudget.value);
        if (!parsedBudget.success) {
            throw new Error(t(parsedBudget.error.issues[0]?.message || 'validation.number_invalid'));
        }

        // Update language if changed
        if (localLanguage.value !== locale.value) {
            setLocale(localLanguage.value as any);
        }

        // Update global storage config
        const success = await profileStore.updateConfig({
            language: localLanguage.value,
            currency: localCurrency.value,
            monthlyLimit: parsedBudget.data,
            showRollover: localShowRollover.value
        });

        if (!success) throw new Error(t('common.error_occurred'));
        triggerToast(t('profile.settings_saved'), 'success');
    } catch (e: any) {
        triggerToast(e.message || t('common.error_occurred'), 'error');
    } finally {
        isSaving.value = false;
    }
};

const handleToggleRollover = () => {
    localShowRollover.value = !localShowRollover.value;
};

const handleBudgetInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    localBudget.value = normalizeDecimalInput(target.value);
};

const handleBudgetBlur = () => {
    const parsed = parseLocalizedDecimal(localBudget.value, locale.value);
    if (parsed !== null) {
        localBudget.value = formatLocalized2(parsed, locale.value);
    }
};

// Initialize newEmail and local state from global config
watchEffect(() => {
    if (user.value?.email && !newEmail.value) {
        newEmail.value = user.value.email;
    }

    // Sync local state if global state changes (e.g. on initial load)
    if (profileStore.config.value) {
        localCurrency.value = profileStore.config.value.currency;
        localBudget.value = formatLocalized2(profileStore.config.value.monthlyLimit, locale.value);
        localLanguage.value = profileStore.config.value.language || 'en';
        localShowRollover.value = profileStore.config.value.showRollover ?? false;
    }
});

watch(() => locale.value, () => {
    const parsed = parseLocalizedDecimal(localBudget.value, locale.value);
    if (parsed !== null) {
        localBudget.value = formatLocalized2(parsed, locale.value);
    }
});

const handleUpdateEmail = async () => {
    if (!newEmail.value || newEmail.value === user.value?.email) return;

    loading.value = true;

    try {
        const { error } = await client.auth.updateUser({
            email: newEmail.value
        });

        if (error) throw error;

        triggerToast(t('profile.confirmation_sent'), 'success');
    } catch (e: any) {
        triggerToast(e.message || t('common.error_occurred'), 'error');
    } finally {
        loading.value = false;
    }
};

const handleReset = async () => {
    if (confirm(t('settings.reset_confirm'))) {
        try {
            await appSync.clearAllData();
            await appSync.initApp(true);
            navigateTo('/onboarding');
        } catch (e: any) {
            triggerToast(e.message || t('common.error_occurred'), 'error');
        }
    }
};

const handleLogout = async () => {
    const { error } = await client.auth.signOut();
    if (error) console.error(error);
    navigateTo('/auth/login');
};

const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.value.toUpperCase() !== 'DELETE') return;

    isDeleting.value = true;
    const userId = user.value?.id || user.value?.sub;

    try {
        // 1. Delete all user data via RLS (client side)
        if (userId) {
            const results = await Promise.all([
                client.from('transactions').delete().eq('user_id', userId),
                client.from('categories').delete().eq('user_id', userId),
                client.from('profiles').delete().eq('user_id', userId)
            ]);

            // Check for errors in any of the results
            const errors = results.map(r => r.error).filter(Boolean);
            if (errors.length > 0) {
                console.error("Deletion errors:", errors);
                throw new Error("Failed to delete some data");
            }
        }
        // 2. Delete the auth user (requires the RPC function to be created)
        const { error: rpcError } = await client.rpc('delete_user_account');
        if (rpcError) {
            console.error("Failed to delete auth user:", rpcError);
            // We don't throw here to allow the client to finish the logout flow
            // even if the auth deletion fails (e.g. if the RPC doesn't exist yet)
        }

        // 3. Sign out (might fail if user is already deleted, which is fine)
        try {
            await client.auth.signOut();
        } catch (signOutError) {
            console.warn("Sign out failed (expected if user deleted):", signOutError);
        }

        // 4. Redirect
        navigateTo('/');
    } catch (e: any) {
        console.error("Deletion process error", e);
        // Only show error if it's NOT the "User from sub claim..." error which we expect
        if (!e.message?.includes('user_not_found') && !e.message?.includes('JWT')) {
            errorMsg.value = t('common.error_occurred');
            showDeleteConfirm.value = false;
        } else {
            // If it was a JWT error, we consider deletion successful enough to redirect
            navigateTo('/');
        }
    } finally {
        isDeleting.value = false;
    }
};
</script>

<template>
    <div class="p-6 max-w-lg mx-auto pb-32">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">{{ t('profile.title') }}</h1>
        </header>

        <div class="space-y-6">
            <!-- Preferences Section -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('profile.preferences') }}
                </h2>

                <NuxtLink to="/categories" class="block mb-6">
                    <GlassCard variant="white"
                        class="p-4 rounded-2xl! flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center dark:bg-purple-900/20 dark:text-purple-300">
                                <Tag class="w-5 h-5" />
                            </div>
                            <span class="font-bold text-slate-700 dark:text-slate-200">{{ t('common.manage_categories')
                            }}</span>
                            <ChevronRight
                                class="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors group-active:translate-x-1" />
                        </div>
                    </GlassCard>
                </NuxtLink>

                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('settings.global_settings') }}
                </h2>
                <GlassCard variant="white" class="p-4 rounded-2xl! space-y-4">
                    <!-- Language -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Globe class="w-5 h-5" />
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.language')
                                }}</span>
                                <Tooltip :text="t('settings.language_desc')">
                                    <Info class="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 transition-colors" />
                                </Tooltip>
                            </div>
                        </div>
                        <select v-model="localLanguage"
                            class="w-32 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option v-for="lang in languages" :key="lang.code" :value="lang.code"
                                class="text-slate-800 bg-white dark:bg-slate-900">
                                {{ lang.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Theme -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Moon class="w-5 h-5" v-if="colorMode === 'dark'" />
                                <Sun class="w-5 h-5" v-else-if="colorMode === 'light'" />
                                <Monitor class="w-5 h-5" v-else />
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.theme')
                                }}</span>
                                <Tooltip :text="t('settings.theme_desc')">
                                    <Info class="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 transition-colors" />
                                </Tooltip>
                            </div>
                        </div>
                        <div class="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1 w-32">
                            <button v-for="theme in ['light', 'system', 'dark']" :key="theme"
                                @click="updateTheme(theme as 'light' | 'system' | 'dark')"
                                class="flex-1 p-2 rounded-md transition-all flex items-center justify-center"
                                :class="colorMode === theme ? 'bg-white dark:bg-white shadow-sm text-purple-600 dark:text-black' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'"
                                :title="t(`settings.themes.${theme}`)">
                                <Sun class="w-4 h-4" v-if="theme === 'light'" />
                                <Monitor class="w-4 h-4" v-if="theme === 'system'" />
                                <Moon class="w-4 h-4" v-if="theme === 'dark'" />
                            </button>
                        </div>
                    </div>

                    <!-- Currency -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span class="text-sm font-bold">{{ profileStore.config.value.currency }}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.currency')
                                }}</span>
                                <Tooltip :text="t('settings.currency_desc')">
                                    <Info class="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 transition-colors" />
                                </Tooltip>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <select v-model="localCurrency"
                                class="w-32 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option v-for="c in currencies" :key="c.code" :value="c.code"
                                    class="text-slate-800 bg-white dark:bg-slate-900">
                                    {{ c.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <!-- Monthly Budget -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <span class="text-xs font-bold">{{ getCurrencySymbol(profileStore.config.value.currency)
                                    }}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-medium text-slate-700 dark:text-slate-200">{{
                                    t('settings.monthly_budget_default') }}</span>
                                <Tooltip :text="t('settings.monthly_budget_default_desc')">
                                    <Info class="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 transition-colors" />
                                </Tooltip>
                            </div>
                        </div>
                        <div class="relative w-32">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">
                                {{ getCurrencySymbol(localCurrency) }}</span>
                            <input :value="localBudget" type="text" inputmode="decimal" @input="handleBudgetInput"
                                @blur="handleBudgetBlur"
                                class="w-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-lg pl-8 pr-3 py-2 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    </div>

                    <!-- Show Rollover -->
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col gap-0.5">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <ArrowRightLeft class="w-5 h-5" />
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <span class="font-medium text-slate-700 dark:text-slate-200">{{
                                        t('settings.show_rollover') }}</span>
                                    <Tooltip :text="t('settings.show_rollover_desc')">
                                        <Info
                                            class="w-3.5 h-3.5 text-slate-400 hover:text-purple-500 transition-colors" />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <button @click="handleToggleRollover"
                            class="w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            :class="localShowRollover ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'">
                            <div class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                                :class="{ 'translate-x-6': localShowRollover }"></div>
                        </button>
                    </div>

                    <!-- Save Settings Button -->
                    <div class="pt-2">
                        <button @click="handleSaveSettings" :disabled="isSaving || !hasChanges"
                            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 dark:disabled:bg-white/5 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            <span v-if="isSaving"
                                class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <Save v-else class="w-4 h-4" />
                            {{ t('settings.save_settings') }}
                        </button>
                    </div>
                </GlassCard>
            </section>

            <!-- Email Update Section -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('profile.account_security') }}
                </h2>
                <GlassCard variant="white" class="p-6 rounded-2xl! space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Mail class="w-4 h-4" />
                            {{ t('profile.email_label') }}
                        </label>
                        <input v-model="newEmail" type="email"
                            class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                            :placeholder="t('profile.email_placeholder')" />
                        <p class="text-xs text-slate-400 dark:text-slate-500 px-1">
                            {{ t('profile.email_hint') }}
                        </p>
                    </div>

                    <button @click="handleUpdateEmail" :disabled="loading || newEmail === user?.email"
                        class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all pt-3">
                        <span v-if="loading"
                            class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <Save v-else class="w-4 h-4" />
                        {{ t('profile.update_email') }}
                    </button>
                </GlassCard>
            </section>

            <!-- Legal Section -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">{{
                    t('legal.title') }}</h2>
                <NuxtLink to="/legal">
                    <GlassCard variant="white"
                        class="p-4 rounded-2xl! flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                <Scale class="w-5 h-5" />
                            </div>
                            <span class="font-bold text-slate-700 dark:text-slate-200">{{ t('legal.imprint') }} / {{
                                t('legal.privacy') }}</span>
                        </div>
                    </GlassCard>
                </NuxtLink>
            </section>

            <!-- Data Management -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">{{
                    t('settings.data') }}</h2>
                <GlassCard variant="white" class="p-4 rounded-2xl! space-y-2">
                    <button @click="handleReset"
                        class="w-full flex items-center justify-between p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 rounded-xl transition-colors group">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                <Trash2 class="w-5 h-5" />
                            </div>
                            <span class="font-medium">{{ t('settings.reset_data') }}</span>
                        </div>
                    </button>
                    <!-- Danger Zone Section -->
                    <div class="pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                        <h3 class="text-xs font-bold text-red-500 tracking-wider mb-3 px-1">{{
                            t('profile.danger_zone') }}</h3>

                        <div class="space-y-3">
                            <p class="text-xs text-slate-400 dark:text-slate-500 px-1">{{
                                t('profile.delete_account_desc') }}</p>
                            <button @click="showDeleteConfirm = true"
                                class="w-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer">
                                <AlertCircle class="w-5 h-5" />
                                {{ t('profile.delete_account') }}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </section>

            <!-- Logout -->
            <section>
                <button @click="handleLogout"
                    class="w-full flex items-center justify-center gap-2 p-4 text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors font-medium">
                    <LogOut class="w-5 h-5" />
                    {{ t('profile.logout') }}
                </button>
            </section>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            @click="showDeleteConfirm = false" />
        <GlassCard variant="white"
            class="w-full max-w-sm p-6 relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200 rounded-4xl!">
            <div class="text-center space-y-2">
                <div
                    class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm border border-red-100 dark:border-red-900/30">
                    <AlertCircle class="w-8 h-8" stroke-width="1.5" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">{{ t('profile.delete_account') }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                    {{ t('profile.delete_confirmation') }}
                </p>
            </div>

            <div class="space-y-4">
                <div class="space-y-2 text-center">
                    <label class="block text-xs text-slate-400 tracking-widest">

                        <i18n-t keypath="profile.type_delete_to_confirm" tag="span">
                            <template #word>
                                <span class="font-black text-slate-900 dark:text-white text-base">DELETE</span>
                            </template>
                        </i18n-t>
                    </label>
                    <input v-model="deleteConfirmationInput" type="text"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-center font-medium text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        placeholder="DELETE" />
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button @click="showDeleteConfirm = false"
                    class="flex-1 py-3.5 font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors dark:text-slate-300 dark:bg-white/10 dark:hover:bg-white/20">
                    {{ t('common.cancel') }}
                </button>
                <button @click="handleDeleteAccount" :disabled="deleteConfirmationInput !== 'DELETE' || isDeleting"
                    class="flex-1 py-3.5 text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                    <span v-if="isDeleting"
                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span v-else>{{ t('common.delete') }}</span>
                </button>
            </div>
        </GlassCard>
    </div>

    <Teleport to="body">
        <StatusToast :message="successMsg || errorMsg" :visible="showToast" :type="toastType" />
    </Teleport>
</template>
