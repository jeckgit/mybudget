<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
    value: string;
    isIncome: boolean;
    isEditing: boolean;
}>();

const { t } = useI18n();
</script>

<template>
    <div class="text-center mb-6">
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 dark:text-slate-400 transition-colors"
            :class="{ 'text-green-500! dark:text-green-400!': isIncome }">
            {{ isIncome ? (isEditing ? t('common.edit_income') : t('common.add_income_modal')) :
                (isEditing ? t('common.edit_expense') : t('common.add_expense_modal'))
            }}
        </p>
        <div class="flex items-center justify-center gap-1 transition-colors duration-300"
            :class="{ 'text-green-500': isIncome }">
            <span class="text-7xl font-bold text-slate-800 tracking-tighter dark:text-white"
                :class="{ 'text-green-600! dark:text-green-400!': isIncome }">
                {{ value || "0" }}
            </span>
        </div>
    </div>
</template>
