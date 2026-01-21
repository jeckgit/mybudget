<script setup lang="ts">
defineProps<{
    modelValue: string;
    isIncome: boolean;
    formattedDate: string;
}>();

const emit = defineEmits(['update:modelValue']);

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    emit('update:modelValue', target.value);
};
</script>

<template>
    <div class="flex justify-center mb-6">
        <label class="relative cursor-pointer group">
            <input type="datetime-local" :value="modelValue" @input="handleInput"
                class="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
            <div class="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-bold border border-purple-100 group-hover:bg-purple-100 transition-colors dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500/30 dark:group-hover:bg-purple-900/40"
                :class="{ 'bg-green-50! text-green-600! border-green-100! group-hover:bg-green-100! dark:bg-green-900/20! dark:text-green-300! dark:border-green-500/30!': isIncome }">
                <span>📅</span>
                <span>{{ formattedDate }}</span>
            </div>
        </label>
    </div>
</template>
