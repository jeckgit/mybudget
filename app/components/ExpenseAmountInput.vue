<script setup lang="ts">
import { hasMaxTwoDecimals, normalizeDecimalInput } from '~/utils/numberLocale';

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
    const next = normalizeDecimalInput(`${props.amount}${val}`);
    if (!hasMaxTwoDecimals(next)) return;
    emit('update:amount', next);
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
