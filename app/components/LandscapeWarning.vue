<script setup lang="ts">
import { Smartphone } from 'lucide-vue-next';
const { t } = useI18n();
</script>

<template>
    <div class="landscape-warning fixed inset-0 z-9999 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
        aria-hidden="true">
        <div class="relative mb-8 animate-pulse">
            <Smartphone class="w-24 h-24 text-white rotate-90" stroke-width="1.5" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-3">
            {{ t('common.rotate_device_title') }}
        </h2>
        <p class="text-slate-400 max-w-xs mx-auto">
            {{ t('common.rotate_device_desc') }}
        </p>
    </div>
</template>

<style scoped>
.landscape-warning {
    display: none;
}

@media screen and (orientation: landscape) and (max-width: 1024px) and (pointer: coarse) {
    .landscape-warning {
        display: flex;
    }
}
</style>
