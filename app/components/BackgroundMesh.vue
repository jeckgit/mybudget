<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-[#F1F5F9] dark:bg-[#121212]">
    <!-- Top Pink/Rose Blob -->
    <div
      class="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] rounded-full bg-[#FBCFE8] dark:bg-[#500724] blur-[100px] opacity-80 dark:opacity-40 animate-float" />

    <!-- Center Purple Blob -->
    <div
      class="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#DDD6FE] dark:bg-[#3b0764] blur-[120px] opacity-80 dark:opacity-40 animate-float"
      style="animation-delay: 3s" />

    <!-- Bottom Teal/Blue Blob -->
    <div
      class="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] rounded-full bg-[#BAE6FD] dark:bg-[#082f49] blur-[100px] opacity-60 dark:opacity-40 animate-float"
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