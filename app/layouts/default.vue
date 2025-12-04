<script setup lang="ts">
import type { AppState, Transaction, ViewState as ViewStateType } from "~/types";
import { ViewState } from "~/types";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { loadState, saveState, addTransaction } = useStorage();

// State
const state = ref<AppState>({
    transactions: [],
    config: {
        monthlyLimit: 0,
        currencySymbol: '$',
        onboardingComplete: false
    }
});
const showAddModal = ref(false);
const inputValue = ref("");

// Load state on mount
onMounted(async () => {
    if (user.value) {
        state.value = await loadState();

        // Redirect to onboarding if needed
        if (!state.value.config.onboardingComplete && route.path !== '/onboarding') {
            navigateTo('/onboarding');
        } else if (route.path === '/') {
            // Redirect to dashboard if logged in and on landing page
            navigateTo('/dashboard');
        }
    } else {
        // Public routes that don't require auth
        const publicRoutes = ['/', '/login'];
        if (!publicRoutes.includes(route.path)) {
            navigateTo('/login');
        }
    }
});

// Watch config changes and persist (only config)
watch(
    () => state.value.config,
    (newConfig) => {
        saveState(state.value);
    },
    { deep: true },
);

// Provide state to children
provide('appState', state);
provide('showAddModal', showAddModal);

// Handlers
const handleAddTransaction = async () => {
    const amount = parseFloat(inputValue.value);
    if (isNaN(amount) || amount <= 0) return;

    const categories = [
        { emoji: '🛍️', note: 'Shopping' },
        { emoji: '🍔', note: 'Food' },
        { emoji: '🚗', note: 'Transport' },
        { emoji: '🎬', note: 'Entertainment' },
        { emoji: '☕', note: 'Coffee' },
        { emoji: '🏠', note: 'Utilities' }
    ];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]!;

    const newTx: Transaction = {
        id: Date.now().toString(), // Temporary ID until reload
        amount,
        date: new Date().toISOString(),
        note: randomCategory.note,
        category: randomCategory.emoji,
    };

    // Optimistic update
    state.value.transactions = [newTx, ...state.value.transactions];

    // Persist
    await addTransaction(newTx);

    inputValue.value = "";
    showAddModal.value = false;
};

const handleNavChange = (v: ViewStateType | 'ADD') => {
    if (v === "ADD") {
        showAddModal.value = true;
    } else {
        const routeMap: Record<string, string> = {
            [ViewState.DASHBOARD]: '/dashboard',
            [ViewState.ANALYTICS]: '/analytics',
            [ViewState.SETTINGS]: '/settings',
            [ViewState.ONBOARDING]: '/onboarding'
        };
        const path = routeMap[v];
        if (path) {
            navigateTo(path);
        }
    }
};

const handleInput = (n: number) => {
    inputValue.value += n.toString();
};

const handleDelete = () => {
    inputValue.value = inputValue.value.slice(0, -1);
};

// Determine current view for BottomNav based on route
const route = useRoute();
const currentView = computed(() => {
    if (route.path === '/dashboard') return ViewState.DASHBOARD;
    if (route.path === '/analytics') return ViewState.ANALYTICS;
    if (route.path === '/settings') return ViewState.SETTINGS;
    if (route.path === '/onboarding') return ViewState.ONBOARDING;
    return ViewState.DASHBOARD;
});

const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigateTo('/login');
};
</script>

<template>
    <div class="relative min-h-screen text-slate-800 font-sans selection:bg-purple-200 overflow-x-hidden">
        <BackgroundMesh />

        <!-- Main Content -->
        <div class="relative z-10">
            <slot />

            <BottomNav v-if="currentView !== ViewState.ONBOARDING && user" :current-view="currentView"
                @change="handleNavChange" />
        </div>

        <!-- Add Transaction Modal -->
        <div v-if="showAddModal">
            <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" @click="showAddModal = false" />
            <div class="fixed bottom-0 left-0 right-0 z-50 p-4">
                <GlassCard variant="white" class="p-8 pb-10 !rounded-[2.5rem] shadow-2xl shadow-purple-900/10">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                    <div class="text-center mb-6">
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
                            Add Expense
                        </p>
                        <div class="flex items-center justify-center gap-1">
                            <span class="text-4xl text-slate-300 font-medium">$</span>
                            <span class="text-7xl font-bold text-slate-800 tracking-tighter">
                                {{ inputValue || "0" }}
                            </span>
                        </div>
                    </div>

                    <NumberPad :value="inputValue" @input="handleInput" @delete="handleDelete"
                        @submit="handleAddTransaction" />
                </GlassCard>
            </div>
        </div>
    </div>
</template>
