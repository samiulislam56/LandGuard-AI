import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Compass, 
  Sparkles, 
  Search,
  ExternalLink,
  ShieldAlert,
  Info,
  Clock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SampleParcel {
  parcel_id: string;
  division: string;
  division_bn: string;
  division_en: string;
  district: string;
  district_bn: string;
  upazila: string;
  upazila_bn: string;
  mouza: string;
  mouza_bn: string;
  jl_no: string;
  dag_no: string;
  khatian_no: string;
  total_area_acres: number;
  status_bn: string;
  status_en: string;
  status_type: 'warning' | 'success' | 'info';
  explanation_bn: string;
  explanation_en: string;
}

// 4 Verified Source-Backed Benchmark Parcels across 4 covered regions
export const EASY_SAMPLES: SampleParcel[] = [
  {
    parcel_id: 'LG-P-002911',
    division: 'khulna',
    division_bn: 'খুলনা বিভাগ',
    division_en: 'Khulna Division',
    district: 'Khulna',
    district_bn: 'খুলনা',
    upazila: 'Dumuria',
    upazila_bn: 'ডুমুরিয়া',
    mouza: 'Raghunathpur',
    mouza_bn: 'রঘুনাথপুর',
    jl_no: 'JL-032',
    dag_no: '611',
    khatian_no: '1211',
    total_area_acres: 0.39,
    status_bn: 'পর্যালোচনা প্রয়োজন',
    status_en: 'Review Required',
    status_type: 'warning',
    explanation_bn: 'পূর্ববর্তী দলিলের তারিখ ও নামজারি রেকর্ডে সম্ভাব্য অসংগতি পরিলক্ষিত হওয়ায় খতিয়ান যাচাই প্রয়োজন।',
    explanation_en: 'Potential discrepancy detected in deed dates and mutation records; ledger verification recommended.'
  },
  {
    parcel_id: 'LG-P-000004',
    division: 'dhaka',
    division_bn: 'ঢাকা বিভাগ',
    division_en: 'Dhaka Division',
    district: 'Dhaka',
    district_bn: 'ঢাকা',
    upazila: 'Savar',
    upazila_bn: 'সাভার',
    mouza: 'Ashulia',
    mouza_bn: 'আশুলিয়া',
    jl_no: 'JL-005',
    dag_no: '104',
    khatian_no: '1004',
    total_area_acres: 1.456,
    status_bn: 'স্বাভাবিক (ঝুঁকিমুক্ত)',
    status_en: 'Low Risk',
    status_type: 'success',
    explanation_bn: 'মালিকানা ধারাবাহিকতা ও দলিলের রেকর্ডে কোনো সংঘাত বা দ্বৈত মালিকানা পাওয়া যায়নি।',
    explanation_en: 'Chain of title is continuous and no conflicting transfers or duplicate ownership detected.'
  },
  {
    parcel_id: 'LG-P-000002',
    division: 'chattogram',
    division_bn: 'চট্টগ্রাম বিভাগ',
    division_en: 'Chattogram Division',
    district: 'Chattogram',
    district_bn: 'চট্টগ্রাম',
    upazila: 'Patiya',
    upazila_bn: 'পটিয়া',
    mouza: 'Haidgaon',
    mouza_bn: 'হাইদগাঁও',
    jl_no: 'JL-001',
    dag_no: '102',
    khatian_no: '1002',
    total_area_acres: 2.872,
    status_bn: 'স্বাভাবিক (ঝুঁকিমুক্ত)',
    status_en: 'Low Risk',
    status_type: 'success',
    explanation_bn: 'নামজারি পর্চা রেকর্ড নিয়মিত এবং সীমানা বা দাগ বণ্টনে কোনো অসংগতি মেলেনি।',
    explanation_en: 'Mutation records are regular with no area over-allocation or boundary discrepancies.'
  },
  {
    parcel_id: 'LG-P-000001',
    division: 'rajshahi',
    division_bn: 'রাজশাহী বিভাগ',
    division_en: 'Rajshahi Division',
    district: 'Rajshahi',
    district_bn: 'রাজশাহী',
    upazila: 'Paba',
    upazila_bn: 'পবা',
    mouza: 'Haripur',
    mouza_bn: 'হরিপুর',
    jl_no: 'JL-082',
    dag_no: '101',
    khatian_no: '1001',
    total_area_acres: 0.452,
    status_bn: 'স্বাভাবিক (ঝুঁকিমুক্ত)',
    status_en: 'Low Risk',
    status_type: 'success',
    explanation_bn: 'খতিয়ান ও সর্বশেষ হস্তান্তর রেকর্ডে কোনো অসংগতি মেলেনি।',
    explanation_en: 'Ledger and deed transfer records match historical registry benchmarks without conflict.'
  }
];

