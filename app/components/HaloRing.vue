<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="relative z-10 rotate-[-90deg]">
      <!-- Track -->
      <circle
        :stroke="trackColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <!-- Progress -->
      <circle
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
        :style="{
          strokeDasharray: circumference,
          strokeDashoffset: strokeDashoffset,
          transition: 'stroke-dashoffset 1.5s ease-out, stroke 1.5s ease-out'
        }"
      />
    </svg>
    
    <!-- Inner Content -->
    <div class="absolute inset-0 flex items-center justify-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string; // Hex color
  trackColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 280,
  strokeWidth: 20,
  color: '#C084FC',
  trackColor: '#F1F5F9'
});

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => radius.value * 2 * Math.PI);
const strokeDashoffset = computed(() => {
  const clampedProgress = Math.min(Math.max(props.progress, 0), 1);
  return circumference.value - (clampedProgress * circumference.value);
});
</script>