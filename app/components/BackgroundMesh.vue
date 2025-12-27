<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#0a0a0a]">
    <!-- Top Calm Blob -->
    <div
      class="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] rounded-full bg-calm blur-[100px] opacity-60 dark:opacity-20 animate-float" />

    <!-- Center Accent Blob -->
    <div
      class="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-accent blur-[120px] opacity-50 dark:opacity-20 animate-float"
      style="animation-delay: 3s" />

    <!-- Bottom Mint Blob -->
    <div
      class="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] rounded-full bg-mint blur-[100px] opacity-40 dark:opacity-20 animate-float"
      style="animation-delay: 5s" />
  </div>
</template>

<script setup lang="ts">
// No script needed for this component
</script>

<style scoped>
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>