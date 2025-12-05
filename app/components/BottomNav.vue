<script setup lang="ts">
import { Home, BarChart3, Plus, Settings, User } from 'lucide-vue-next';

// Inject the modal state provided by default.vue
const showAddModal = inject<Ref<boolean>>('showAddModal');

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Add', icon: Plus, isAction: true },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Profile', to: '/settings', icon: User }, // Redirect profile to settings for now or separate page
];

const handleAction = () => {
  if (showAddModal) {
    showAddModal.value = true;
  }
};
</script>

<template>
  <div class="fixed bottom-6 left-6 right-6 z-30">
    <div
      class="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]" />
    <div class="relative flex justify-between items-center px-6 py-4">
      <template v-for="item in navItems" :key="item.label">
        <!-- Action Button (Add) -->
        <button v-if="item.isAction" @click="handleAction"
          class="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-900/20 active:scale-90 transition-transform -mt-8 border-4 border-[#F6F8FC]">
          <component :is="item.icon" :size="28" :stroke-width="2" />
        </button>

        <!-- Navigation Link -->
        <NuxtLink v-else :to="item.to"
          class="flex flex-col items-center justify-center w-10 h-10 transition-colors text-slate-400 hover:text-slate-600"
          active-class="!text-black">
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

/*.router-link-active::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 4px;
    height: 4px;
    background-color: black;
    border-radius: 50%;
}*/
</style>
