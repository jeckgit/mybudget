<template>
  <button 
    :class="[
      'relative px-6 py-4 rounded-[1.5rem] font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 overflow-hidden backdrop-blur-xl',
      variantClasses,
      fullWidth ? 'w-full' : '',
      props.class
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

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
      return "bg-black/90 text-white shadow-lg shadow-purple-900/20 hover:bg-black";
    case 'secondary':
      return "bg-white/50 border border-white/60 text-slate-700 hover:bg-white/70";
    case 'ghost':
      return "bg-transparent text-slate-600 hover:bg-white/30";
    case 'danger':
      return "bg-red-50/50 text-red-500 border border-red-100/50 hover:bg-red-100/50";
    default:
      return "bg-black/90 text-white shadow-lg shadow-purple-900/20 hover:bg-black";
  }
});
</script>