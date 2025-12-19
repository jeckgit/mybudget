<script setup lang="ts">
import { User, Mail, Save, AlertCircle, CheckCircle2, Trash2, Globe, Moon, Sun, Monitor, LogOut } from 'lucide-vue-next';

// Composables
const user = useSupabaseUser();
const client = useSupabaseClient();
const { t, locale, setLocale } = useI18n();
const { state, loadState, clearState, updateConfig } = useStorage();
const { colorMode, updateTheme } = useTheme();

// --- Profile/Email Logic ---
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const newEmail = ref('');

// Initialize newEmail with current email
watchEffect(() => {
    if (user.value?.email) {
        newEmail.value = user.value.email;
    }
});

const handleUpdateEmail = async () => {
    if (!newEmail.value || newEmail.value === user.value?.email) return;

    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    try {
        const { error } = await client.auth.updateUser({
            email: newEmail.value
        });

        if (error) throw error;

        successMsg.value = t('profile.confirmation_sent');
    } catch (e: any) {
        errorMsg.value = e.message;
    } finally {
        loading.value = false;
    }
};

const displayName = computed(() => {
    if (!user.value) return t('common.guest');
    return user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || t('common.user');
});

// --- Settings Logic ---
const currencies = ['$', '€', '£', '¥', 'CHF'];
const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
];

const handleReset = async () => {
    if (confirm(t('settings.reset_confirm'))) {
        await clearState();
        await loadState();
        navigateTo('/onboarding');
    }
};

const handleLogout = async () => {
    const { error } = await client.auth.signOut();
    if (error) console.error(error);
    navigateTo('/auth/login');
};

const updateLanguage = (code: string) => {
    setLocale(code as any);
    updateConfig({ language: code });
};

// Sync local state with global settings on mount
onMounted(() => {
    if (state.value.config.language && state.value.config.language !== locale.value) {
        setLocale(state.value.config.language as any);
    }
});
</script>

<template>
    <div class="p-6 pb-32 max-w-lg mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">{{ t('profile.title') }}</h1>
        </header>

        <div class="space-y-6">
            <!-- User Info Card -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('settings.preferences') }}
                </h2>
                <GlassCard variant="white" class="p-6 !rounded-2xl flex-col space-y-4">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                            <User class="w-10 h-10" />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white">{{ displayName }}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('profile.member_since', {
                                date:
                                    new
                                        Date(user?.created_at
                                            || '').toLocaleDateString()
                            }) }}</p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            <!-- Preferences Section (Moved from Settings) -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('settings.global_settings') }}
                </h2>
                <GlassCard variant="white" class="p-4 !rounded-2xl space-y-4">
                    <!-- Language -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Globe class="w-5 h-5" />
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.language')
                            }}</span>
                        </div>
                        <select :value="locale" @change="updateLanguage(($event.target as HTMLSelectElement).value)"
                            class="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                                <ClientOnly>
                                    <Moon class="w-5 h-5" v-if="colorMode === 'dark'" />
                                    <Sun class="w-5 h-5" v-else-if="colorMode === 'light'" />
                                    <Monitor class="w-5 h-5" v-else />
                                </ClientOnly>
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.theme')
                            }}</span>
                        </div>
                        <div class="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1">
                            <ClientOnly>
                                <button v-for="theme in ['light', 'system', 'dark']" :key="theme"
                                    @click="updateTheme(theme as 'light' | 'system' | 'dark')"
                                    class="p-2 rounded-md transition-all"
                                    :class="colorMode === theme ? 'bg-white dark:bg-white shadow-sm text-purple-600 dark:text-black' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'"
                                    :title="t(`settings.themes.${theme}`)">
                                    <Sun class="w-4 h-4" v-if="theme === 'light'" />
                                    <Monitor class="w-4 h-4" v-if="theme === 'system'" />
                                    <Moon class="w-4 h-4" v-if="theme === 'dark'" />
                                </button>
                            </ClientOnly>
                        </div>
                    </div>

                    <!-- Currency -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <span class="text-lg font-bold">$</span>
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{ t('settings.currency')
                            }}</span>
                        </div>
                        <div class="flex gap-2">
                            <button v-for="c in currencies" :key="c" @click="updateConfig({ currencySymbol: c })"
                                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:cursor-pointer"
                                :class="state.config.currencySymbol === c ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700'">
                                {{ c }}
                            </button>
                        </div>
                    </div>
                    <!-- Monthly Budget -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <span class="text-xs font-bold">{{ state.config.currencySymbol }}</span>
                            </div>
                            <span class="font-medium text-slate-700 dark:text-slate-200">{{
                                t('settings.monthly_budget') }}</span>
                        </div>
                        <div class="relative w-32">
                            <span
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">{{
                                    state.config.currencySymbol }}</span>
                            <input :value="state.config.monthlyLimit" type="number"
                                @change="updateConfig({ monthlyLimit: Number(($event.target as HTMLInputElement).value) })"
                                class="w-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-lg pl-8 pr-3 py-2 text-right text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    </div>
                </GlassCard>
            </section>

            <!-- Email Update Section -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">
                    {{ t('profile.account_security') }}
                </h2>
                <GlassCard variant="white" class="p-6 !rounded-2xl space-y-4">
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

                    <div v-if="errorMsg"
                        class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle class="w-4 h-4 shrink-0" />
                        {{ errorMsg }}
                    </div>

                    <div v-if="successMsg"
                        class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle2 class="w-4 h-4 shrink-0" />
                        {{ successMsg }}
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

            <!-- Data Management -->
            <section>
                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 dark:text-slate-500">{{
                    t('settings.data') }}</h2>
                <GlassCard variant="white" class="p-4 !rounded-2xl">
                    <button @click="handleReset"
                        class="w-full flex items-center justify-between p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                <Trash2 class="w-5 h-5" />
                            </div>
                            <span class="font-medium">{{ t('settings.reset_data') }}</span>
                        </div>
                    </button>
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
</template>
