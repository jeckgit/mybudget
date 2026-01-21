<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  fullWidth: false,
  disabled: false,
  class: ''
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return "bg-black/90 text-white shadow-lg shadow-accent/20 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 dark:shadow-none";
    case 'secondary':
      return "bg-white/50 border border-white/60 text-slate-700 hover:bg-white/70 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20";
    case 'ghost':
      return "bg-transparent text-slate-600 hover:bg-white/30 dark:text-white dark:hover:bg-white/10";
    case 'danger':
      return "bg-red-50/50 text-red-500 border border-red-100/50 hover:bg-red-100/50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40 dark:hover:bg-red-900/30";
    default:
      return "bg-black/90 text-white shadow-lg shadow-accent/20 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 dark:shadow-none";
  }
});
</script>
<template>
  <button :class="[
    'cursor-pointer relative px-6 py-4 rounded-3xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 overflow-hidden backdrop-blur-xl',
    variantClasses,
    fullWidth ? 'w-full' : '',
    props.class
  ]" :disabled="disabled" v-bind="$attrs">
    <slot />
  </button>
</template>