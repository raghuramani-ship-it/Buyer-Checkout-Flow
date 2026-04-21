<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next';

defineProps<{
  label: string;
  modelValue: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  inputMode?: string;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  disabled?: boolean;
  verified?: boolean;
  error?: string;
  id?: string;
  maxlength?: number | string;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="mb-5" :id="id ? `field-${id}` : undefined">
    <div class="flex justify-between items-center mb-1.5 ml-1">
      <label :class="[`text-[11px] font-bold uppercase tracking-widest`, error ? 'text-red-500' : 'text-slate-400']">
        {{ label }}
      </label>
      <div class="flex items-center gap-2">
        <span v-if="verified" class="text-[10px] text-green-600 font-bold flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded">
          <CheckCircle2 class="size-3" /> VERIFIED
        </span>
        <span v-else-if="!required" class="text-[10px] text-slate-300 font-medium italic">Optional</span>
      </div>
    </div>
    <div class="relative group">
      <input
        :id="id"
        :type="type || 'text'"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :inputmode="(inputMode as any)"
        :disabled="disabled || verified"
        :maxlength="maxlength"
        :class="[
          'w-full px-4 py-3.5 border-2 rounded-2xl outline-none transition-all placeholder:text-slate-300',
          verified 
            ? 'bg-green-50/30 border-green-100 text-slate-900 cursor-default' 
            : error
              ? 'bg-red-50/10 border-red-200 focus:border-red-500 bg-white text-slate-900'
              : 'bg-white border-slate-100 focus:border-blue-500 text-slate-900 group-hover:bg-slate-50/50',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          action && !verified ? 'pr-24' : ''
        ]"
      />
      <button 
        v-if="action && !verified && modelValue.length === 10"
        @click="action.onClick"
        :disabled="action.disabled"
        class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ action.label }}
      </button>
    </div>
    <p v-if="error" class="mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ error }}</p>
    <p v-else-if="hint" class="mt-2 text-[10px] text-slate-400 font-medium leading-relaxed ml-1">{{ hint }}</p>
  </div>
</template>
