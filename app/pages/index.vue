<script setup lang="ts">
import { Wallet, ArrowRight } from 'lucide-vue-next';

// Explicitly disable layout for landing page
definePageMeta({
    layout: false
});
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <BackgroundMesh />
        <!-- Hero Content -->
        <div class="relative z-10 max-w-2xl mx-auto">
            <div class="mb-8 flex justify-center">
                <div
                    class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-purple-200/50">
                    <Wallet class="w-8 h-8 text-purple-500" :stroke-width="1.5" />
                </div>
            </div>

            <h1 class="text-5xl md:text-7xl font-bold text-slate-800 mb-6 tracking-tight leading-tight">
                Mindful spending,<br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">liquid
                    clarity.</span>
            </h1>

            <p class="text-lg md:text-xl text-slate-500 mb-12 font-medium max-w-lg mx-auto leading-relaxed">
                Experience a budgeting app that feels as fluid as your life. Beautifully simple, powerfully insightful.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NuxtLink to="/login">
                    <GlassButton class="!px-8 !py-4 !text-lg !bg-slate-900 !text-white hover:!bg-slate-800 group">
                        Get Started
                        <ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GlassButton>
                </NuxtLink>

                <a href="https://github.com/eckholdjorg/budget" target="_blank"
                    class="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-white/40 transition-colors">
                    View on GitHub
                </a>
            </div>
        </div>

        <!-- Decorative Elements -->
        <div
            class="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
        <div
            class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-pink-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
    </div>
</template>
