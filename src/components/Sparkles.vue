<script setup lang="ts">
import { Motion } from "@motionone/vue";
</script>

<template>
  <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
    <Motion
      v-for="i in 6"
      :key="i"
      class="absolute w-1 h-1 bg-white rounded-full opacity-60"
      :initial="{ 
        x: Math.random() * 100 + '%', 
        y: Math.random() * 100 + '%',
        scale: 0,
        opacity: 0
      }"
      :animate="{ 
        scale: [0, 1.2, 0],
        opacity: [0, 0.8, 0],
      }"
      :transition="{ 
        duration: 2 + Math.random() * 2, 
        repeat: Infinity,
        delay: Math.random() * 5,
        easing: 'ease-in-out'
      }"
      :style="{
        boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.4)'
      }"
    />
  </div>
</template>
