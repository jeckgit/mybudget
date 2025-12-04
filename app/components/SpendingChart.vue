<template>
  <div class="w-full h-48">
    <VChart v-if="mounted" :option="chartOption" class="w-full h-full" />
    <div v-else class="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'

interface ChartData {
  day: number;
  amount: number;
}

interface Props {
  data: ChartData[];
  dailyLimit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  dailyLimit: 50
});

const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

const chartOption = computed(() => ({
  grid: {
    top: 20,
    right: 20,
    bottom: 40,
    left: 20,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.day),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#94A3B8',
      fontSize: 10,
      interval: 4 // Show every 5th day
    }
  },
  yAxis: {
    type: 'value',
    show: false
  },
  series: [
    {
      data: props.data.map(d => ({
        value: d.amount,
        itemStyle: {
          color: d.amount > props.dailyLimit * 1.5 ? '#F87171' : '#C084FC',
          borderRadius: [2, 2, 0, 0]
        }
      })),
      type: 'bar',
      barWidth: '60%',
      showBackground: false
    }
  ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textStyle: {
      color: '#475569'
    },
    formatter: (params: any) => {
      const data = params[0];
      return `Day ${data.axisValue}<br/>Spent: $${data.value}`;
    }
  }
}));
</script>