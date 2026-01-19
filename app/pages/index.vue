<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
definePageMeta({
  layout: 'marketing'
})

</script>

<template>
  <div class="min-h-dvh flex flex-col items-center justify-between p-6 relative overflow-hidden text-center">
    <BackgroundMesh />

    <div class="absolute top-6 right-6 z-20">
      <LanguageSelector />
    </div>

    <div class="grow flex flex-col items-center justify-center w-full">
      <!-- Hero Content -->
      <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

        <!-- Main Heading -->
        <h1 class="text-6xl md:text-8xl font-bold text-slate-800 mb-8 tracking-tight leading-none dark:text-white">
          {{ $t('landing.hero_title') }}<br />
          <span class="text-transparent bg-clip-text bg-linear-to-r from-accent to-calm">{{
            $t('landing.hero_subtitle') }}</span>
        </h1>

        <p class="text-xl text-slate-500 mb-12 font-medium max-w-xl mx-auto leading-relaxed dark:text-slate-400">
          {{ $t('landing.hero_desc') }}
        </p>

        <!-- CTA -->
        <div class="mb-12">
          <NuxtLink to="/auth/login">
            <GlassButton
              class="px-10! py-5! text-xl! bg-slate-900! text-white! hover:bg-slate-800! shadow-xl shadow-accent/20 group dark:bg-white! dark:text-black! dark:hover:bg-slate-200!">
              {{ $t('landing.get_started') }}
              <ArrowRight class="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="relative z-10 pt-8 pb-4">
      <div class="flex gap-6 text-sm font-medium text-slate-400 dark:text-slate-500">
        <NuxtLink to="/legal/imprint" class="hover:text-slate-900 dark:hover:text-white transition-colors">
          {{ $t('legal.imprint') }}
        </NuxtLink>
        <NuxtLink to="/legal/privacy" class="hover:text-slate-900 dark:hover:text-white transition-colors">
          {{ $t('legal.privacy') }}
        </NuxtLink>
      </div>
    </footer>

    <!-- Decorative Elements -->
    <div
      class="absolute top-1/4 left-0 w-96 h-96 bg-calm/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
    <div
      class="absolute bottom-0 right-0 w-120 h-120 bg-accent/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
  </div>
</template>