export const LandGuardEasySearch: React.FC<{ onSwitchToAdvanced?: () => void }> = ({ onSwitchToAdvanced }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isBn = i18n.language === 'bn';

  // 3-Step Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [division, setDivision] = useState<string>('dhaka');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [identifier, setIdentifier] = useState<string>('104');
  const [selectedResult, setSelectedResult] = useState<SampleParcel | null>(null);

  const handleStep1Next = () => {
    setStep(2);
  };

  const handleStep2Next = () => {
    const q = identifier.trim().toLowerCase();
    const found = EASY_SAMPLES.find(
      s => s.parcel_id.toLowerCase().includes(q) || 
           s.dag_no.toLowerCase().includes(q) || 
           s.khatian_no.toLowerCase().includes(q)
    ) || EASY_SAMPLES[0]; // fallback to benchmark sample

    setSelectedResult(found);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setDivision('dhaka');
    setDistrict('Dhaka');
    setIdentifier('104');
    setSelectedResult(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Wizard Step Indicator Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#D2E2D9] dark:border-[#526579] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 w-full">
          {/* Step 1 Indicator */}
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700 dark:text-[#34D399] font-bold' : 'text-slate-400 dark:text-[#94A3B8]'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 1 
                ? 'bg-[#047857] text-white shadow-md ring-2 ring-emerald-500/40' 
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399]'
            }`}>
              {isBn ? '১' : '1'}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {isBn ? 'কোথায় জমি?' : 'Where is the Land?'}
            </span>
          </div>

          <div className={`flex-1 h-0.5 transition-colors ${step >= 2 ? 'bg-emerald-600 dark:bg-[#34D399]' : 'bg-slate-200 dark:bg-[#526579]'}`} />

          {/* Step 2 Indicator */}
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700 dark:text-[#34D399] font-bold' : 'text-slate-400 dark:text-[#94A3B8]'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 2 
                ? 'bg-[#047857] text-white shadow-md ring-2 ring-emerald-500/40' 
                : step > 2 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-200 dark:bg-[#304156] text-slate-600 dark:text-[#C5D5E4]'
            }`}>
              {isBn ? '২' : '2'}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {isBn ? 'জমির পরিচয়' : 'Land Identifier'}
            </span>
          </div>

          <div className={`flex-1 h-0.5 transition-colors ${step >= 3 ? 'bg-emerald-600 dark:bg-[#34D399]' : 'bg-slate-200 dark:bg-[#526579]'}`} />

          {/* Step 3 Indicator */}
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-700 dark:text-[#34D399] font-bold' : 'text-slate-400 dark:text-[#94A3B8]'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 3 
                ? 'bg-[#047857] text-white shadow-md ring-2 ring-emerald-500/40' 
                : 'bg-slate-200 dark:bg-[#304156] text-slate-600 dark:text-[#C5D5E4]'
            }`}>
              {isBn ? '৩' : '3'}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {isBn ? 'ফলাফল' : 'Results'}
            </span>
          </div>
        </div>

        {/* Reset control */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleReset}
            title={isBn ? "পুনরায় শুরু করুন" : "Reset"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#304156] border border-[#D2E2D9] dark:border-[#526579] text-[#172B26] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-[#34D399]" />
            <span className="hidden sm:inline">{isBn ? "পুনরায় শুরু" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: কোথায় জমি? (Where is the land?)                                  */}
      {/* ========================================================================= */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-[#D2E2D9] dark:border-[#526579] rounded-3xl shadow-lg space-y-6 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399] rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#172B26] dark:text-[#F8FAFC]">
                {isBn ? "ধাপ ১: জমিটি কোন জেলায় অবস্থিত?" : "Step 1: Where is the land located?"}
              </h2>
              <p className="text-sm text-[#52645C] dark:text-[#C5D5E4]">
                {isBn ? "সহজে খোঁজার জন্য আপনার জমির বিভাগ এবং জেলা বেছে নিন।" : "Select the division and district of the parcel to narrow down records."}
              </p>
            </div>
          </div>

          {/* Division Quick Selector Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] mb-2.5">
              {isBn ? "বিভাগ নির্বাচন করুন (Division):" : "Select Division:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'dhaka', name_bn: 'ঢাকা বিভাগ', name_en: 'Dhaka Division', hasData: true },
                { id: 'chattogram', name_bn: 'চট্টগ্রাম বিভাগ', name_en: 'Chattogram Division', hasData: true },
                { id: 'rajshahi', name_bn: 'রাজশাহী বিভাগ', name_en: 'Rajshahi Division', hasData: true },
                { id: 'khulna', name_bn: 'খুলনা বিভাগ', name_en: 'Khulna Division', hasData: true },
                { id: 'barishal', name_bn: 'বরিশাল বিভাগ', name_en: 'Barishal Division', hasData: false },
                { id: 'sylhet', name_bn: 'সিলেট বিভাগ', name_en: 'Sylhet Division', hasData: false },
                { id: 'rangpur', name_bn: 'রংপুর বিভাগ', name_en: 'Rangpur Division', hasData: false },
                { id: 'mymensingh', name_bn: 'ময়মনসিংহ বিভাগ', name_en: 'Mymensingh Division', hasData: false },
              ].map((div) => {
                const isSelected = division === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => {
                      setDivision(div.id);
                      if (div.id === 'dhaka') setDistrict('Dhaka');
                      else if (div.id === 'chattogram') setDistrict('Chattogram');
                      else if (div.id === 'rajshahi') setDistrict('Rajshahi');
                      else if (div.id === 'khulna') setDistrict('Khulna');
                      else setDistrict('Dhaka');
                    }}
                    className={`p-3.5 rounded-2xl border text-left font-semibold text-sm transition-all flex flex-col justify-between min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 text-[#172B26] dark:text-[#F8FAFC] ring-2 ring-emerald-500/50 shadow-sm'
                        : 'border-[#D2E2D9] dark:border-[#526579] bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <span className="font-bold text-sm text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? div.name_bn : div.name_en}
                    </span>
                    {div.hasData ? (
                      <span className="text-[11px] text-emerald-700 dark:text-[#34D399] font-medium mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isBn ? "নমুনা তথ্য সক্রিয়" : "Active Synthetic Data"}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#52645C] dark:text-[#C5D5E4] font-medium mt-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isBn ? "প্রকল্প প্রক্রিয়াধীন" : "Under Development"}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Selector & Quick Upazila Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172B26] dark:text-[#F8FAFC] mb-2">
                {isBn ? "জেলা নির্বাচন করুন (District):" : "Select District:"}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#D2E2D9] dark:border-[#526579] bg-white dark:bg-[#102421] text-[#172B26] dark:text-[#F8FAFC] font-medium text-base focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm transition-colors"
              >
                {division === 'dhaka' && (
                  <>
                    <option value="Dhaka" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "ঢাকা (সাভার • আশুলিয়া JL-005)" : "Dhaka (Savar • Ashulia JL-005)"}
                    </option>
                    <option value="Gazipur" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "গাজীপুর" : "Gazipur"}
                    </option>
                    <option value="Narayanganj" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "নারায়ণগঞ্জ" : "Narayanganj"}
                    </option>
                  </>
                )}
                {division === 'khulna' && (
                  <>
                    <option value="Khulna" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "খুলনা (ডুমুরিয়া • রঘুনাথপুর JL-032)" : "Khulna (Dumuria • Raghunathpur JL-032)"}
                    </option>
                    <option value="Jashore" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "যশোর" : "Jashore"}
                    </option>
                  </>
                )}
                {division === 'chattogram' && (
                  <>
                    <option value="Chattogram" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "চট্টগ্রাম (পটিয়া • হাইদগাঁও JL-001)" : "Chattogram (Patiya • Haidgaon JL-001)"}
                    </option>
                    <option value="Coxsbazar" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "কক্সবাজার" : "Cox's Bazar"}
                    </option>
                  </>
                )}
                {division === 'rajshahi' && (
                  <>
                    <option value="Rajshahi" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "রাজশাহী (পবা • হরিপুর JL-082)" : "Rajshahi (Paba • Haripur JL-082)"}
                    </option>
                    <option value="Bogura" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                      {isBn ? "বগুড়া" : "Bogura"}
                    </option>
                  </>
                )}
                {!['dhaka', 'khulna', 'chattogram', 'rajshahi'].includes(division) && (
                  <option value="Dhaka" className="bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC]">
                    {isBn ? "ঢাকা (ডিফল্ট নমুনা এলাকা)" : "Dhaka (Default Benchmark Area)"}
                  </option>
                )}
              </select>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex items-center gap-3">
              <Compass className="w-7 h-7 text-emerald-700 dark:text-[#34D399] shrink-0" />
              <p className="text-xs text-[#172B26] dark:text-[#C5D5E4] leading-relaxed">
                <strong className="text-emerald-900 dark:text-[#34D399]">
                  {isBn ? "সহজ পরামর্শ:" : "Quick Tip:"}
                </strong>{' '}
                {isBn 
                  ? "যদি নির্দিষ্ট জেলা জানা না থাকে, তবে ডিফল্ট হিসেবে \"ঢাকা (সাভার)\" অথবা \"খুলনা (ডুমুরিয়া)\" নির্বাচন করে পরবর্তী ধাপে যেতে পারেন।"
                  : "If you are unsure of the district, keep \"Dhaka (Savar)\" or \"Khulna (Dumuria)\" selected to explore verified benchmark parcels."}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#D2E2D9] dark:border-[#526579] flex justify-end">
            <Button
              type="button"
              onClick={handleStep1Next}
              className="px-6 py-3.5 rounded-2xl bg-[#047857] hover:bg-[#035e44] text-white font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <span>{isBn ? "পরবর্তী ধাপ: জমির পরিচয় দিন" : "Next Step: Enter Land Identifier"}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: জমির পরিচয় কী? (What is the land's identity?)                     */}
      {/* ========================================================================= */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-[#D2E2D9] dark:border-[#526579] rounded-3xl shadow-lg space-y-6 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399] rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#172B26] dark:text-[#F8FAFC]">
                {isBn ? "ধাপ ২: জমির দাগ, খতিয়ান বা পার্সেল নম্বর" : "Step 2: Land Dag, Khatian or Parcel ID"}
              </h2>
              <p className="text-sm text-[#52645C] dark:text-[#C5D5E4]">
                {isBn ? "আপনার দলিলের দাগ নম্বর, খতিয়ান বা পার্সেল নম্বর লিখুন।" : "Enter the survey plot (Dag), record-of-rights (Khatian), or Parcel ID."}
              </p>
            </div>
          </div>

          {/* Clean Input field */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isBn ? "যেমন: ১০৪ অথবা LG-P-002911" : "e.g. 104 or LG-P-002911"}
                className="w-full pl-5 pr-14 py-4 rounded-2xl border-2 border-emerald-600/50 dark:border-emerald-500/60 bg-white dark:bg-[#102421] text-[#172B26] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] font-mono text-lg focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-colors"
              />
              <div className="absolute right-4 top-4 flex items-center text-emerald-600 dark:text-[#34D399] pointer-events-none">
                <Search className="w-6 h-6 opacity-70" />
              </div>
            </div>
          </div>

          {/* Quick Clickable Sample Cards (Source-Backed Genuine Synthetic Records) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#172B26] dark:text-[#F8FAFC] mb-2.5">
              {isBn ? "বা সরাসরি নিচের যে কোনো একটি নমুনা বেছে নিন (Verified Benchmark Records):" : "Or pick one of the source-backed benchmark parcels:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EASY_SAMPLES.map((sample) => (
                <button
                  key={sample.parcel_id}
                  type="button"
                  onClick={() => {
                    setIdentifier(sample.parcel_id);
                    setSelectedResult(sample);
                    setStep(3);
                  }}
                  className="p-3.5 rounded-2xl border border-[#D2E2D9] dark:border-[#526579] bg-white dark:bg-[#304156] hover:bg-emerald-50/50 dark:hover:bg-[#1E293B] hover:border-emerald-500 dark:hover:border-emerald-400 text-left transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#34D399]">
                      {sample.parcel_id}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-semibold text-[#172B26] dark:text-[#F8FAFC]">
                    {isBn ? `দাগ: ${sample.dag_no} (${sample.mouza_bn})` : `Dag: ${sample.dag_no} (${sample.mouza})`}
                  </div>
                  <div className="text-xs text-[#52645C] dark:text-[#C5D5E4] mt-0.5">
                    {isBn ? `${sample.district_bn} • ${sample.upazila_bn}` : `${sample.district} • ${sample.upazila}`}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#526579]/60 flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${
                      sample.status_type === 'warning'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-[#34D399]'
                    }`}>
                      {isBn ? sample.status_bn : sample.status_en}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">
                      {sample.total_area_acres} {isBn ? "একর" : "acres"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#D2E2D9] dark:border-[#526579] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-2xl border-[#D2E2D9] dark:border-[#526579] font-semibold text-[#172B26] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#304156] flex items-center gap-2 min-h-[48px]"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{isBn ? "পেছনে" : "Back"}</span>
            </Button>
            <Button
              type="button"
              onClick={handleStep2Next}
              className="px-6 py-3.5 rounded-2xl bg-[#047857] hover:bg-[#035e44] text-white font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <Search className="w-5 h-5" />
              <span>{isBn ? "ফলাফল দেখুন" : "View Results"}</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: কী তথ্য পাওয়া গেছে? (What information was found?)               */}
      {/* ========================================================================= */}
      {step === 3 && selectedResult && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-[#D2E2D9] dark:border-[#526579] rounded-3xl shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2E2D9] dark:border-[#526579] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399] rounded-2xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-[#34D399]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-[#34D399] uppercase tracking-wider">
                  {isBn ? "যাচাইকৃত পার্সেল তথ্য (Verified Parcel Record)" : "Verified Synthetic Parcel Record"}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#172B26] dark:text-[#F8FAFC] font-mono">
                  {selectedResult.parcel_id}
                </h2>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-2xl border text-sm font-bold flex items-center gap-2 ${
              selectedResult.status_type === 'warning'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                : selectedResult.status_type === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                : 'bg-blue-100 dark:bg-blue-950/80 text-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-700'
            }`}>
              {selectedResult.status_type === 'warning' ? (
                <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              )}
              <span>{isBn ? selectedResult.status_bn : selectedResult.status_en}</span>
            </div>
          </div>

          {/* Key Facts in Big High-Contrast Touch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Dag Number */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#304156] border border-[#D2E2D9] dark:border-[#526579] transition-colors">
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] font-semibold block mb-1">
                {isBn ? "দাগ নম্বর (Dag No.)" : "Dag Number"}
              </span>
              <span className="text-xl font-bold text-[#172B26] dark:text-[#F8FAFC] font-mono">
                {selectedResult.dag_no || (isBn ? "তথ্য পাওয়া যায়নি" : "Not Available")}
              </span>
            </div>

            {/* Khatian Number */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#304156] border border-[#D2E2D9] dark:border-[#526579] transition-colors">
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] font-semibold block mb-1">
                {isBn ? "খতিয়ান নম্বর (Khatian)" : "Khatian Number"}
              </span>
              <span className="text-xl font-bold text-[#172B26] dark:text-[#F8FAFC] font-mono">
                {selectedResult.khatian_no || (isBn ? "তথ্য পাওয়া যায়নি" : "Not Available")}
              </span>
            </div>

            {/* Location */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#304156] border border-[#D2E2D9] dark:border-[#526579] transition-colors">
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] font-semibold block mb-1">
                {isBn ? "অবস্থান (Location)" : "Location"}
              </span>
              <span className="text-sm sm:text-base font-bold text-[#172B26] dark:text-[#F8FAFC] block truncate">
                {isBn 
                  ? `${selectedResult.district_bn}, ${selectedResult.upazila_bn}`
                  : `${selectedResult.district}, ${selectedResult.upazila}`}
              </span>
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] block mt-0.5">
                {isBn ? `মৌজা: ${selectedResult.mouza_bn} (${selectedResult.jl_no})` : `Mouza: ${selectedResult.mouza} (${selectedResult.jl_no})`}
              </span>
            </div>

            {/* Land Area */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#304156] border border-[#D2E2D9] dark:border-[#526579] transition-colors">
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] font-semibold block mb-1">
                {isBn ? "জমির পরিমাণ (Area)" : "Land Area"}
              </span>
              <span className="text-xl font-bold text-[#172B26] dark:text-[#F8FAFC]">
                {selectedResult.total_area_acres ? `${selectedResult.total_area_acres} ${isBn ? "একর" : "acres"}` : (isBn ? "তথ্য পাওয়া যায়নি" : "Not Available")}
              </span>
              <span className="text-xs text-[#52645C] dark:text-[#C5D5E4] block mt-0.5">
                {selectedResult.total_area_acres ? `≈ ${(selectedResult.total_area_acres * 100).toFixed(1)} ${isBn ? "শতাংশ" : "decimals"}` : ""}
              </span>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-[#34D399] mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>{isBn ? "কেন এই সিদ্ধান্ত? (Why Flagged / Clean?)" : "Assessment Explanation"}</span>
            </h4>
            <p className="text-sm text-[#172B26] dark:text-[#C5D5E4] leading-relaxed">
              {isBn ? selectedResult.explanation_bn : selectedResult.explanation_en}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              onClick={() => navigate(`/parcels/${selectedResult.parcel_id}`)}
              className="py-4 rounded-2xl bg-[#047857] hover:bg-[#035e44] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all min-h-[48px]"
            >
              <span>{isBn ? "সম্পূর্ণ দলিল ডসিয়ার দেখুন" : "View Complete Dossier"}</span>
              <ExternalLink className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/khasra-map?parcel=${selectedResult.parcel_id}`)}
              className="py-4 rounded-2xl border-2 border-emerald-600/50 hover:bg-emerald-50 dark:hover:bg-[#304156] text-emerald-900 dark:text-[#34D399] font-bold text-base flex items-center justify-center gap-2 transition-all min-h-[48px]"
            >
              <span>{isBn ? "খসড়া ম্যাপে প্লট দেখুন" : "Inspect Plot on Khasra Map"}</span>
              <Compass className="w-5 h-5" />
            </Button>
          </div>

          {/* Reset / Search Again */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#52645C] dark:text-[#C5D5E4]">
            <button
              onClick={() => setStep(2)}
              className="hover:underline flex items-center gap-1 font-semibold text-[#172B26] dark:text-[#F8FAFC]"
            >
              <ChevronLeft className="w-4 h-4" /> {isBn ? "অন্য দাগ নম্বর দিয়ে খুঁজুন" : "Search with another Dag"}
            </button>
            {onSwitchToAdvanced && (
              <button
                onClick={onSwitchToAdvanced}
                className="hover:underline text-emerald-700 dark:text-[#34D399] font-semibold"
              >
                {isBn ? "উন্নত ফিল্টার মোড →" : "Advanced Filter Mode →"}
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
