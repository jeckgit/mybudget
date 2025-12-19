<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const route = useRoute();

// UI State for Modal
const showAddModal = useState('showAddModal', () => false);

</script>

<template>
    <div
        class="relative min-h-screen text-slate-800 font-sans selection:bg-purple-200 overflow-x-hidden dark:text-white">
        <BackgroundMesh />

        <!-- Main Content -->
        <div class="relative z-10">
            <slot />

            <BottomNav v-if="user && route.path !== '/onboarding' && route.path !== '/auth/login'" />
        </div>

        <AddExpenseModal v-if="showAddModal" @close="showAddModal = false" />
    </div>
</template>
