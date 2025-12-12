<script lang="ts" setup>
import type { Transaction } from '~/types';

const { state, loadState, saveState, addTransaction } = useStorage();
const emit = defineEmits(['close'])
const inputValue = ref("");



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

    // Optimistic update moved to useStorage, but we can just call addTransaction
    await addTransaction(newTx);

    inputValue.value = "";
    emit('close');
};

const handleInput = (n: number) => {
    inputValue.value += n.toString();
};

const handleDelete = () => {
    inputValue.value = inputValue.value.slice(0, -1);
};

</script>
<template>
    <div>
        <div class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" @click="emit('close')" />
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
</template>