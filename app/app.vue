<script setup lang="ts">


useHead({
    titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} · MySaldo` : 'MySaldo';
    },
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
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
        <ConfirmDialog />
    </NuxtLayout>
</template>
