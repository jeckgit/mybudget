<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { DollarSign } from 'lucide-vue-next';

// Shared state trigger
const showAnimation = useState<boolean>('showSuccessAnimation');
const isVisible = ref(false);

interface Particle {
    id: number;
    style: any;
}

const particles = ref<Particle[]>([]);
const colors = ['#1E71ED', '#F82681', '#FFBC32', '#50D05C', '#61dbfb'];

const generateParticles = () => {
    const count = 30;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 360;
        const velocity = 60 + Math.random() * 100; // Distance

        // Convert polar to cartesian
        const rad = angle * (Math.PI / 180);
        const tx = Math.cos(rad) * velocity;
        const ty = Math.sin(rad) * velocity;

        const color = colors[Math.floor(Math.random() * colors.length)];

        newParticles.push({
            id: i,
            style: {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                '--r': `${Math.random() * 360}deg`,
                '--c': color,
                '--d': `${Math.random() * 0.2}s`, // Delay
                '--s': `${0.5 + Math.random() * 0.5}`, // Scale
            }
        });
    }
    particles.value = newParticles;
};

// Generate initial batch
onMounted(() => {
    generateParticles();
});

watch(showAnimation, (newVal) => {
    if (newVal) {
        // Regenerate for randomness each time
        generateParticles();
        isVisible.value = true;
        showAnimation.value = false;

        setTimeout(() => {
            isVisible.value = false;
        }, 1500); // Allow time for particles to settle
    }
});
</script>

<template>
    <div v-if="isVisible" class="absolute left-1/2 -translate-x-1/2 bottom-8 pointer-events-none z-50">
        <!-- Main Floating Dollar -->
        <div class="float-dollar relative z-20">
            <div
                class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 border-2 border-white dark:border-slate-900">
                <DollarSign :size="28" :stroke-width="3" />
            </div>
        </div>

        <!-- Confetti Particles -->
        <div class="absolute inset-0 z-10 flex items-center justify-center">
            <div v-for="p in particles" :key="p.id" class="particle absolute w-2 h-2 rounded-[1px]" :style="{
                ...p.style,
                backgroundColor: 'var(--c)'
            }" />
        </div>
    </div>
</template>

<style scoped>
/* Main Dollar Animation */
.float-dollar {
    animation: float-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes float-up {
    0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0.5) rotate(-10deg);
    }

    20% {
        opacity: 1;
        transform: translate(-50%, -20px) scale(1.1) rotate(0deg);
    }

    100% {
        opacity: 0;
        transform: translate(calc(-50% + 40px), -100px) scale(0.9) rotate(10deg);
    }
}

/* Particle Animation */
.particle {
    opacity: 0;
    animation: explode 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    animation-delay: var(--d);
}

@keyframes explode {
    0% {
        opacity: 1;
        transform: translate(0, 0) scale(0) rotate(0deg);
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translate(var(--tx), var(--ty)) scale(var(--s)) rotate(var(--r));
    }
}
</style>
