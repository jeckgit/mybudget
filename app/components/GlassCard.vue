<template>
  <div :class="[
    'relative overflow-hidden backdrop-blur-3xl rounded-[2.5rem]',
    variantClasses,
    props.class
  ]" v-bind="$attrs">
    <div class="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent 
                dark:from-white/10 
                opacity-60 dark:opacity-20 
                pointer-events-none" />

    <!-- Content wrapper -->
    <div class="relative z-10 h-full">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'white' | 'glass' | 'featured';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'glass',
  class: ''
});

const variantClasses = computed(() => {
  // Base: Border logic handled here to ensure it's subtle in dark mode
  const baseStyles = "border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]";

  switch (props.variant) {
    case 'glass':
      return `${baseStyles} bg-gradient-to-br from-white/60 to-white/30 dark:from-black/60 dark:to-black/30 dark:bg-black/20 dark:border-white/5 dark:backdrop-blur-2xl`;

    case 'white':
      return `${baseStyles} bg-white/80 border-white/60 dark:bg-[#1e1e1e]/10 dark:border-white/5 dark:backdrop-blur-2xl`;

    case 'featured':
      // Muted the dark mode gradients to match the "Dusty" look we defined earlier
      return `relative overflow-hidden backdrop-blur-3xl 
              bg-gradient-to-br from-[#FFE4E6]/80 to-[#E9D5FF]/80 
              border border-white/50 
              shadow-[0_10px_40px_-10px_rgba(192,132,252,0.3)] 

              dark:from-[#1e1b4b]/40 dark:to-[#312e81]/40 
              dark:border-white/10 
              dark:shadow-none`;

    default:
      return `${baseStyles} bg-gradient-to-br from-white/60 to-white/30 dark:bg-black/2`;
  }
});
</script>