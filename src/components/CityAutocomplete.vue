<script setup lang="ts">
import { ref, computed } from 'vue';
import { Smartphone } from 'lucide-vue-next';
import { INDIAN_CITIES, type City } from '../constants';

const props = defineProps<{
  label: string;
  selectedCity: City | null;
  error?: string;
  placeholder?: string;
  id: string;
}>();

const emit = defineEmits(['select']);

const query = ref('');
const isOpen = ref(false);

const results = computed(() => {
  if (query.value.length < 2) return [];
  const q = query.value.toLowerCase();
  return INDIAN_CITIES.filter(city => 
    city.name.toLowerCase().includes(q) || 
    city.state.toLowerCase().includes(q) || 
    city.pincode.includes(q)
  ).slice(0, 5);
});

const onSelectCity = (city: City | null) => {
  emit('select', city);
  query.value = '';
  isOpen.value = false;
};
const onBlur = () => {
  setTimeout(() => {
    isOpen.value = false;
  }, 200);
};
</script>

<template>
  <div class="mb-5 relative" :id="`field-${id}`">
    <label :class="[`block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1`, error ? 'text-red-500' : 'text-slate-400']">
      {{ label }}
    </label>
    
    <div v-if="selectedCity" class="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl group transition-all">
      <div class="flex-1">
        <p class="text-sm font-bold text-slate-900 leading-tight">
          {{ selectedCity.name }}, {{ selectedCity.state }}
        </p>
        <p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-1">
          {{ selectedCity.pincode }} • Category {{ selectedCity.category }}
        </p>
      </div>
      <button 
        @click="onSelectCity(null)"
        class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
      >
        Change
      </button>
    </div>
    
    <div v-else class="relative group">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
        <Smartphone class="size-5" />
      </div>
      <input
        type="text"
        :placeholder="placeholder || 'Search city'"
        v-model="query"
        @focus="isOpen = true"
        @blur="onBlur"
        class="[
          'w-full pl-12 pr-4 py-3.5 border-2 rounded-2xl outline-none transition-all placeholder:text-slate-300',
          error ? 'bg-red-50/10 border-red-200 focus:border-red-500' : 'bg-white border-slate-100 focus:border-blue-500'
        ]"
        :class="error ? 'bg-red-50/10 border-red-200 focus:border-red-500' : 'bg-white border-slate-100 focus:border-blue-500'"
      />
      <div v-if="isOpen && results.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-[100] overflow-hidden">
        <button
          v-for="city in results"
          :key="`${city.name}-${city.pincode}`"
          @mousedown.prevent="onSelectCity(city)"
          class="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
        >
          <p class="text-sm font-bold text-slate-900">{{ city.name }}, {{ city.state }}</p>
          <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{{ city.pincode }} • Category {{ city.category }}</p>
        </button>
      </div>
    </div>
    
    <p v-if="error" class="mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ error }}</p>
  </div>
</template>
