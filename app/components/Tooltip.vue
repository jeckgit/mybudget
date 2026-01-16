<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
    text: string
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggle = () => {
    isOpen.value = !isOpen.value
}

const close = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', close)
})

onUnmounted(() => {
    document.removeEventListener('click', close)
})
</script>

<template>
    <div ref="containerRef" class="relative inline-flex items-center">
        <!-- Trigger -->
        <div @click.stop="toggle" class="cursor-pointer">
            <slot />
        </div>

        <!-- Tooltip Body -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-1 opacity-0">
            <div v-if="isOpen" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 
                  min-w-[200px] text-center
                  bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
                  border border-white/60 dark:border-white/10
                  text-slate-600 dark:text-slate-300 text-xs font-medium rounded-2xl
                  shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-50">
                {{ text }}
                <!-- Glass Arrow -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3
                    bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
                    border-b border-r border-white/60 dark:border-white/10
                    rotate-45"></div>
            </div>
        </Transition>
    </div>
</template>
