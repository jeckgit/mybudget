<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';

defineProps<{
    message: string
    visible: boolean
}>()
</script>

<template>
    <Transition enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-10 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="visible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 
                bg-white/90 dark:bg-slate-800/90 backdrop-blur-md 
                border border-red-200 dark:border-red-900/50 
                shadow-lg shadow-red-500/10 rounded-2xl
                min-w-75 max-w-md">
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0">
                <AlertCircle class="w-5 h-5 text-red-500" />
            </div>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
                {{ message }}
            </p>
        </div>
    </Transition>
</template>
