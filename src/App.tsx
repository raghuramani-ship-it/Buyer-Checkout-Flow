/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Smartphone, 
  Store, 
  Mail, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';

// --- Types ---

type Platform = 'carwale' | 'olx' | 'both' | 'none' | null;
type Step = 'basic' | 'package' | 'details' | 'whatsapp' | 'success';

interface OnboardingData {
  dealershipName: string;
  email: string;
  platform: Platform;
  carWaleNumber: string;
  olxNumber: string;
  singleMobileNumber: string;
  isCarWaleVerified: boolean;
  isOlxVerified: boolean;
  isSingleVerified: boolean;
  useForWhatsapp: boolean;
  customWhatsappNumber: string;
}

// --- Components ---

const InputField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  required = false,
  hint,
  inputMode,
  action,
  disabled = false,
  verified = false,
}: any) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-1.5 ml-1">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {verified && (
          <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="size-3" /> VERIFIED
          </span>
        )}
        {!required && !verified && <span className="text-[10px] text-slate-300 font-medium italic">Optional</span>}
      </div>
    </div>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={disabled || verified}
        className={`w-full px-4 py-3.5 border-2 rounded-2xl outline-none transition-all placeholder:text-slate-300 ${
          verified 
            ? 'bg-green-50/30 border-green-100 text-slate-900 cursor-default' 
            : 'bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white text-slate-900 group-hover:bg-slate-100/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {action && !verified && value.length === 10 && (
        <button 
          onClick={action.onClick}
          disabled={action.disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {action.label}
        </button>
      )}
    </div>
    {hint && <p className="mt-2 text-[10px] text-slate-400 italic leading-relaxed">{hint}</p>}
  </div>
);

const RadioOption = ({ selected, onClick, label, value, description }: any) => (
  <button
    onClick={() => onClick(value)}
    className={`w-full p-4 mb-3 text-left border-2 rounded-2xl transition-all flex items-center gap-4 ${
      selected 
        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
    }`}
  >
    <div className={`size-4 rounded-full border-[3.5px] transition-all flex-shrink-0 ${
      selected ? 'border-blue-600 bg-white' : 'border-slate-300 bg-transparent'
    }`} />
    <div className="flex-1">
      <p className="font-bold text-sm tracking-tight">{label}</p>
      {description && <p className="text-[10px] opacity-70 mt-0.5 uppercase font-bold tracking-wider">{description}</p>}
    </div>
  </button>
);

const OTPView = ({ onVerify, onCancel }: { onVerify: (otp: string) => void, onCancel: () => void }) => {
  const [val, setVal] = useState('');
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white border-2 border-blue-100 p-6 rounded-3xl shadow-xl shadow-blue-900/5 mt-2 mb-6"
    >
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Code</p>
      <p className="text-sm text-slate-600 mb-4">We've sent a 6-digit code. Enter it below to verify.</p>
      <div className="flex gap-3">
        <input 
          autoFocus
          type="text" 
          value={val}
          maxLength={6}
          placeholder="000000"
          onChange={(e) => setVal(e.target.value.replace(/\D/g, ''))}
          className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-xl font-bold tracking-[0.5em] outline-none transition-all text-center"
        />
        <button 
          onClick={() => onVerify(val)}
          className={`px-6 rounded-xl font-bold transition-all ${
            val.length === 6 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Verify
        </button>
      </div>
      <button onClick={onCancel} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
        Resend or Change Number
      </button>
    </motion.div>
  );
};

