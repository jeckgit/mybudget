<script setup lang="ts">
import { ChevronLeft, Plus, Settings2, Trash2, Edit2, Check, X } from 'lucide-vue-next';
const { categories, addCategory, updateCategory, deleteCategory, getCategoryName } = useCategories();
const { state, loadState } = useStorage();
const { t } = useI18n();
const router = useRouter();

// Ensure state is loaded for SSR
await useAsyncData('categories-init', async () => {
    await loadState();
    return true;
});

const isAdding = ref(false);
const editingId = ref<string | null>(null);
const newEmoji = ref('🛍️');
const newName = ref('');

const editEmoji = ref('');
const editName = ref('');

const handleAdd = async () => {
    if (!newName.value.trim()) return;
    try {
        await addCategory(newEmoji.value, newName.value.trim());
        isAdding.value = false;
        newName.value = '';
    } catch (e) {
        console.error('Failed to add category:', e);
        alert(t('common.error_occurred') || 'Failed to add category');
    }
};

const startEdit = (cat: any) => {
    editingId.value = cat.id;
    editEmoji.value = cat.emoji;
    editName.value = getCategoryName(cat);
};

const handleUpdate = async () => {
    if (!editingId.value || !editName.value.trim()) return;
    try {
        await updateCategory(editingId.value, editEmoji.value, editName.value.trim());
        editingId.value = null;
    } catch (e) {
        console.error('Failed to update category:', e);
        alert(t('common.error_occurred') || 'Failed to update category');
    }
};

const handleDelete = async (id: string) => {
    if (confirm(t('common.delete_confirm'))) {
        try {
            await deleteCategory(id);
        } catch (e) {
            console.error('Failed to delete category:', e);
        }
    }
};

const cancelAdd = () => {
    isAdding.value = false;
    newName.value = '';
};

const cancelEdit = () => {
    editingId.value = null;
};
</script>

<template>
    <div class="min-h-screen pb-32">
        <header class="p-6 pt-12 flex items-center justify-between relative z-20">
            <button @click="router.back()"
                class="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-slate-600 active:scale-95 transition-all dark:bg-white/10 dark:text-white dark:border dark:border-white/10">
                <ChevronLeft class="w-6 h-6" />
            </button>
            <h1 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {{ t('common.select_category') }}
            </h1>
            <div class="w-12 h-12" /> <!-- Spacer -->
        </header>

        <main class="px-6 space-y-6">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">
                {{ t('common.select_category') }}
            </h2>

            <!-- Categories List -->
            <div class="space-y-3">
                <div v-for="cat in categories" :key="cat.id">
                    <GlassCard variant="white"
                        class="p-4 !rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                        <div v-if="editingId === cat.id" class="flex items-center gap-3">
                            <input v-model="editEmoji"
                                class="w-12 h-12 text-2xl text-center bg-slate-100 dark:bg-white/10 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none" />
                            <input v-model="editName"
                                class="flex-1 bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none dark:text-white" />
                            <button @click="handleUpdate"
                                class="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl transition-colors">
                                <Check class="w-5 h-5" />
                            </button>
                            <button @click="cancelEdit"
                                class="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                        <div v-else class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 flex items-center justify-center text-3xl bg-slate-50 dark:bg-white/5 rounded-2xl">
                                    {{ cat.emoji }}
                                </div>
                                <span class="font-bold text-slate-800 dark:text-white">{{ getCategoryName(cat) }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <button @click="startEdit(cat)"
                                    class="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                    <Edit2 class="w-4 h-4" />
                                </button>
                                <button @click="handleDelete(cat.id)"
                                    class="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <!-- Add Category Form -->
                <div v-if="isAdding">
                    <GlassCard variant="white"
                        class="p-4 !rounded-3xl border-2 border-dashed border-purple-200 dark:border-purple-500/20 shadow-none">
                        <div class="flex items-center gap-3">
                            <input v-model="newEmoji"
                                class="w-12 h-12 text-2xl text-center bg-slate-50 dark:bg-white/10 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none" />
                            <input v-model="newName" :placeholder="t('categories.category_name')"
                                class="flex-1 bg-slate-50 dark:bg-white/10 px-4 py-2 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 outline-none dark:text-white" />
                            <button @click="handleAdd"
                                class="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-colors">
                                <Check class="w-5 h-5" />
                            </button>
                            <button @click="cancelAdd"
                                class="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                    </GlassCard>
                </div>

                <button v-else @click="isAdding = true"
                    class="w-full py-4 flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-all dark:border-white/10 dark:hover:border-purple-500/30">
                    <Plus class="w-5 h-5" />
                    <span class="font-bold text-sm uppercase tracking-wider">{{ t('categories.add_new') }}</span>
                </button>
            </div>
        </main>
    </div>
</template>
