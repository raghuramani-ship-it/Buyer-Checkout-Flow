<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Motion } from "@motionone/vue";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Store, 
  Mail,
  Smartphone
} from 'lucide-vue-next';

// Components
import InputField from './components/InputField.vue';
import CityAutocomplete from './components/CityAutocomplete.vue';
import RadioOption from './components/RadioOption.vue';
import OTPView from './components/OTPView.vue';
import Sparkles from './components/Sparkles.vue';

// Constants & Types
import { 
  INDIAN_CITIES, 
  type Step, 
  type OnboardingData, 
  type City,
  type Platform
} from './constants';

// --- State ---
const step = ref<Step>('basic');
const data = ref<OnboardingData>({
  dealershipName: '',
  email: '',
  selectedState: '',
  primaryCity: null,
  pincode: '',
  packageType: null,
  city2: null,
  city3: null,
  platform: null,
  carWaleNumber: '',
  olxNumber: '',
  singleMobileNumber: '',
  isCarWaleVerified: false,
  isOlxVerified: false,
  isSingleVerified: false,
  whatsappNumberSource: 'single',
  customWhatsappNumber: '',
  useSuperDost: true,
});

const otpTarget = ref<'carwale' | 'olx' | 'single' | null>(null);
const errors = ref<Record<string, any>>({});

// --- Computed ---
const ALL_STATES = computed(() => Array.from(new Set(INDIAN_CITIES.map(c => c.state))).sort());

const pricing = computed(() => {
  const baseGold = 12000;
  const baseDiamond = 24000;
  
  const cat = data.value.primaryCity?.category;
  const discountPercent = cat === 'A' ? 10 : (cat === 'B' || cat === 'C' ? 25 : 0);
  
  const goldPrice = Math.round(baseGold * (1 - discountPercent / 100));
  const diamondPrice = Math.round(baseDiamond * (1 - discountPercent / 100));
  
  return {
    goldBase: baseGold,
    goldFinal: goldPrice,
    diamondBase: baseDiamond,
    diamondFinal: diamondPrice,
    discountPercent,
    category: cat
  };
});

const availableWhatsappNumbers = computed(() => {
  const list: { id: 'carwale' | 'olx' | 'single', label: string | any, number: string }[] = [];
  if (data.value.carWaleNumber.length === 10) {
    list.push({ id: 'carwale', label: 'CarWale', number: data.value.carWaleNumber });
  }
  if (data.value.olxNumber.length === 10 && (data.value.olxNumber !== data.value.carWaleNumber || data.value.carWaleNumber.length !== 10)) {
    list.push({ id: 'olx', label: 'OLX', number: data.value.olxNumber });
  }
  if (data.value.singleMobileNumber.length === 10 && 
      (data.value.singleMobileNumber !== data.value.carWaleNumber || data.value.carWaleNumber.length !== 10) && 
      (data.value.singleMobileNumber !== data.value.olxNumber || data.value.olxNumber.length !== 10)) {
    list.push({ id: 'single', label: 'Activation', number: data.value.singleMobileNumber });
  }
  return list;
});

const selectedWhatsappNumber = computed(() => {
  if (data.value.whatsappNumberSource === 'custom') return data.value.customWhatsappNumber;
  const found = availableWhatsappNumbers.value.find(n => n.id === data.value.whatsappNumberSource);
  return found ? found.number : (availableWhatsappNumbers.value[0]?.number || '');
});

