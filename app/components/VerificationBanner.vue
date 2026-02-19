<script setup lang="ts">
import { X, Mail } from 'lucide-vue-next';

const user = useSupabaseUser();
const { t, locale } = useI18n();
const profileStore = useProfileStore();

// UI State
const isVisible = useState('verificationBannerVisible', () => true);
const loading = ref(false);
const sent = ref(false);

// Robust check: Profile store OR Supabase auth metadata
const isConfirmed = computed(() => {
    if (profileStore.config.value.emailVerifiedAt) return true;
    if (user.value?.email_confirmed_at) return true;
    return false;
});

const dismiss = () => {
    isVisible.value = false;
};

const resendEmail = async () => {
    if (loading.value || sent.value) return;
    loading.value = true;

    try {
        const response = await $fetch('/api/auth/resend-verification', {
            method: 'POST',
            body: { language: locale.value }
        });

        if (response.ok) {
            sent.value = true;
            setTimeout(() => { sent.value = false; }, 10000); // Reset after 10s
        }
    } catch (error) {
        console.error('Resend failed:', error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Transition name="slide-down">
        <div v-if="user && !isConfirmed && isVisible" class="fixed top-0 left-0 right-0 z-50 p-4">
            <div class="max-w-xl mx-auto">
                <div
                    class="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl p-4 flex items-center justify-between gap-4 dark:bg-slate-900/90 dark:border-white/10">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 dark:bg-purple-500/20 dark:text-purple-300">
                            <Mail class="w-5 h-5" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                {{ sent ? t('verification_banner.title_sent') : t('verification_banner.title') }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-normal">
                                {{ sent ? t('verification_banner.desc_sent') : t('verification_banner.desc') }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button v-if="!sent" @click="resendEmail" :disabled="loading"
                            class="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                            {{ loading ? t('verification_banner.sending') : t('verification_banner.resend') }}
                        </button>
                        <span v-else class="text-xs font-bold text-green-600 dark:text-green-400 px-3 py-1.5">
                            {{ t('verification_banner.sent') }}
                        </span>

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
