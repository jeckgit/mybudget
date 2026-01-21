<script setup lang="ts">
import { Globe, Check } from 'lucide-vue-next';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

const { locale, setLocale } = useI18n();
const profileStore = useProfileStore();

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const currentLanguage = computed(() =>
    languages.find(l => l.code === locale.value) || languages[0]
);

const handleLanguageChange = async (code: string) => {
    await setLocale(code as any);
    // Also update global config for persistence if user is logged in
    await profileStore.updateConfig({ language: code });
};
</script>

<template>
    <Menu as="div" class="relative inline-block text-left">
        <MenuButton
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-slate-600 dark:text-slate-300 transition-all active:scale-95">
            <Globe class="w-4 h-4" />
            <span class="text-sm font-medium">{{ currentLanguage.name }}</span>
        </MenuButton>

        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-xl focus:outline-none p-1 z-50">
                <MenuItem v-for="lang in languages" :key="lang.code" v-slot="{ active }">
                <button @click="handleLanguageChange(lang.code)" :class="[
                    active ? 'bg-slate-100 dark:bg-white/10' : '',
                    'group flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200'
                ]">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">{{ lang.flag }}</span>
                        <span>{{ lang.name }}</span>
                    </div>
                    <Check v-if="locale === lang.code" class="w-4 h-4 text-accent" />
                </button>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>
