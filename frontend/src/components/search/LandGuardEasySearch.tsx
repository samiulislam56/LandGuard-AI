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
  ShieldAlert
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SampleParcel {
  parcel_id: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  dag_no: string;
  khatian_no: string;
  total_area_acres: number;
  status_bn: string;
  status_en: string;
  status_type: 'warning' | 'success' | 'info';
  explanation_bn: string;
}

const EASY_SAMPLES: SampleParcel[] = [
  {
    parcel_id: 'LG-P-002911',
    division: 'dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    mouza: 'Aminbazar',
    dag_no: '102',
    khatian_no: 'KH-102',
    total_area_acres: 0.55,
    status_bn: 'পর্যালোচনা প্রয়োজন',
    status_en: 'Review Required',
    status_type: 'warning',
    explanation_bn: 'পূর্ববর্তী দলিলের তারিখ ও মিউটেশন রেকর্ডে অসংগতি থাকায় যাচাই প্রয়োজন।'
  },
  {
    parcel_id: 'LG-P-000104',
    division: 'chattogram',
    district: 'Chattogram',
    upazila: 'Pahartali',
    mouza: 'North Kattali',
    dag_no: '205',
    khatian_no: 'KH-205',
    total_area_acres: 0.82,
    status_bn: 'বিশেষ অসংগতি পাওয়া যায়নি',
    status_en: 'Low Risk',
    status_type: 'success',
    explanation_bn: 'মালিকানা ধারাবাহিকতা ও দলিলের রেকর্ডে কোনো সংঘাত পরিলক্ষিত হয়নি।'
  },
  {
    parcel_id: 'LG-P-001420',
    division: 'rajshahi',
    district: 'Rajshahi',
    upazila: 'Paba',
    mouza: 'Nowhata',
    dag_no: '310',
    khatian_no: 'KH-310',
    total_area_acres: 1.15,
    status_bn: 'প্রয়োজনীয় তথ্য অসম্পূর্ণ',
    status_en: 'Insufficient Evidence',
    status_type: 'info',
    explanation_bn: 'খতিয়ানের নামজারি বা রেকর্ড অফ রাইটসের পূর্ণ প্রমাণ সংযুক্ত করা হয়নি।'
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
  const [identifier, setIdentifier] = useState<string>('102');
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
    setIdentifier('102');
    setSelectedResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Step Indicator Bar */}
      <div className="bg-emerald-950/20 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 w-full">
          {/* Step 1 Indicator */}
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'}`}>
              ১
            </span>
            <span className="text-xs sm:text-sm hidden sm:inline">কোথায় জমি?</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

          {/* Step 2 Indicator */}
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-emerald-600 text-white shadow-md' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              ২
            </span>
            <span className="text-xs sm:text-sm hidden sm:inline">জমির পরিচয়</span>
          </div>
          <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

          {/* Step 3 Indicator */}
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              ৩
            </span>
            <span className="text-xs sm:text-sm hidden sm:inline">ফলাফল</span>
          </div>
        </div>

        {/* Reset control */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleReset}
            title={isBn ? "পুনরায় শুরু করুন" : "Reset"}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{isBn ? "পুনরায় শুরু" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: কোথায় জমি? (Where is the land?)                                  */}
      {/* ========================================================================= */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ধাপ ১: জমিটি কোন জেলায় অবস্থিত?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                সহজে খোঁজার জন্য আপনার জমির বিভাগ এবং জেলা বেছে নিন।
              </p>
            </div>
          </div>

          {/* Division Quick Selector Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2">
              বিভাগ নির্বাচন:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'dhaka', name_bn: 'ঢাকা বিভাগ', hasData: true },
                { id: 'chattogram', name_bn: 'চট্টগ্রাম বিভাগ', hasData: true },
                { id: 'rajshahi', name_bn: 'রাজশাহী বিভাগ', hasData: true },
                { id: 'khulna', name_bn: 'খুলনা বিভাগ', hasData: true },
                { id: 'barishal', name_bn: 'বরিশাল বিভাগ', hasData: false },
                { id: 'sylhet', name_bn: 'সিলেট বিভাগ', hasData: false },
                { id: 'rangpur', name_bn: 'রংপুর বিভাগ', hasData: false },
                { id: 'mymensingh', name_bn: 'ময়মনসিংহ বিভাগ', hasData: false },
              ].map((div) => (
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
                  className={`p-3.5 rounded-2xl border text-left font-semibold text-sm transition-all flex flex-col justify-between ${
                    division === div.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <span>{div.name_bn}</span>
                  {div.hasData ? (
                    <span className="text-[10px] text-emerald-600 font-normal mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> নমুনা তথ্য সক্রিয়
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal mt-1">প্রকল্প প্রক্রিয়াধীন</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* District Selector & Quick Upazila Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                জেলা নির্বাচন করুন:
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-base focus:ring-2 focus:ring-emerald-600 shadow-sm"
              >
                {division === 'dhaka' && (
                  <>
                    <option value="Dhaka">ঢাকা (সাভার - নমুনা তথ্য উপলব্ধ)</option>
                    <option value="Gazipur">গাজীপুর</option>
                    <option value="Narayanganj">নারায়ণগঞ্জ</option>
                  </>
                )}
                {division === 'chattogram' && (
                  <>
                    <option value="Chattogram">চট্টগ্রাম (পাহাড়তলী - নমুনা তথ্য উপলব্ধ)</option>
                    <option value="Coxsbazar">কক্সবাজার</option>
                  </>
                )}
                {division === 'rajshahi' && (
                  <>
                    <option value="Rajshahi">রাজশাহী (পবা - নমুনা তথ্য উপলব্ধ)</option>
                    <option value="Bogura">বগুড়া</option>
                  </>
                )}
                {division === 'khulna' && (
                  <>
                    <option value="Khulna">খুলনা (রূপসা - নমুনা তথ্য উপলব্ধ)</option>
                    <option value="Jashore">যশোর</option>
                  </>
                )}
                {!['dhaka', 'chattogram', 'rajshahi', 'khulna'].includes(division) && (
                  <option value="Dhaka">ঢাকা (ডিফল্ট নমুনা)</option>
                )}
              </select>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-2xl flex items-center gap-3">
              <Compass className="w-7 h-7 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-emerald-900 dark:text-emerald-200">সহজ পরামর্শ:</strong> যদি নির্দিষ্ট জেলা জানা না থাকে, তবে ডিফল্ট হিসেবে <strong>"ঢাকা (সাভার)"</strong> নির্বাচন করে পরবর্তী ধাপে যেতে পারেন।
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <Button
              type="button"
              onClick={handleStep1Next}
              className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>পরবর্তী ধাপ: জমির পরিচয় দিন</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: জমির পরিচয় কী? (What is the land's identity?)                     */}
      {/* ========================================================================= */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ধাপ ২: জমির দাগ, খতিয়ান বা পার্সেল নম্বর
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                আপনার দলিলের দাগ নম্বর, খতিয়ান বা পার্সেল নম্বর লিখুন।
              </p>
            </div>
          </div>

          {/* Clean Input field without voice */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="যেমন: ১০২ অথবা LG-P-002911"
                className="w-full pl-5 pr-14 py-4 rounded-2xl border-2 border-emerald-600/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-lg focus:outline-none focus:border-emerald-600 shadow-inner"
              />
              <div className="absolute right-3 top-3.5 flex items-center text-emerald-600 pointer-events-none">
                <Search className="w-6 h-6 opacity-60" />
              </div>
            </div>
          </div>

          {/* Quick Clickable Sample Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              বা সরাসরি নিচের যে কোনো একটি নমুনা বেছে নিন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EASY_SAMPLES.map((sample) => (
                <button
                  key={sample.parcel_id}
                  type="button"
                  onClick={() => {
                    setIdentifier(sample.parcel_id);
                    setSelectedResult(sample);
                    setStep(3);
                  }}
                  className="p-3.5 rounded-2xl border border-emerald-800/20 bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {sample.parcel_id}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    দাগ নং: {sample.dag_no} ({sample.mouza})
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {sample.status_bn}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-2xl border-slate-300 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>পেছনে</span>
            </Button>
            <Button
              type="button"
              onClick={handleStep2Next}
              className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-5 h-5" />
              <span>ফলাফল দেখুন</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: কী তথ্য পাওয়া গেছে? (What information was found?)               */}
      {/* ========================================================================= */}
      {step === 3 && selectedResult && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  নমুনা জমির তথ্য
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {selectedResult.parcel_id}
                </h2>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-2xl border text-sm font-bold flex items-center gap-2 ${
              selectedResult.status_type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                : selectedResult.status_type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800'
            }`}>
              {selectedResult.status_type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-600" />}
              <span>{selectedResult.status_bn}</span>
            </div>
          </div>

          {/* Key Facts in Big Touch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-semibold block">দাগ নম্বর</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedResult.dag_no}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-semibold block">খতিয়ান নম্বর</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedResult.khatian_no}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-semibold block">অবস্থান</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedResult.district}, {selectedResult.upazila}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-semibold block">জমির পরিমাণ</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{selectedResult.total_area_acres} একর</span>
            </div>
          </div>

          {/* Simple Explanation Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
              কেন এই পর্যালোচনা?
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedResult.explanation_bn}
            </p>
          </div>

          {/* Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              onClick={() => navigate(`/parcels/${selectedResult.parcel_id}`)}
              className="py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>বিস্তারিত ডসিয়ার দেখুন</span>
              <ExternalLink className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/khasra-map')}
              className="py-4 rounded-2xl border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold text-base flex items-center justify-center gap-2 transition-all"
            >
              <span>খসড়া ম্যাপে প্লট দেখুন</span>
              <Compass className="w-5 h-5" />
            </Button>
          </div>

          {/* Reset / Search Again */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => setStep(2)}
              className="hover:underline flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> অন্য দাগ নম্বর দিন
            </button>
            {onSwitchToAdvanced && (
              <button
                onClick={onSwitchToAdvanced}
                className="hover:underline text-emerald-700 dark:text-emerald-400 font-semibold"
              >
                অ্যাডভান্সড মোডে ফিল্টার করুন →
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
