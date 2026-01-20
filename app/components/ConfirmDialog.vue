<script setup lang="ts">
const { isVisible, options, handleUserChoice } = useConfirm();
const { t } = useI18n();

// Close on escape key
// onKeyStroke('Escape', () => handleUserChoice(false))
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isVisible"
                class="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                @click="handleUserChoice(false)">

                <div
                    class="w-full max-w-sm overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 p-8 text-center relative">

                    <!-- Decorative background gradient (subtle) -->
                    <div
                        class="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                    <h3 v-if="options.title"
                        class="relative text-xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                        {{ options.title }}
                    </h3>

                    <p class="relative text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                        {{ options.message }}
                    </p>

                    <div class="relative flex gap-3">
                        <button @click="handleUserChoice(false)"
                            class="flex-1 py-4 px-4 rounded-2xl font-bold text-sm bg-slate-100/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                            {{ options.cancelText || t('common.cancel') }}
                        </button>

                        <button @click="handleUserChoice(true)" :class="[
                            'flex-1 py-4 px-4 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all',
                            options.isDestructive
                                ? 'bg-linear-to-br from-red-500 to-rose-600 shadow-red-500/30 hover:shadow-red-500/40'
                                : 'bg-linear-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 dark:text-slate-900 shadow-slate-900/20 dark:shadow-white/20'
                        ]">
                            {{ options.confirmText || t('common.confirm_expense') }}
                        </button>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>
