<script setup lang="ts">
import { Home, BarChart3, Plus, User, Sparkles } from 'lucide-vue-next';

// Shared modal state
const showAddModal = useState<boolean>('showAddModal');
const { t } = useI18n();

const navItems = computed(() => [
  { label: t('common.dashboard'), to: '/dashboard', icon: Home },
  { label: t('common.analytics'), to: '/analytics', icon: BarChart3 },
  { label: t('common.add'), icon: Plus, isAction: true },
  { label: t('common.assistant'), to: '/assistant', icon: Sparkles },
  { label: t('common.profile'), to: '/profile', icon: User },
]);

const handleAction = () => {
  if (showAddModal) {
    showAddModal.value = true;
  }
};
</script>

<template>
  <div class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-6 right-6 z-30">
    <div
      class="absolute inset-0 bg-white/40 dark:bg-[#1e1e1e]/30 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]" />
    <div class="relative flex justify-between items-center px-6 py-4">
      <template v-for="item in navItems" :key="item.label">
        <!-- Action Button (Add) -->
        <div v-if="item.isAction" class="relative">
          <button @click="handleAction"
            class="w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-xl shadow-accent/20 dark:shadow-accent/40 active:scale-90 transition-transform -mt-8 border-4 border-[#F6F8FC] dark:border-[#121212] relative z-20">
            <component :is="item.icon" :size="28" :stroke-width="2" />
          </button>
          <FloatingDollar />
        </div>

        <!-- Navigation Link -->
        <NuxtLink v-else :to="item.to"
          class="flex flex-col items-center justify-center w-10 h-10 transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          active-class="!text-black dark:!text-white">
          <component :is="item.icon" :size="24" :stroke-width="2" class="mb-1" />
          <!-- Active indicator dot -->
          <!-- We need to check exact active state or rely on active-class to style the dot. 
                  NuxtLink doesn't easily expose 'isActive' to children slots without using v-slot. 
                  Let's use v-slot for advanced customization if needed, or just simple styling. -->
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Custom active style enhancement if needed */
.router-link-active svg {
  stroke-width: 2.5px;
}
</style>
