<template>
  <div :class="[
    'relative overflow-hidden backdrop-blur-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem]',
    variantClasses,
    props.class
  ]" v-bind="$attrs">
    <!-- The "Liquid Shine" overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-60 pointer-events-none" />

    <!-- Content wrapper to ensure z-index above the shine -->
    <div class="relative z-10 h-full">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'white' | 'glass' | 'featured';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  class: ''
});

const variantClasses = computed(() => {
  const baseStyles = "relative overflow-hidden backdrop-blur-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

  switch (props.variant) {
    case 'glass':
      return `${baseStyles} bg-gradient-to-br from-white/60 to-white/30`;
    case 'white':
      return `${baseStyles} bg-white/80 border-white/60`;
    case 'featured':
      return "relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-[#FFE4E6]/80 to-[#E9D5FF]/80 border border-white/50 shadow-[0_10px_40px_-10px_rgba(192,132,252,0.3)]";
    default:
      return `${baseStyles} bg-gradient-to-br from-white/60 to-white/30`;
  }
});
</script>