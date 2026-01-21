<script setup lang="ts">


useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} · MySaldo` : 'MySaldo';
    },
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'screen-orientation', content: 'portrait' },
        { name: 'x5-orientation', content: 'portrait' }
    ],
    link: [
        { rel: 'manifest', href: '/manifest.json' }
    ]
});


</script>

<template>
    <NuxtLayout>
        <NuxtPage />
        <ConfirmDialog />
        <LandscapeWarning />
    </NuxtLayout>
</template>
