<script setup lang="ts">
const props = defineProps<{
    amount: string;
    isIncome: boolean;
    isEditing: boolean;
    submitLabel?: string;
}>();

const emit = defineEmits<{
    'update:amount': [string];
    'update:isIncome': [boolean];
    'submit': [];
    'delete': [];
}>();

const handleInput = (val: string) => {
    emit('update:amount', props.amount + val);
};

const handleDelete = () => {
    emit('update:amount', props.amount.slice(0, -1));
};

const handleToggle = (val: boolean) => {
    emit('update:isIncome', val);
};
</script>

<template>
    <div class="expense-amount-input">
        <IncomeToggle :model-value="isIncome" @update:model-value="handleToggle" />

        <AmountDisplay :value="amount" :is-income="isIncome" :is-editing="isEditing" />

        <NumberPad :value="amount" @input="handleInput" @delete="handleDelete" @submit="emit('submit')"
            :submit-label="submitLabel" />
    </div>
</template>
