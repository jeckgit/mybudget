<template>
    <div class="w-full h-64 relative">
        <VChart v-if="mounted" :option="chartOption" class="w-full h-full" />
        <div v-else class="w-full h-full bg-slate-100 rounded-xl animate-pulse" />

        <!-- Central Text -->
        <div v-if="mounted" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ t('analytics.total_spent') }}
            </p>
            <p class="text-xl font-bold text-slate-800 dark:text-white">{{ formattedTotal }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

const { t } = useI18n();

interface CategoryData {
    name: string;
    amount: number;
    emoji: string;
    color?: string;
}

interface Props {
    data: CategoryData[];
    total: number;
    currencySymbol: string;
}

const props = defineProps<Props>();

const mounted = ref(false);

onMounted(() => {
    mounted.value = true;
});

const formattedTotal = computed(() => {
    return `${props.currencySymbol}${Math.round(props.total)}`;
});

const chartOption = computed(() => ({
    tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
            return `<div class="flex items-center gap-2">
            <span>${params.data.emoji}</span>
            <span class="font-bold">${params.name}</span>
            <span>${props.currencySymbol}${params.value}</span>
        </div>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: [8, 12],
        textStyle: { color: '#1E293B', fontSize: 12 },
        extraCssText: 'backdrop-filter: blur(8px); shadow: none; border: none;'
    },
    series: [
        {
            name: 'Spending',
            type: 'pie',
            radius: ['60%', '85%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: false
                }
            },
            labelLine: {
                show: false
            },
            data: props.data.map((d, i) => ({
                value: Math.round(d.amount),
                name: d.name,
                emoji: d.emoji,
                itemStyle: {
                    color: [
                        '#C084FC', // Purple
                        '#F472B6', // Pink
                        '#60A5FA', // Blue
                        '#34D399', // Green
                        '#FBBF24', // Yellow
                        '#F87171', // Red
                    ][i % 6]
                }
            }))
        }
    ]
}));
</script>
