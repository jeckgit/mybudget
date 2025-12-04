<template>
  <div class="h-24 w-full -ml-2">
    <div class="flex items-end justify-between h-full gap-1">
      <div 
        v-for="(val, i) in chartData" 
        :key="i" 
        :class="[
          'rounded-t transition-all duration-300',
          i === highlightIndex ? highlightColor : defaultColor
        ]" 
        :style="{ 
          height: val + '%', 
          width: barWidth 
        }" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data?: number[];
  highlightIndex?: number;
  highlightColor?: string;
  defaultColor?: string;
  barWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [30, 45, 25, 60, 40, 75, 50],
  highlightIndex: 5,
  highlightColor: 'bg-pink-400',
  defaultColor: 'bg-slate-300',
  barWidth: '12px'
});

const chartData = computed(() => {
  // Normalize data to percentages
  const max = Math.max(...props.data);
  return props.data.map(val => Math.max((val / max) * 100, 5)); // minimum 5% height
});
</script>