<script setup lang="ts">
import type { Category } from '~/../shared/types'

defineProps<{
    categories: Category[];
    selectedId: string;
    isIncome: boolean;
    getCategoryName: (cat: Category) => string;
}>();

const emit = defineEmits(['select']);

const select = (cat: Category) => {
    emit('select', cat);
};
</script>

<template>
    <div class="grid grid-cols-2 gap-3 mb-4">
        <button v-for="cat in categories" :key="cat.id" @click="select(cat)"
            class="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 active:scale-95 transition-all duration-300 dark:bg-white/5 dark:border-white/5 dark:text-slate-300"
            :class="{
                'bg-purple-50! border-purple-200! text-purple-600! dark:bg-purple-900/20! dark:border-purple-500/30!': selectedId === cat.id && !isIncome,
                'bg-green-50! border-green-200! text-green-600! dark:bg-green-900/20! dark:border-green-500/30!': selectedId === cat.id && isIncome
            }">
            <span class="text-4xl mb-2">{{ cat.emoji }}</span>
            <span class="text-xs font-bold uppercase tracking-wider opacity-80">{{
                getCategoryName(cat) }}</span>
        </button>
    </div>
</template>
