<script setup lang="ts">
import { ref } from 'vue';
import { Motion } from '@motionone/vue';

defineProps<{
  onVerify: (otp: string) => void;
  onCancel: () => void;
}>();

const val = ref('');
</script>

<template>
  <Motion 
    :initial="{ opacity: 0, y: 10 }" 
    :animate="{ opacity: 1, y: 0 }" 
    class="bg-white border-2 border-blue-100 p-6 rounded-3xl shadow-xl shadow-blue-900/5 mt-2 mb-6"
  >
    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Code</p>
    <p class="text-sm text-slate-600 mb-4">We've sent a 6-digit code. Enter it below to verify.</p>
    <div class="flex gap-3">
      <input 
        autofocus
        type="text" 
        v-model="val"
        maxlength="6"
        placeholder="000000"
        @input="val = val.replace(/\D/g, '')"
        class="flex-1 min-w-0 px-2 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-xl font-bold tracking-widest outline-none transition-all text-center"
      />
      <button 
        @click="onVerify(val)"
        :class="[
          'px-6 rounded-xl font-bold transition-all',
          val.length === 6 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        ]"
      >
        Verify
      </button>
    </div>
    <button @click="onCancel" class="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
      Resend or Change Number
    </button>
  </Motion>
</template>
