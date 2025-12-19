<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    name?: string;
    size?: number;
}>();

const initials = computed(() => {
    if (!props.name) return '??';

    // Clean the name and split by non-word characters
    const parts = props.name.trim().split(/[\s._-]+/).filter(part => part.length > 0);

    if (parts.length === 0) return '??';

    const firstPart = parts[0]!;
    if (parts.length === 1) {
        return firstPart.substring(0, 2).toUpperCase();
    }

    const lastPart = parts[parts.length - 1]!;
    // Safe access using charAt
    return (firstPart.charAt(0) + lastPart.charAt(0)).toUpperCase();
});

// Simple hash function to generate consistent colors
const backgroundColor = computed(() => {
    const str = props.name || 'default';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // HSL colors to ensure good visibility with white text
    // Hue: 0-360 based on hash
    // Saturation: 60-80% for vibrancy
    // Lightness: 40-50% for good contrast with white text
    const h = Math.abs(hash) % 360;
    const s = 70;
    const l = 45;

    return `hsl(${h}, ${s}%, ${l}%)`;
});

const sizeStyle = computed(() => {
    const s = props.size || 40;
    return {
        width: `${s}px`,
        height: `${s}px`,
        fontSize: `${Math.max(12, s * 0.4)}px`
    };
});
</script>

<template>
    <div class="flex items-center justify-center rounded-2xl font-bold text-white shadow-sm select-none border border-white/20 dark:border-white/10"
        :style="{ backgroundColor, ...sizeStyle }">
        {{ initials }}
    </div>
</template>
