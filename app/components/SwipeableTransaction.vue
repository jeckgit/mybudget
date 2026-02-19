<script setup lang="ts">
import type { Transaction } from '~/../shared/types'
import { Trash2 } from 'lucide-vue-next'
import { usePointerSwipe } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

/**
 * SwipeableTransaction Component
 * 
 * Provides a fluid swipe-to-delete gesture for transaction items.
 * Built with UX supreme "Zero-Friction" and accessibility in mind.
 */

const props = defineProps<{
    transaction: Transaction
    categoryEmoji?: string
    categoryName?: string
    formattedTime: string
    formattedAmount: string
    isIncome: boolean
}>()

const emit = defineEmits<{
    (e: 'delete', id: string): void
    (e: 'click', transaction: Transaction): void
}>()

const { t } = useI18n()

// 1. Setup Swipe Utilities
const container = ref<HTMLElement | null>(null)
const threshold = 80 // Distance in px to fully reveal delete button
const deleteWidth = 80 // Width of the delete button

const { distanceX, isSwiping, direction } = usePointerSwipe(container, {
    disableTextSelect: true,
    onSwipeEnd(e, direction) {
        if (direction === 'left' && Math.abs(distanceX.value) > threshold / 2) {
            // Snap to open if swiped enough
            translateX.value = -deleteWidth
        } else {
            // Snap back to closed
            translateX.value = 0
        }
    }
})

// 2. Local State for Offset
const translateX = ref(0)

// 3. Reactively update translateX while swiping
watchEffect(() => {
    if (isSwiping.value && direction.value === 'left') {
        const swipeDist = Math.max(0, -distanceX.value)
        translateX.value = -Math.min(swipeDist, deleteWidth + 30)
    } else if (isSwiping.value && direction.value === 'right') {
        const swipeDist = Math.max(0, distanceX.value)
        if (translateX.value < 0) {
            translateX.value = -Math.max(0, -translateX.value - swipeDist)
        }
    }
})

function handleDelete() {
    emit('delete', props.transaction.id)
    translateX.value = 0
}

function handleClick() {
    if (Math.abs(translateX.value) < 10) {
        emit('click', props.transaction)
    } else {
        translateX.value = 0
    }
}
</script>

<template>
    <div class="relative rounded-4xl group">
        <!-- Background Delete Action -->
        <!-- Absolute positioned behind the foreground, fading in on swipe to prevent translucent bleed-through -->
        <div class="absolute inset-y-0 right-0 w-24 flex items-center justify-end px-5 rounded-r-4xl transition-opacity duration-150"
            :style="{ opacity: isSwiping || translateX < 0 ? Math.min(1, Math.abs(translateX) / 40) : 0 }">
            <button @click.stop="handleDelete"
                class="flex flex-col items-center gap-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-transform active:scale-90"
                :aria-label="t('common.delete')">
                <Trash2 :size="20" stroke-width="2.5" />
                <span class="text-[10px] font-black uppercase tracking-tighter">{{ t('common.delete') || 'Delete'
                }}</span>
            </button>
        </div>

        <!-- Foreground Content -->
        <!-- Contains the original styling, sliding over the absolute background -->
        <div ref="container" @click="handleClick"
            class="relative flex items-center justify-between p-4 bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 active:scale-[0.98] transition-all duration-300 cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-purple-900/5 dark:hover:shadow-none will-change-transform rounded-4xl backdrop-blur-md"
            :class="{ 'transition-none!': isSwiping }" :style="{ transform: `translateX(${translateX}px)` }">
            <!-- Transaction Details -->
            <div class="flex items-center gap-4 min-w-0 flex-1">
                <div
                    class="w-12 h-12 shrink-0 rounded-2xl bg-white/80 dark:bg-white/10 flex items-center justify-center text-xl shadow-sm border border-white dark:border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {{ categoryEmoji || '💸' }}
                </div>
                <div class="min-w-0">
                    <p class="font-bold text-slate-800 text-sm dark:text-white truncate tracking-tight">
                        {{ categoryName || transaction.note || t('dashboard.default_note') }}
                    </p>
                    <p
                        class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 dark:text-slate-500">
                        {{ formattedTime }}
                    </p>
                </div>
            </div>

            <!-- Amount -->
            <div class="flex flex-col items-end gap-1">
                <span class="font-black text-base tracking-tighter whitespace-nowrap transition-colors"
                    :class="{ 'text-emerald-500 dark:text-emerald-400': isIncome, 'text-slate-800 dark:text-white': !isIncome }">
                    {{ isIncome ? '+' : '' }} {{ formattedAmount }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Prevent horizontal scroll on mobile while swiping */
.group {
    touch-action: pan-y;
}
</style>
