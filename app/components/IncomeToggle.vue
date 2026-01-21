<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const toggle = (val: boolean) => {
    emit('update:modelValue', val);
};
</script>

<template>
    <div class="flex justify-center mb-4">
        <div
            class="flex bg-slate-100 p-1 rounded-full dark:bg-white/5 border border-slate-200 dark:border-white/10 relative">
            <!-- Sliding Background -->
            <div class="absolute inset-y-1 rounded-full bg-white shadow-sm dark:bg-white/10 transition-all duration-300 ease-out w-[calc(50%-4px)]"
                :class="{ 'translate-x-full left-0': modelValue, 'translate-x-0 left-1': !modelValue }">
            </div>

            <button @click="toggle(false)"
                class="relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300"
                :class="{ 'text-slate-800 dark:text-white': !modelValue, 'text-slate-400 dark:text-slate-500 hover:text-slate-600': modelValue }">
                {{ t('common.expense') }}
            </button>
            <button @click="toggle(true)"
                class="relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300"
                :class="{ 'text-green-600 dark:text-green-400': modelValue, 'text-slate-400 dark:text-slate-500 hover:text-slate-600': !modelValue }">
                {{ t('common.income') }}
            </button>
        </div>
    </div>
</template>
