import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  Scale, 
  UserCheck, 
  Calendar,
  Info
} from 'lucide-react';
import { Card } from '../ui/Card';

interface ChecklistProps {
  transactionId: string;
  hasDeedRecord: boolean;
  hasKhatianRecord: boolean;
  hasMutationRecord: boolean;
  isAreaConsistent: boolean;
  isLineageConsistent: boolean;
  isDateValid: boolean;
  sellerRepeatCount?: number;
}

export const SmartDocumentChecklist: React.FC<ChecklistProps> = ({
  transactionId,
  hasDeedRecord = true,
  hasKhatianRecord = true,
  hasMutationRecord = false,
  isAreaConsistent = true,
  isLineageConsistent = false,
  isDateValid = true,
  sellerRepeatCount = 1
}) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const items = [
    {
      title_bn: 'মূল রেজিস্ট্রি দলিল রেকর্ড',
      title_en: 'Registered Deed Record',
      status: hasDeedRecord ? 'verified' : 'missing',
      desc_bn: 'সাব-রেজিস্ট্রি ভলিউমে বালাম বই ও দলিলের রেজিস্ট্রি নিশ্চিতকরণ।',
      desc_en: 'Verification of deed registration in sub-registry records.',
      icon: <FileText className="w-5 h-5" />
    },
    {
      title_bn: 'সরকারি খতিয়ান / পর্চা রেকর্ড',
      title_en: 'Cadastral Khatian Record',
      status: hasKhatianRecord ? 'verified' : 'missing',
      desc_bn: 'সিএস/আরএস/বিএস রেকর্ডে দাগ নম্বর ও রেকর্ডীয় মালিকের উপস্থিতি।',
      desc_en: 'Presence of dag number and recorded owner in CS/RS/BS records.',
      icon: <Layers className="w-5 h-5" />
    },
    {
      title_bn: 'নামজারি ও জমাভাগ (মিউটেশন)',
      title_en: 'Mutation & Dakhila Clearance',
      status: hasMutationRecord ? 'verified' : 'warning',
      desc_bn: 'তহশিল অফিস কর্তৃক হালনাগাদ খারিজ খতিয়ান ও খাজনা পরিশোধের প্রমাণ।',
      desc_en: 'Updated mutation khatian and land revenue tax clearance.',
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      title_bn: 'জমির পরিমাণের সামঞ্জস্য (Area Check)',
      title_en: 'Area Discrepancy Evaluation',
      status: isAreaConsistent ? 'verified' : 'warning',
      desc_bn: 'দলিলের তফসিলের সাথে নকশার দাগের রেকর্ডীয় আয়তনের সংগতি।',
      desc_en: 'Comparison of deed schedule area against cadastral plot boundary.',
      icon: <Scale className="w-5 h-5" />
    },
    {
      title_bn: 'মালিকানা ধারাবাহিকতা (Chain Continuity)',
      title_en: 'Chain of Title Continuity',
      status: isLineageConsistent ? 'verified' : 'warning',
      desc_bn: 'পূর্ববর্তী বিক্রেতা থেকে বর্তমান গ্রহীতার বায়া দলিলের নিরবচ্ছিন্নতা।',
      desc_en: 'Unbroken chain of parent deeds from initial owner to current deed.',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      title_bn: 'তারিখ ও রেজিস্ট্রেশনের সময় সঙ্গতি',
      title_en: 'Execution & Temporal Coherence',
      status: isDateValid ? 'verified' : 'warning',
      desc_bn: 'দলিল সম্পাদন এবং সাব-রেজিস্ট্রিতে কার্যকারিতার তারিখের স্বাভাবিকতা।',
      desc_en: 'Normal temporal lapse between deed execution and registry stamp.',
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  const verifiedCount = items.filter(i => i.status === 'verified').length;
  const totalCount = items.length;
  const readinessPercent = Math.round((verifiedCount / totalCount) * 100);

  return (
    <Card className="p-6 md:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
      {/* Title & Readiness Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            {isBn ? "স্মার্ট ডকুমেন্ট প্রস্তুতি চেকলিস্ট" : "Smart Document Readiness Checklist"}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {isBn ? "দলিল ও প্রমাণপত্রের সম্পূর্ণতা" : "Evidence Completeness Breakdown"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            আইডি: <span className="font-mono font-semibold">{transactionId}</span>
          </p>
        </div>

        {/* Readiness Meter (Explicitly NOT a legal confidence score) */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">নথিপত্র প্রস্তুত:</span>
            <span className="text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
              {readinessPercent}% ({verifiedCount}/{totalCount})
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 flex items-center justify-center font-mono font-bold text-xs text-emerald-900 dark:text-emerald-300">
            {verifiedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
              item.status === 'verified'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              item.status === 'verified'
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
            }`}>
              {item.status === 'verified' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isBn ? item.title_bn : item.title_en}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'verified'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                }`}>
                  {item.status === 'verified' ? (isBn ? 'উপলব্ধ' : 'Verified') : (isBn ? 'যাচাই বাকি' : 'Needs Check')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn ? item.desc_bn : item.desc_en}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Seller Frequency / Repeated Transaction Indicator */}
      {sellerRepeatCount && sellerRepeatCount > 1 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "একই বিক্রেতার সাম্প্রতিক লেনদেন সংখ্যা:" : "Seller Recent Transaction Count:"}</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
            {sellerRepeatCount} {isBn ? "টি লেনদেন" : "transactions"}
          </span>
        </div>
      )}

      {/* Non-legal Disclaimer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isBn
            ? "⚠️ চেকলিস্ট সম্পূর্ণতার শতকরা হার নথিপত্রের উপস্থিতি নির্দেশ করে, এটি কোনো আইনি স্বত্ব (Legal Ownership) প্রত্যয়ন নয়।"
            : "⚠️ Readiness percentage reflects document presence, not a legal guarantee of land ownership title."}
        </p>
      </div>
    </Card>
  );
};
