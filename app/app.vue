<script setup lang="ts">
const { initTheme, getEffectiveTheme } = useTheme();

// Manual theme injection removed; handled by @nuxtjs/color-mode

useHead({
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ],
    link: [
        { rel: 'manifest', href: '/manifest.json' }
    ]
});


</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
