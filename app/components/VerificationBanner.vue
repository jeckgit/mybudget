<script setup lang="ts">
import { AlertCircle, X, Mail, CheckCircle2 } from 'lucide-vue-next';

const user = useSupabaseUser();
const client = useSupabaseClient();
const { t } = useI18n();

const isVisible = useState('verificationBannerVisible', () => true);
const loading = ref(false);
const success = ref(false);
const errorMsg = ref('');

const isConfirmed = computed(() => !!user.value?.email_confirmed_at);

const handleResend = async () => {
    if (!user.value?.email) return;

    loading.value = true;
    errorMsg.value = '';

    try {
        const { error } = await client.auth.updateUser({
            email: user.value.email,
        });

        if (error) throw error;

        success.value = true;
        setTimeout(() => {
            success.value = false;
        }, 5000);
    } catch (e: any) {
        errorMsg.value = e.message;
    } finally {
        loading.value = false;
    }
};

const dismiss = () => {
    isVisible.value = false;
};
</script>

<template>
    <Transition name="slide-down">
        <div v-if="user && !isConfirmed && isVisible" class="fixed top-0 left-0 right-0 z-[100] p-4">
            <div class="max-w-xl mx-auto">
                <div
                    class="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 dark:bg-purple-900/20 dark:border-white/10">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 dark:bg-purple-500/20 dark:text-purple-300">
                            <Mail v-if="!success" class="w-5 h-5" />
                            <CheckCircle2 v-else class="w-5 h-5" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-white leading-tight"
                                v-text="success ? t('verification_banner.title_sent') : t('verification_banner.title')" />
                            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-normal"
                                v-text="success ? t('verification_banner.desc_sent') : t('verification_banner.desc')" />
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button @click="handleResend" :disabled="loading || success"
                            class="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                            :class="[
                                success ? 'bg-green-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            ]">
                            <span v-if="loading" class="flex items-center gap-2">
                                <span
                                    class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {{ t('verification_banner.sending') }}
                            </span>
                            <span v-else>{{ success ? t('verification_banner.sent') : t('verification_banner.resend')
                                }}</span>
                        </button>

                        <button @click="dismiss"
                            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>