// --- Actions ---
const handleNext = () => {
  const newErrors: Record<string, any> = {};

  if (step.value === 'basic') {
    if (!data.value.dealershipName.trim()) {
      newErrors.dealershipName = 'Dealership name is required';
    }
    if (Object.keys(newErrors).length > 0) {
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    step.value = 'location';
  } else if (step.value === 'location') {
    if (!data.value.selectedState) newErrors.selectedState = 'State is required';
    if (!data.value.primaryCity) newErrors.primaryCity = 'City is required';
    if (!data.value.pincode) newErrors.pincode = 'Pincode is required';
    else if (data.value.pincode.length !== 6) newErrors.pincode = 'Invalid pincode';

    if (Object.keys(newErrors).length > 0) {
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    step.value = 'platform';
  } else if (step.value === 'platform') {
    if (data.value.platform === null) {
      newErrors.platform = 'Please select your active platform';
    }
    if (Object.keys(newErrors).length > 0) {
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    step.value = 'details';
  } else if (step.value === 'details') {
     if (data.value.platform === 'carwale') {
       if (!data.value.carWaleNumber) newErrors.carWaleNumber = 'CarWale number is required';
       else if (!data.value.isCarWaleVerified) newErrors.carWaleNumber = 'Please verify your CarWale number';
     } else if (data.value.platform === 'olx') {
       if (!data.value.olxNumber) newErrors.olxNumber = 'OLX number is required';
       else if (!data.value.isOlxVerified) newErrors.olxNumber = 'Please verify your OLX number';
     } else if (data.value.platform === 'both') {
       if (!data.value.carWaleNumber) newErrors.carWaleNumber = 'CarWale number is required';
       else if (!data.value.isCarWaleVerified) newErrors.carWaleNumber = 'Please verify your CarWale number';
       if (!data.value.olxNumber) newErrors.olxNumber = 'OLX number is required';
       else if (!data.value.isOlxVerified) newErrors.olxNumber = 'Please verify your OLX number';
     } else if (data.value.platform === 'none') {
       if (!data.value.singleMobileNumber) newErrors.singleMobileNumber = 'Activation number is required';
       else if (!data.value.isSingleVerified) newErrors.singleMobileNumber = 'Please verify this number';
     }

     if (Object.keys(newErrors).length > 0) {
       errors.value = newErrors;
       return;
     }

     errors.value = {};
     const firstAvailable = data.value.isCarWaleVerified ? 'carwale' : 
                          (data.value.isOlxVerified ? 'olx' : 
                          (data.value.isSingleVerified ? 'single' : null));
     
     if (data.value.whatsappNumberSource === 'custom' || !data.value.whatsappNumberSource) {
       data.value.whatsappNumberSource = firstAvailable as any;
     }
     step.value = 'whatsapp';
  } else if (step.value === 'whatsapp') {
    step.value = 'pricing';
  } else if (step.value === 'pricing') {
    if (!data.value.packageType) {
      newErrors.packageType = 'Please select a package';
      errors.value = newErrors;
      return;
    }
    errors.value = {};
    step.value = 'success';
  }
};

const handleBack = () => {
  if (step.value === 'location') step.value = 'basic';
  else if (step.value === 'platform') step.value = 'location';
  else if (step.value === 'details') step.value = 'platform';
  else if (step.value === 'whatsapp') step.value = 'details';
  else if (step.value === 'pricing') step.value = 'whatsapp';
};

const handleVerifyOTP = (otp: string) => {
  if (otp.length === 6) {
    const sameNum = data.value.carWaleNumber === data.value.olxNumber && data.value.carWaleNumber.length === 10;
    
    if (otpTarget.value === 'carwale') {
      data.value.isCarWaleVerified = true;
      if (sameNum) data.value.isOlxVerified = true;
    } else if (otpTarget.value === 'olx') {
      data.value.isOlxVerified = true;
      if (sameNum) data.value.isCarWaleVerified = true;
    } else if (otpTarget.value === 'single') {
      data.value.isSingleVerified = true;
    }
    otpTarget.value = null;
  }
};
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col font-sans max-w-md mx-auto bg-white overflow-x-hidden">
    <!-- Header -->
    <header :class="['transition-all duration-500 max-w-md mx-auto w-full z-50', step === 'success' ? 'px-0 py-0 mt-0 pt-8 pb-4' : 'px-6 py-4 mt-4']">
      <div :class="['flex items-center', step === 'success' ? 'justify-center w-full' : 'justify-between']">
        <span 
          class="font-black tracking-tighter transition-all duration-700" 
          :class="step === 'success' ? 'text-4xl text-center' : 'text-xl'"
          style="color: #fc1515"
        >
          SuperBuyer AI
        </span>
        <span v-if="step !== 'success'" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
          Step {{ 
            step === 'basic' ? '1' : 
            step === 'location' ? '2' :
            step === 'platform' ? '3' : 
            step === 'details' ? '4' : 
            step === 'whatsapp' ? '5' : '6'
          }} of 6
        </span>
      </div>
      <div v-if="step !== 'success'" class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <Motion 
          class="h-full bg-blue-600"
          :initial="{ width: '0%' }"
          :animate="{ 
            width: step === 'basic' ? '15%' : 
                   step === 'location' ? '30%' :
                   step === 'platform' ? '45%' :
                   step === 'details' ? '60%' :
                   step === 'whatsapp' ? '75%' : '90%'
          }"
          :transition="{ duration: 0.5, easing: 'ease-out' }"
        />
      </div>
    </header>

    <!-- Content Area -->
    <main class="flex-1 px-6 pb-24 relative overflow-hidden">
      <Transition name="fade" mode="out-in">
        <!-- Step: Basic -->
        <div
          v-if="step === 'basic'"
          key="basic"
          class="space-y-2"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Let's get started</h2>
            <p class="text-slate-500 text-sm leading-relaxed">This helps us connect your account faster.</p>
          </div>

          <InputField
            id="dealershipName"
            label="Dealership Name"
            placeholder="e.g. Skyline Motors"
            v-model="data.dealershipName"
            @update:model-value="errors.dealershipName = ''"
            required
            :error="errors.dealershipName"
          />

          <InputField
            id="email"
            label="Email ID"
            placeholder="name@dealership.com"
            v-model="data.email"
            type="email"
            hint="Your Invoice details will be sent to this email id."
          />
        </div>

        <!-- Step: Location -->
        <div
          v-else-if="step === 'location'"
          key="location"
          class="space-y-4"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Location Details</h2>
            <p class="text-slate-500 text-sm leading-relaxed">Your package will be activated for this city.</p>
          </div>

          <div class="space-y-4">
            <div class="mb-5">
              <label :class="['block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1', errors.selectedState ? 'text-red-500' : 'text-slate-400']">
                Select State
              </label>
              <select 
                v-model="data.selectedState"
                @change="data.primaryCity = null; errors.selectedState = ''"
                :class="['w-full px-4 py-3.5 border-2 rounded-2xl outline-none transition-all bg-white', errors.selectedState ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-blue-500']"
              >
                <option value="">Select State</option>
                <option v-for="s in ALL_STATES" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="errors.selectedState" class="mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ errors.selectedState }}</p>
            </div>

            <div class="mb-5">
              <label :class="['block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1', errors.primaryCity ? 'text-red-500' : 'text-slate-400']">
                Select City
              </label>
              <select 
                :disabled="!data.selectedState"
                v-bind:value="data.primaryCity?.name || ''"
                @change="(e) => {
                  const city = INDIAN_CITIES.find(c => c.name === (e.target as HTMLSelectElement).value && c.state === data.selectedState);
                  data.primaryCity = city || null;
                  errors.primaryCity = '';
                }"
                :class="[
                  'w-full px-4 py-3.5 border-2 rounded-2xl outline-none transition-all',
                  !data.selectedState ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'bg-white',
                  errors.primaryCity ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-blue-500'
                ]"
              >
                <option value="">Select City</option>
                <option v-for="c in INDIAN_CITIES.filter(city => city.state === data.selectedState)" :key="c.name" :value="c.name">{{ c.name }}</option>
              </select>
              <p v-if="errors.primaryCity" class="mt-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ errors.primaryCity }}</p>
            </div>

            <InputField
              id="pincode"
              label="Pincode"
              placeholder="6 Digit PIN"
              v-model="data.pincode"
              @update:model-value="data.pincode = data.pincode.replace(/\D/g, '').slice(0, 6); errors.pincode = ''"
              input-mode="numeric"
              maxlength="6"
              required
              :error="errors.pincode"
            />
          </div>
        </div>

        <!-- Step: Platform -->
        <div
          v-else-if="step === 'platform'"
          key="platform"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Active Platforms</h2>
            <p class="text-slate-500 text-sm leading-relaxed">Which platform do you currently have an active account on?</p>
          </div>

          <div class="space-y-2">
            <RadioOption label="CarWale" value="carwale" :selected="data.platform === 'carwale'" @click="data.platform = 'carwale'; errors.platform = ''" />
            <RadioOption label="OLX" value="olx" :selected="data.platform === 'olx'" @click="data.platform = 'olx'; errors.platform = ''" />
            <RadioOption label="Both (CarWale & OLX)" value="both" :selected="data.platform === 'both'" @click="data.platform = 'both'; errors.platform = ''" />
            <RadioOption label="None" value="none" :selected="data.platform === 'none'" @click="data.platform = 'none'; errors.platform = ''" />
          </div>
          <p v-if="errors.platform" class="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ errors.platform }}</p>
        </div>

        <!-- Step: Details -->
        <div
          v-else-if="step === 'details'"
          key="details"
        >
          <div v-if="data.platform === 'none'">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">New Activation</h2>
              <p class="text-slate-500 text-sm leading-relaxed">Enter your mobile number to activate subscriptions.</p>
            </div>
            
            <InputField
              id="singleMobileNumber"
              label="Activation Number"
              v-model="data.singleMobileNumber"
              @update:model-value="data.singleMobileNumber = data.singleMobileNumber.replace(/\D/g, '').slice(0, 10); data.isSingleVerified = false; errors.singleMobileNumber = ''"
              input-mode="numeric"
              maxlength="10"
              required
              :error="errors.singleMobileNumber"
              :verified="data.isSingleVerified"
              :action="!otpTarget && data.singleMobileNumber.length === 10 ? { label: 'Verify', onClick: () => otpTarget = 'single' } : undefined"
            />
            <div class="mt-[-16px] mb-6 px-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-[#fc1515]">
                SuperDost Subscription requires a WhatsApp-enabled number.
              </p>
            </div>
            <OTPView v-if="otpTarget === 'single'" :on-verify="handleVerifyOTP" :on-cancel="() => otpTarget = null" />
          </div>
          <div v-else>
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Link your Existing Account</h2>
              <p class="text-slate-500 text-sm leading-relaxed">Please verify your registered numbers.</p>
            </div>
            
            <div class="bg-blue-50/20 p-5 rounded-[32px] border border-blue-50 space-y-2">
              <template v-if="data.platform === 'carwale' || data.platform === 'both'">
                <InputField
                  id="carWaleNumber"
                  label="CarWale Mobile Number"
                  v-model="data.carWaleNumber"
                  @update:model-value="data.carWaleNumber = data.carWaleNumber.replace(/\D/g, '').slice(0, 10); data.isCarWaleVerified = false; errors.carWaleNumber = ''"
                  input-mode="numeric"
                  maxlength="10"
                  required
                  :error="errors.carWaleNumber"
                  :verified="data.isCarWaleVerified"
                  :action="!otpTarget && data.carWaleNumber.length === 10 ? { label: 'Verify', onClick: () => otpTarget = 'carwale' } : undefined"
                />
                <p class="text-[10px] font-medium text-slate-400 mt-[-8px] mb-2 ml-1">
                  Your <span class="text-carwale font-bold italic">CarWale</span> Pack will get activated on this number
                </p>
                <OTPView v-if="otpTarget === 'carwale'" :on-verify="handleVerifyOTP" :on-cancel="() => otpTarget = null" />
              </template>

              <template v-if="data.platform === 'olx' || data.platform === 'both'">
                <InputField
                  id="olxNumber"
                  label="OLX Mobile Number"
                  v-model="data.olxNumber"
                  @update:model-value="data.olxNumber = data.olxNumber.replace(/\D/g, '').slice(0, 10); data.isOlxVerified = false; errors.olxNumber = ''"
                  input-mode="numeric"
                  maxlength="10"
                  required
                  :error="errors.olxNumber"
                  :verified="data.isOlxVerified"
                  :action="!otpTarget && data.olxNumber.length === 10 ? { label: 'Verify', onClick: () => otpTarget = 'olx' } : undefined"
                />
                <p class="text-[10px] font-medium text-slate-400 mt-[-8px] mb-2 ml-1">
                  Your <span class="text-olx font-bold italic">ELITE</span> Pack will get activated on this number
                </p>
                <OTPView v-if="otpTarget === 'olx'" :on-verify="handleVerifyOTP" :on-cancel="() => otpTarget = null" />
              </template>

              <template v-if="data.platform === 'carwale'">
                <InputField label="OLX Mobile Number" v-model="data.olxNumber" @update:model-value="data.olxNumber = data.olxNumber.replace(/\D/g, '').slice(0, 10)" input-mode="numeric" maxlength="10" />
                <p class="text-[10px] font-medium text-slate-400 mt-[-8px] mb-2 ml-1">Your <span class="text-olx font-bold italic">ELITE</span> Pack will get activated on this number</p>
              </template>

              <template v-if="data.platform === 'olx'">
                <InputField label="CarWale Mobile Number" v-model="data.carWaleNumber" @update:model-value="data.carWaleNumber = data.carWaleNumber.replace(/\D/g, '').slice(0, 10)" input-mode="numeric" maxlength="10" />
                <p class="text-[10px] font-medium text-slate-400 mt-[-8px] mb-2 ml-1">Your <span class="text-carwale font-bold italic">CarWale</span> Pack will get activated on this number</p>
              </template>
            </div>
          </div>
        </div>

        <!-- Step: WhatsApp -->
        <div
          v-else-if="step === 'whatsapp'"
          key="whatsapp"
        >
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Activate SuperDost</h2>
            <p class="text-slate-500 text-sm leading-relaxed tracking-tight">Select one Whatsapp Enabled number to active SuperDost.</p>
          </div>
          
          <div class="space-y-3">
            <RadioOption
              v-for="item in availableWhatsappNumbers"
              :key="item.id"
              :label="item.label"
              :description="item.number"
              :selected="data.whatsappNumberSource === item.id"
              @click="data.whatsappNumberSource = item.id"
            />
            <div class="pt-2 px-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-[#fc1515]">
                SuperDost Subscription requires a WhatsApp-enabled number.
              </p>
            </div>
          </div>
        </div>

        <!-- Step: Pricing -->
        <div
          v-else-if="step === 'pricing'"
          key="pricing"
          class="space-y-6"
        >
          <div class="mb-4">
            <h2 class="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Choice of Package</h2>
          </div>

          <div class="space-y-5">
            <!-- Gold Package -->
            <div :class="['p-0.5 rounded-[34px] transition-all duration-500', data.packageType === 'gold' ? 'gold-border-sparkle shadow-2xl scale-[1.02]' : 'bg-transparent']">
              <button
                @click="data.packageType = 'gold'"
                :class="[
                  'w-full p-4 text-left rounded-[32px] transition-all relative overflow-hidden flex flex-col h-full bg-white',
                  data.packageType === 'gold' ? 'gold-shimmer' : 'border-2 border-[#D8B86B] hover:border-[#bf953f]'
                ]"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex flex-col">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">SuperBuyer AI</p>
                    <h3 :class="['text-2xl font-black tracking-tighter leading-none', data.packageType === 'gold' ? 'text-[#bf953f]' : 'text-slate-900']">
                      Gold
                    </h3>
                  </div>
                  <div class="text-right flex flex-col items-end">
                    <p :class="['text-2xl font-black leading-none', data.packageType === 'gold' ? 'text-[#bf953f]' : 'text-slate-900']">₹{{ pricing.goldFinal.toLocaleString() }}</p>
                    <p class="text-xs font-bold line-through mt-1 text-slate-400 opacity-70">₹{{ pricing.goldBase.toLocaleString() }}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Inc. Taxes</p>
                  </div>
                </div>
                <ul class="space-y-1.5 mb-3">
                  <li v-for="point in ['Access 25 Lakh+ car listings', 'Connect directly with owners', 'Smart filters']" :key="point" class="flex items-start text-xs font-medium leading-normal">
                    <CheckCircle2 :class="['size-4 mr-2 mt-0.5 shrink-0', data.packageType === 'gold' ? 'text-[#bf953f]' : 'text-[#C8A45D]']" /> 
                    <span class="text-slate-600">{{ point }}</span>
                  </li>
                </ul>
                <div v-if="data.packageType === 'gold'" class="mt-auto pt-2 flex justify-end">
                  <div class="bg-[#bf953f] p-0.5 rounded-full"><CheckCircle2 class="size-3.5 text-white" /></div>
                </div>
              </button>
            </div>

            <!-- Diamond Package -->
            <div :class="['p-0.5 rounded-[34px] transition-all duration-500', data.packageType === 'diamond' ? 'gold-border-sparkle shadow-2xl scale-[1.02]' : 'bg-transparent']">
              <button
                @click="data.packageType = 'diamond'"
                :class="[
                  'w-full p-4 text-left rounded-[32px] transition-all relative overflow-hidden flex flex-col h-full',
                  data.packageType === 'diamond' ? 'bg-metallic-black' : 'bg-[#0d0d0d] border-2 border-[#D8B86B] hover:border-[#bf953f]'
                ]"
              >
                <Sparkles v-if="data.packageType === 'diamond'" />
                <div class="flex justify-between items-start mb-2">
                  <div class="flex flex-col">
                    <p :class="['text-[10px] font-black uppercase tracking-[0.2em] mb-0.5', data.packageType === 'diamond' ? 'text-white/40' : 'text-white/30']">SuperBuyer AI</p>
                    <h3 :class="['text-2xl font-black tracking-tighter leading-none', data.packageType === 'diamond' ? 'text-golden-metal' : 'text-white']">
                      Diamond
                    </h3>
                    <p :class="['text-[10px] font-black uppercase tracking-[0.1em] pt-[3px] h-[15px] w-[166px]', data.packageType === 'diamond' ? 'text-sparkle-shimmer !opacity-100' : 'text-white/40']">
                      Everything in Gold, plus
                    </p>
                  </div>
                  <div class="text-right flex flex-col items-end">
                    <p :class="['text-2xl font-black leading-none', data.packageType === 'diamond' ? 'text-golden-metal' : 'text-white']">₹{{ pricing.diamondFinal.toLocaleString() }}</p>
                    <p :class="['text-xs font-bold line-through mt-1 pt-[3px]', data.packageType === 'diamond' ? 'text-white/30' : 'text-white/40']">₹{{ pricing.diamondBase.toLocaleString() }}</p>
                    <p :class="['text-[10px] font-bold uppercase tracking-widest mt-0.5', data.packageType === 'diamond' ? 'text-[#bf953f] opacity-60' : 'text-[#B9C6FF] opacity-60']">Inc. Taxes</p>
                  </div>
                </div>
                <ul class="space-y-1.5 mb-3">
                  <li v-for="point in ['Activate in up to 3 cities', '540 quarterly credits', 'Increase opportunities']" :key="point" class="flex items-start text-xs font-medium leading-normal">
                    <CheckCircle2 :class="['size-4 mr-2 mt-0.5 shrink-0', data.packageType === 'diamond' ? 'text-[#bf953f]' : 'text-[#DCE7FF]']" /> 
                    <span class="text-slate-300">{{ point }}</span>
                  </li>
                </ul>
                <div v-if="data.packageType === 'diamond'" class="mt-auto pt-2 flex justify-end">
                  <div class="bg-[#bf953f] p-0.5 rounded-full"><CheckCircle2 class="size-3.5 text-white" /></div>
                </div>
              </button>

              <Motion v-if="data.packageType === 'diamond'" :initial="{ opacity: 0, height: 0 }" :animate="{ opacity: 1, height: 'auto' }" class="px-4 pb-6 pt-2 space-y-4">
                <p class="text-[11px] font-bold text-black uppercase tracking-widest mt-2 text-center w-full">Add Additional cities</p>
                <CityAutocomplete id="city2" label="City 2 (Optional)" :selected-city="data.city2" @select="(city) => data.city2 = city" placeholder="Search second city" />
                <CityAutocomplete id="city3" label="City 3 (Optional)" :selected-city="data.city3" @select="(city) => data.city3 = city" placeholder="Search third city" />
              </Motion>
            </div>

            <button
              @click="handleNext"
              :class="[
                'w-full font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 uppercase tracking-[0.15em] border-2',
                data.packageType === 'gold' ? 'bg-[#bf953f] border-[#bf953f] text-white shadow-[#bf953f]/30' : 
                data.packageType === 'diamond' ? 'bg-[#1a1a1a] border-[#bf953f] text-[#bf953f] shadow-black/50' : 
                'bg-[#22C55E] border-[#22C55E] text-white opacity-50 cursor-not-allowed'
              ]"
            >
              Buy Now <ChevronRight class="size-5" />
            </button>
          </div>
          <p v-if="errors.packageType" class="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{{ errors.packageType }}</p>
        </div>

        <!-- Step: Success -->
        <div
          v-else-if="step === 'success'"
          key="success"
          class="flex flex-col items-center justify-center text-center py-6"
        >
          <div class="size-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
            <CheckCircle2 class="size-10" />
          </div>
          <h2 class="text-3xl font-bold text-slate-900 mb-2 tracking-tight">You're all set!</h2>
          <p class="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-1">
            Welcome to <strong>SuperBuyer AI</strong>. Your activation process is underway.
          </p>
          <p class="text-[#fc1515] text-[10px] font-bold uppercase tracking-widest mb-10">
            Your invoice will be sent to your OLX App.
          </p>
          
          <div class="w-full space-y-4">
            <div class="bg-white border border-slate-100 rounded-[32px] p-6 text-left shadow-2xl shadow-slate-200/50">
              <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 w-fit px-2 py-1 rounded">Summary</p>
              <div class="space-y-4">
                 <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Dealership</span>
                    <span class="text-sm font-bold text-slate-900 truncate max-w-[150px]">{{ data.dealershipName }}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Package</span>
                    <span class="text-sm font-bold text-slate-900 capitalize">
                      {{ data.packageType === 'gold' ? 'SuperBuyer AI Gold' : 'SuperBuyer AI Diamond' }}
                    </span>
                 </div>
                 <div v-if="data.platform === 'none' && data.singleMobileNumber" class="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Activation Number</span>
                    <span class="text-sm font-bold text-slate-900">{{ data.singleMobileNumber }}</span>
                 </div>
                 <div v-if="data.carWaleNumber" class="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">CarWale Number</span>
                    <span class="text-sm font-bold text-slate-900">{{ data.carWaleNumber }}</span>
                 </div>
                 <div v-if="data.olxNumber" class="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">OLX Number</span>
                    <span class="text-sm font-bold text-slate-900">{{ data.olxNumber }}</span>
                 </div>
                 <div class="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">SuperDost</span>
                    <span class="text-sm font-black text-blue-600">{{ selectedWhatsappNumber || 'Active' }}</span>
                 </div>
              </div>
            </div>
            <div class="pt-10 pb-6 px-4 text-center">
              <p class="text-[11px] font-medium text-slate-400 bg-slate-50/50 py-3 px-4 rounded-2xl inline-block border border-slate-100/50">
                For any assistance regarding your subscription, please contact us on <span class="text-slate-900 font-bold tracking-wider">18002102180</span>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Sticky Bottom Navigation -->
    <footer v-if="step !== 'success'" class="px-6 py-6 bg-white border-t border-slate-50 sticky bottom-0 max-w-md mx-auto w-full z-50">
      <div class="flex gap-4">
        <button v-if="step !== 'basic'" @click="handleBack" class="size-14 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 flex-shrink-0">
          <ChevronLeft class="size-6" />
        </button>
        <button v-if="step !== 'pricing'" @click="handleNext" class="flex-1 font-bold rounded-2xl h-14 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl bg-[#1E293B] hover:bg-slate-800 text-white shadow-slate-200">
          Continue <ChevronRight class="size-5" />
        </button>
      </div>
      <p v-if="step === 'pricing'" class="mt-6 text-[10px] text-slate-400 text-center leading-relaxed font-medium px-2">
        If you continue you are accepting 
        <a href="https://help.olx.in/hc/en-us" target="_blank" rel="noopener noreferrer" class="text-slate-600 font-bold hover:underline">OLX</a>, 
        <a href="https://www.carwale.com/visitor-agreement/" target="_blank" rel="noopener noreferrer" class="text-slate-600 font-bold hover:underline">CarWale</a> & 
        <a href="https://www.cartrade.com/company/privacypolicy/" target="_blank" rel="noopener noreferrer" class="text-slate-600 font-bold hover:underline">CarTrade Tech</a>'s 
        Terms and Conditions and Privacy Policies.
      </p>
      <div class="w-32 h-1 bg-slate-900/10 rounded-full mx-auto mt-6"></div>
    </footer>
  </div>
</template>
