<script setup lang="ts">
const { initTheme, getEffectiveTheme } = useTheme();

// Set dark mode class on server for SSR
if (import.meta.server) {
    const theme = getEffectiveTheme();
    useHead({
        htmlAttrs: {
            class: theme === 'dark' ? 'dark' : ''
        }
    });
}

useHead({
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ],
    link: [
        { rel: 'manifest', href: '/manifest.json' }
    ]
});

onMounted(() => {
    initTheme();
});
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