export default function App() {
  const [step, setStep] = useState<Step>('basic');
  const [data, setData] = useState<OnboardingData>({
    dealershipName: '',
    email: '',
    platform: null,
    carWaleNumber: '',
    olxNumber: '',
    singleMobileNumber: '',
    isCarWaleVerified: false,
    isOlxVerified: false,
    isSingleVerified: false,
    useForWhatsapp: true,
    customWhatsappNumber: '',
  });

  const [otpTarget, setOtpTarget] = useState<'carwale' | 'olx' | 'single' | null>(null);

  // Navigation Logic
  const handleNext = () => {
    if (step === 'basic') {
      if (!data.dealershipName.trim()) return;
      setStep('package');
    } else if (step === 'package') {
      if (data.platform === null) return;
      setStep('details');
    } else if (step === 'details') {
       setStep('whatsapp');
    } else if (step === 'whatsapp') {
      setStep('success');
    }
  };

  const handleBack = () => {
    if (step === 'package') setStep('basic');
    if (step === 'details') setStep('package');
    if (step === 'whatsapp') setStep('details');
  };

  const handleVerifyOTP = (otp: string) => {
    // Simulated verification
    if (otp.length === 6) {
      const sameNum = data.carWaleNumber === data.olxNumber && data.carWaleNumber.length === 10;
      
      if (otpTarget === 'carwale') {
        setData(prev => ({ 
          ...prev, 
          isCarWaleVerified: true,
          isOlxVerified: sameNum ? true : prev.isOlxVerified 
        }));
      } else if (otpTarget === 'olx') {
        setData(prev => ({ 
          ...prev, 
          isOlxVerified: true,
          isCarWaleVerified: sameNum ? true : prev.isCarWaleVerified
        }));
      } else if (otpTarget === 'single') {
        setData(prev => ({ ...prev, isSingleVerified: true }));
      }
      setOtpTarget(null);
    }
  };

  // Logic to determine if "Continue" should be enabled
  const isDetailsStepComplete = () => {
    const { platform, isCarWaleVerified, isOlxVerified, isSingleVerified } = data;
    if (platform === 'carwale') return isCarWaleVerified;
    if (platform === 'olx') return isOlxVerified;
    if (platform === 'both') return isCarWaleVerified && isOlxVerified;
    if (platform === 'none') return isSingleVerified;
    return false;
  };

  // WhatsApp numbers available for selection
  const verifiedNumbers = useMemo(() => {
    const set = new Set<string>();
    if (data.isCarWaleVerified) set.add(data.carWaleNumber);
    if (data.isOlxVerified) set.add(data.olxNumber);
    if (data.isSingleVerified) set.add(data.singleMobileNumber);
    return Array.from(set);
  }, [data]);

  const whatsappDisplayNumber = verifiedNumbers[0] || '';

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans max-w-md mx-auto bg-surface overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-blue-600 font-black text-xl tracking-tighter">SuperBuyer</span>
          {step !== 'success' && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
              Step {step === 'basic' ? '1' : step === 'package' ? '2' : step === 'details' ? '3' : '4'} of 4
            </span>
          )}
        </div>
        {step !== 'success' && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: '0%' }}
              animate={{ 
                width: step === 'basic' ? '25%' : 
                       step === 'package' ? '50%' :
                       step === 'details' ? '75%' : '90%'
              }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        )}
      </header>

      {/* Progress Bar placeholder removed as it's merged into header per Design HTML layout */}

      {/* Content Area */}
      <main className="flex-1 px-6 pb-24 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Let's get started</h2>
                <p className="text-slate-500 text-sm leading-relaxed">This helps us connect your account faster.</p>
              </div>

              <InputField
                label="Dealership Name"
                placeholder="e.g. Skyline Motors"
                value={data.dealershipName}
                onChange={(val: string) => setData({ ...data, dealershipName: val })}
                required
                icon={Store}
              />

              <InputField
                label="Email ID"
                placeholder="name@dealership.com"
                value={data.email}
                onChange={(val: string) => setData({ ...data, email: val })}
                type="email"
                icon={Mail}
              />
            </motion.div>
          )}

          {step === 'package' && (
            <motion.div
              key="package"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Active Packages</h2>
                <p className="text-slate-500 text-sm leading-relaxed">Which platform do you currently have an active package on?</p>
              </div>

              <div className="space-y-2">
                <RadioOption
                  label="CarWale"
                  value="carwale"
                  selected={data.platform === 'carwale'}
                  onClick={(v: any) => setData({ ...data, platform: v })}
                />
                <RadioOption
                  label="OLX"
                  value="olx"
                  selected={data.platform === 'olx'}
                  onClick={(v: any) => setData({ ...data, platform: v })}
                />
                <RadioOption
                  label="Both"
                  value="both"
                  selected={data.platform === 'both'}
                  onClick={(v: any) => setData({ ...data, platform: v })}
                />
                <RadioOption
                  label="None"
                  value="none"
                  selected={data.platform === 'none'}
                  onClick={(v: any) => setData({ ...data, platform: v })}
                />
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {data.platform === 'none' ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">New Activation</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">Enter your main number to activate packages.</p>
                  </div>
                  
                  <InputField
                    label="Activation Number"
                    placeholder="99999 99999"
                    value={data.singleMobileNumber}
                    onChange={(val: string) => setData({ ...data, singleMobileNumber: val.replace(/\D/g, '').slice(0, 10), isSingleVerified: false })}
                    inputMode="numeric"
                    required
                    verified={data.isSingleVerified}
                    action={!otpTarget && data.singleMobileNumber.length === 10 && { 
                      label: "Verify", 
                      onClick: () => setOtpTarget('single')
                    }}
                  />
                  {otpTarget === 'single' && (
                    <OTPView 
                      onVerify={handleVerifyOTP} 
                      onCancel={() => setOtpTarget(null)} 
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Account Links</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">Please verify your registered numbers.</p>
                  </div>
                  
                  <div className="bg-blue-50/20 p-5 rounded-[32px] border border-blue-50 space-y-2">
                    {(data.platform === 'carwale' || data.platform === 'both') && (
                      <>
                        <InputField
                          label="CarWale Mobile Number"
                          placeholder="99999 99999"
                          value={data.carWaleNumber}
                          onChange={(val: string) => setData({ ...data, carWaleNumber: val.replace(/\D/g, '').slice(0, 10), isCarWaleVerified: false })}
                          inputMode="numeric"
                          required
                          verified={data.isCarWaleVerified}
                          action={!otpTarget && data.carWaleNumber.length === 10 && { 
                            label: "Verify", 
                            onClick: () => setOtpTarget('carwale')
                          }}
                        />
                        {otpTarget === 'carwale' && (
                          <OTPView 
                            onVerify={handleVerifyOTP} 
                            onCancel={() => setOtpTarget(null)} 
                          />
                        )}
                      </>
                    )}

                    {(data.platform === 'olx' || data.platform === 'both') && (
                      <>
                        <InputField
                          label="OLX Mobile Number"
                          placeholder="99999 99999"
                          value={data.olxNumber}
                          onChange={(val: string) => setData({ ...data, olxNumber: val.replace(/\D/g, '').slice(0, 10), isOlxVerified: false })}
                          inputMode="numeric"
                          required
                          verified={data.isOlxVerified}
                          action={!otpTarget && data.olxNumber.length === 10 && { 
                            label: "Verify", 
                            onClick: () => setOtpTarget('olx')
                          }}
                        />
                        {otpTarget === 'olx' && (
                          <OTPView 
                            onVerify={handleVerifyOTP} 
                            onCancel={() => setOtpTarget(null)} 
                          />
                        )}
                      </>
                    )}

                    {data.platform === 'carwale' && (
                      <InputField
                        label="OLX Mobile Number"
                        placeholder="99999 99999 (Optional)"
                        value={data.olxNumber}
                        onChange={(val: string) => setData({ ...data, olxNumber: val.replace(/\D/g, '').slice(0, 10) })}
                        inputMode="numeric"
                        hint="Skip if you don't use this."
                      />
                    )}

                    {data.platform === 'olx' && (
                      <InputField
                        label="CarWale Mobile Number"
                        placeholder="99999 99999 (Optional)"
                        value={data.carWaleNumber}
                        onChange={(val: string) => setData({ ...data, carWaleNumber: val.replace(/\D/g, '').slice(0, 10) })}
                        inputMode="numeric"
                        hint="Skip if you don't use this."
                      />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">Activate WhatsApp</h2>
                <p className="text-slate-500 text-sm leading-relaxed">Receive instant lead alerts on your phone.</p>
              </div>
              
              <div className="space-y-4">
                <p className="block text-sm font-semibold text-slate-800 mb-3 ml-1">Use {whatsappDisplayNumber} for WhatsApp updates?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setData({ ...data, useForWhatsapp: true })}
                    className={`flex items-center justify-center py-3.5 rounded-2xl border-2 font-bold transition-all ${
                      data.useForWhatsapp === true
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-[3px] mr-2 transition-all ${
                      data.useForWhatsapp === true ? 'border-blue-600 bg-white' : 'border-slate-300'
                    }`}></div> Yes
                  </button>
                  <button 
                    onClick={() => setData({ ...data, useForWhatsapp: false })}
                    className={`flex items-center justify-center py-3.5 rounded-2xl border-2 font-bold transition-all ${
                      data.useForWhatsapp === false
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-[3px] mr-2 transition-all ${
                      data.useForWhatsapp === false ? 'border-blue-600 bg-white' : 'border-slate-300'
                    }`}></div> No
                  </button>
                </div>

                <AnimatePresence>
                  {!data.useForWhatsapp && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <InputField
                        label="Enter WhatsApp Number"
                        placeholder="99999 99999"
                        value={data.customWhatsappNumber}
                        onChange={(val: string) => setData({ ...data, customWhatsappNumber: val.replace(/\D/g, '').slice(0, 10) })}
                        inputMode="numeric"
                        required
                        icon={MessageCircle}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="size-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">You're all set!</h2>
              <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed mb-10">
                Welcome to <strong>SuperBuyer</strong>. Your activation process is underway.
              </p>
              
              <div className="w-full space-y-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 text-left shadow-2xl shadow-slate-200/50">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 w-fit px-2 py-1 rounded">Summary</p>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dealership</span>
                        <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{data.dealershipName}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Package</span>
                        <span className="text-sm font-bold text-slate-900 capitalize">{data.platform || 'New'}</span>
                     </div>
                     <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp</span>
                        <span className="text-sm font-black text-blue-600">
                          {data.useForWhatsapp ? whatsappDisplayNumber : data.customWhatsappNumber || 'Active'}
                        </span>
                     </div>
                  </div>
                </div>
                
                <button 
                   onClick={() => window.location.reload()}
                   className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] mt-6"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Navigation */}
      {step !== 'success' && (
        <footer className="px-6 py-6 bg-white border-t border-slate-50 sticky bottom-0 max-w-md mx-auto w-full z-50">
          <div className="flex gap-4">
            {step !== 'basic' && (
              <button
                onClick={handleBack}
                className="size-14 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 flex-shrink-0"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 'package' && data.platform === null) ||
                (step === 'details' && !isDetailsStepComplete()) ||
                (step === 'whatsapp' && !data.useForWhatsapp && !data.customWhatsappNumber)
              }
              className={`flex-1 font-bold rounded-2xl h-14 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                ((step === 'package' && data.platform === null) ||
                 (step === 'details' && !isDetailsStepComplete()) ||
                 (step === 'whatsapp' && !data.useForWhatsapp && !data.customWhatsappNumber))
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-70'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
              }`}
            >
              {step === 'whatsapp' ? 'Finalize' : 'Continue'}
              <ChevronRight className="size-5" />
            </button>
          </div>
          {/* iOS Indicator Mockup */}
          <div className="w-32 h-1 bg-slate-900/10 rounded-full mx-auto mt-6"></div>
        </footer>
      )}
    </div>
  );
}
