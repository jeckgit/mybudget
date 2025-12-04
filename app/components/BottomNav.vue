<template>
  <div class="fixed bottom-6 left-6 right-6 z-30">
    <div class="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]" />
    <div class="relative flex justify-between items-center px-6 py-4">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handleNavClick(item)"
        :class="[
          item.isAction 
            ? 'w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-900/20 active:scale-90 transition-transform -mt-8 border-4 border-[#F6F8FC]'
            : 'flex flex-col items-center justify-center w-10 h-10 transition-colors',
          !item.isAction && (currentView === item.id ? 'text-black' : 'text-slate-400')
        ]"
      >
        <component 
          :is="item.icon" 
          :size="item.isAction ? 28 : 24" 
          :stroke-width="!item.isAction && currentView === item.id ? 2.5 : 2" 
        />
        <div 
          v-if="!item.isAction && currentView === item.id"
          class="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, BarChart3, Plus, Settings, User } from 'lucide-vue-next';
import { ViewState } from '~/types';
import type { ViewState as ViewStateType } from '~/types';

interface Props {
  currentView: ViewStateType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  change: [view: ViewStateType | 'ADD'];
}>();

const navItems = [
  { id: ViewState.DASHBOARD, icon: Home },
  { id: ViewState.ANALYTICS, icon: BarChart3 },
  { id: 'ADD', icon: Plus, isAction: true },
  { id: ViewState.SETTINGS, icon: Settings },
  { id: 'PROFILE', icon: User },
];

const handleNavClick = (item: any) => {
  if (item.id === 'PROFILE') return; // Do nothing for profile
  emit('change', item.id);
};
</script>