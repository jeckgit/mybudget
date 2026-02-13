<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

defineProps<{
    text: string
}>()

const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const activeTooltipId = useState<string | null>('active-tooltip-id', () => null)
const instanceId = `tooltip-${Math.random().toString(36).slice(2, 10)}`
const isOpen = computed(() => activeTooltipId.value === instanceId)

const updatePosition = () => {
    if (!triggerRef.value) return
    const rect = triggerRef.value.getBoundingClientRect()
    tooltipStyle.value = {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - 12}px`,
        transform: 'translate(-50%, -100%)'
    }
}

const toggle = async () => {
    if (isOpen.value) {
        activeTooltipId.value = null
        return
    }

    activeTooltipId.value = instanceId
    if (isOpen.value) {
        await nextTick()
        updatePosition()
    }
}

const close = (e: MouseEvent) => {
    const target = e.target as Node
    const clickedTrigger = containerRef.value?.contains(target)
    const clickedTooltip = tooltipRef.value?.contains(target)

    if (!clickedTrigger && !clickedTooltip && isOpen.value) {
        activeTooltipId.value = null
    }
}

const handleViewportChange = () => {
    if (isOpen.value) {
        updatePosition()
    }
}

onMounted(() => {
    document.addEventListener('click', close)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
})

onUnmounted(() => {
    document.removeEventListener('click', close)
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('scroll', handleViewportChange, true)
})
</script>

<template>
    <div ref="containerRef" class="relative inline-flex items-center">
        <!-- Trigger -->
        <div ref="triggerRef" @click.stop="toggle" class="cursor-pointer">
            <slot />
        </div>

        <Teleport to="body">
            <!-- Tooltip Body -->
            <Transition enter-active-class="transition-opacity duration-100 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition-opacity duration-75 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="isOpen" :style="tooltipStyle" class="fixed px-4 py-3 
                      min-w-50 text-center
                      bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
                      border border-white/60 dark:border-white/10
                      text-slate-600 dark:text-slate-300 text-xs font-medium rounded-2xl
                      shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-200" ref="tooltipRef">
                    {{ text }}
                    <!-- Glass Arrow -->
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3
                        bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
                        border-b border-r border-white/60 dark:border-white/10
                        rotate-45"></div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
