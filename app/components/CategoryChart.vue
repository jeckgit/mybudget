<template>
  <div class="w-full h-32">
    <VChart v-if="mounted" :option="chartOption" class="w-full h-full" />
    <div v-else class="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: CategoryData[];
}

const props = defineProps<Props>();

const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: ${c} ({d}%)'
  },
  series: [
    {
      name: 'Spending',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: props.data.map(item => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: item.color
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: false
      },
      labelLine: {
        show: false
      }
    }
  ]
}));
</script>