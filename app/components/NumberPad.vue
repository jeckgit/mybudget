<template>
  <div class="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-4">
    <button v-for="n in numbers" :key="n" @click="handleInput(n)" :class="[
      'h-16 rounded-3xl text-2xl font-medium transition-all active:scale-95 flex items-center justify-center',
      n === 'del'
        ? 'text-red-400 bg-red-50/50 dark:text-red-300 dark:bg-red-900/20'
        : 'text-slate-800 bg-white/40 border border-white/60 shadow-sm dark:text-white dark:bg-white/5 dark:border-white/10 dark:shadow-black/20'
    ]">
      {{ n === 'del' ? '⌫' : n }}
    </button>

    <div class="col-span-3 mt-4">
      <GlassButton variant="primary" :full-width="true" @click="$emit('submit')" :disabled="!value || value === '0'"
        class="py-5! bg-black! text-lg! rounded-4xl! dark:bg-white! dark:text-black!">
        {{ submitLabel || t('common.confirm_expense') }}
      </GlassButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string;
  submitLabel?: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const emit = defineEmits<{
  input: [value: string];
  delete: [];
  submit: [];
}>();

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, 'del'];

const handleInput = (n: string | number) => {
  if (n === 'del') {
    emit('delete');
  } else if (n === ',') {
    // Prevent multiple decimals
    if (props.value && props.value.includes('.')) return;
    // Emit as dot for logic, but it was presented as comma
    emit('input', '.');
  } else {
    emit('input', n.toString());
  }
};
</script>