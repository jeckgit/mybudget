<script setup lang="ts">
import { Cookie } from 'lucide-vue-next';
const { t } = useI18n();

// 'essential' | 'all' | undefined
const consent = useCookie('cookie_consent', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    watch: true
});

const isVisible = ref(false);

onMounted(() => {
    // Check if consent is set
    setTimeout(() => {
        if (!consent.value) {
            isVisible.value = true;
        }
    }, 1000); // Small delay for better UX on load
});

const acceptAll = () => {
    consent.value = 'all';
    isVisible.value = false;
};

const acceptEssential = () => {
    consent.value = 'essential';
    isVisible.value = false;
};
</script>

<template>
    <div v-if="isVisible" class="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <GlassCard variant="white"
            class="w-full max-w-4xl p-4 md:p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-700 !bg-white/90 dark:!bg-slate-900/95 !backdrop-blur-xl border-slate-200/50 dark:border-white/10">
            <div class="flex flex-col md:flex-row items-center gap-6">
                <!-- Icon & Text -->
                <div class="flex items-start gap-4 flex-1">
                    <div
                        class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        <Cookie class="w-6 h-6" />
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                            {{ t('cookies.text') }}
                        </p>
                        <NuxtLink to="/legal/privacy"
                            class="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors uppercase tracking-wider inline-flex items-center gap-1">
                            {{ t('cookies.privacy_link') }} →
                        </NuxtLink>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <button @click="acceptEssential"
                        class="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100/50 hover:bg-slate-100 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                        {{ t('cookies.essential') }}
                    </button>
                    <button @click="acceptAll"
                        class="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10 dark:shadow-white/5 transition-all active:scale-95 whitespace-nowrap">
                        {{ t('cookies.accept') }}
                    </button>
                </div>
            </div>
        </GlassCard>
    </div>
</template>
