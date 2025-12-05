<script setup lang="ts">
import { ArrowRight, PieChart, Receipt, ShieldCheck } from 'lucide-vue-next';

// Explicitly disable layout for landing page or keep simple if default is fine
// Using default but content overrides effectively
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
    <BackgroundMesh />

    <!-- Hero Content -->
    <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

      <!-- Main Heading -->
      <h1 class="text-6xl md:text-8xl font-bold text-slate-800 mb-8 tracking-tight leading-none">
        Mindful spending,<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">liquid clarity.</span>
      </h1>

      <p class="text-xl text-slate-500 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
        Experience a budgeting app that feels as fluid as your life. Beautifully simple, powerfully insightful.
      </p>

      <!-- CTA -->
      <div class="mb-24">
        <NuxtLink to="/auth/login">
          <GlassButton
            class="px-10! py-5! text-xl! bg-slate-900! text-white! hover:bg-slate-800! shadow-xl shadow-purple-500/20 group">
            Get Started
            <ArrowRight class="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </GlassButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div
      class="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
    <div
      class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-pink-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
  </div>
</template>
