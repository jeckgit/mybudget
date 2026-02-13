<script setup lang="ts">
import { X, Mail } from 'lucide-vue-next';

const user = useSupabaseUser();
const { t } = useI18n();
const profileStore = useProfileStore();

const isVisible = useState('verificationBannerVisible', () => true);

const isConfirmed = computed(() => !!profileStore.config.value.emailVerifiedAt);

const dismiss = () => {
    isVisible.value = false;
};
</script>

<template>
    <Transition name="slide-down">
        <div v-if="user && !isConfirmed && isVisible" class="fixed top-0 left-0 right-0 z-100 p-4">
            <div class="max-w-xl mx-auto">
                <div
                    class="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 dark:bg-purple-900/20 dark:border-white/10">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 dark:bg-purple-500/20 dark:text-purple-300">
                            <Mail class="w-5 h-5" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-white leading-tight"
                                v-text="t('verification_banner.title')" />
                            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-normal"
                                v-text="t('verification_banner.desc')" />
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
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
