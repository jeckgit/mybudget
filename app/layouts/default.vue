<script setup lang="ts">
const user = useSupabaseUser();
const route = useRoute();

// UI State for Modal
const showAddModal = useState('showAddModal', () => false);

</script>

<template>
    <div class="relative min-h-dvh text-slate-800 font-sans selection:bg-accent/30 dark:text-white">
        <BackgroundMesh />
        <!-- Main Content -->
        <div class="relative z-10">
            <slot />

            <BottomNav
                v-if="user && route.path !== '/onboarding' && route.path !== '/auth/login' && route.path !== '/auth/update-password'" />
        </div>

        <AddExpenseModal :is-open="showAddModal" @close="showAddModal = false" />
        <CookieBanner />
    </div>
</template>
