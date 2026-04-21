<script setup lang="ts">
defineProps<{
  selected: boolean;
  label: string;
  description?: string;
}>();

defineEmits(['click']);
</script>

<template>
  <button
    @click="$emit('click')"
    :class="[
      'w-full p-4 mb-3 text-left border-2 rounded-2xl transition-all flex items-center gap-4',
      selected 
        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
    ]"
  >
    <div :class="[
      'size-4 rounded-full border-[3.5px] transition-all flex-shrink-0',
      selected ? 'border-blue-600 bg-white' : 'border-slate-300 bg-transparent'
    ]" />
    <div class="flex-1">
      <p class="font-bold text-sm tracking-tight">{{ label }}</p>
      <p v-if="description" class="text-[10px] opacity-70 mt-0.5 uppercase font-bold tracking-wider">{{ description }}</p>
    </div>
  </button>
</template>
