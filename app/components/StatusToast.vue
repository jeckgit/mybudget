<script setup lang="ts">
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next';

defineProps<{
    message: string
    visible: boolean
    type?: 'success' | 'error'
}>()
</script>

<template>
    <Transition enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-10 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="visible" class="fixed bottom-28 left-1/2 -translate-x-1/2 z-100 flex items-center gap-3 px-4 py-3 
                bg-white/95 dark:bg-slate-800/95 backdrop-blur-md 
                border shadow-xl rounded-2xl
                min-w-70 max-w-md transition-all" :class="[
                    type === 'success'
                        ? 'border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/10'
                        : 'border-rose-100 dark:border-rose-900/30 shadow-rose-500/10'
                ]">
            <div class="p-2 rounded-full shrink-0" :class="[
                type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'
            ]">
                <CheckCircle2 v-if="type === 'success'" class="w-5 h-5 text-emerald-500" />
                <AlertCircle v-else class="w-5 h-5 text-rose-500" />
            </div>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">
                {{ message }}
            </p>
        </div>
    </Transition>
</template>
