import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileQuestion, 
  Cpu, 
  ChevronDown, 
  ChevronUp,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { Card } from '../ui/Card';

interface AssessmentData {
  transaction_id: string;
  as_of_date?: string;
  final_status: string;
  random_forest?: {
    prediction?: string;
    risk_score?: number;
    risk_probability?: number;
    top_features?: Array<{ feature: string; importance: number }>;
  };
  isolation_forest?: {
    status?: string;
    decision_score?: number;
    is_anomaly?: boolean;
  };
  evidence_verification?: {
    status?: string;
    findings?: string[];
    warnings?: string[];
    rule_counts?: Record<string, number>;
  };
}

export const UnderstandMyResult: React.FC<{ assessment: AssessmentData }> = ({ assessment }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [showTechnical, setShowTechnical] = useState(false);

  const finalStatus = assessment.final_status || 'NO_REVIEW_FLAG_DETECTED';
  const findings = assessment.evidence_verification?.findings || [];
  const warnings = assessment.evidence_verification?.warnings || [];

  // Plain-Language Status Mapping
  let statusTitleBn = 'বিশেষ অসংগতি পাওয়া যায়নি';
  let statusTitleEn = 'No Visible Anomaly Detected';
  let statusBadgeColor = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
  let icon = <CheckCircle2 className="w-8 h-8 text-emerald-600" />;

  if (finalStatus === 'REVIEW_REQUIRED') {
    statusTitleBn = 'পর্যালোচনা প্রয়োজন';
    statusTitleEn = 'Review Required';
    statusBadgeColor = 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200';
    icon = <AlertTriangle className="w-8 h-8 text-amber-600" />;
  } else if (finalStatus === 'INSUFFICIENT_EVIDENCE') {
    statusTitleBn = 'প্রয়োজনীয় তথ্য অসম্পূর্ণ';
    statusTitleEn = 'Insufficient Evidence';
    statusBadgeColor = 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200';
    icon = <FileQuestion className="w-8 h-8 text-sky-600" />;
  } else if (finalStatus === 'PENDING_DATE_VERIFICATION') {
    statusTitleBn = 'তারিখ যাচাই প্রয়োজন';
    statusTitleEn = 'Pending Date Verification';
    statusBadgeColor = 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200';
    icon = <CalendarCheck className="w-8 h-8 text-purple-600" />;
  }

  // Plain-Language Section Content
  const getWhyExplanation = () => {
    if (finalStatus === 'REVIEW_REQUIRED') {
      return isBn
        ? 'এই দলিলের সাথে সংযুক্ত খতিয়ানের মালিকানা তথ্যের অমিল পাওয়া গেছে অথবা পূর্ববর্তী বিক্রেতার নামজারির ধারাবাহিকতায় ব্যত্যয় ঘটেছে।'
        : 'Discrepancies found between the deed details and recorded ownership, or broken continuity in the seller mutation timeline.';
    }
    if (finalStatus === 'INSUFFICIENT_EVIDENCE') {
      return isBn
        ? 'দলিলটির চূড়ান্ত স্ক্রিনিংয়ের জন্য প্রয়োজনীয় সহায়ক বায়া দলিল অথবা সরকারি খতিয়ানের ডিজিটাল রেকর্ড এখনো সংযুক্ত হয়নি।'
        : 'Crucial chain deeds or digital cadastral records are missing, preventing definitive verification.';
    }
    if (finalStatus === 'PENDING_DATE_VERIFICATION') {
      return isBn
        ? 'দলিল সম্পাদনের তারিখ এবং রেজিস্ট্রেশন কার্যকারিতার তারিখের মধ্যে ঐতিহাসিক সময়ের দূরত্ব পুনর্যাচাই প্রয়োজন।'
        : 'The deed execution and registration dates require temporal re-verification against baseline records.';
    }
    return isBn
      ? 'প্রদত্ত সিন্থেটিক তথ্য অনুযায়ী দলিলের মালিকানা চেইন, জমির পরিমাণ এবং খতিয়ান রেকর্ডে কোনো পরিচিত ঝুঁকি সংকেত পাওয়া যায়নি।'
      : 'All tested attributes align with recorded cadastral ownership and transaction lineage.';
  };

  const getWhatMismatched = () => {
    if (findings.length > 0) {
      return findings;
    }
    if (finalStatus === 'REVIEW_REQUIRED') {
      return [
        isBn ? 'দলিলের বিক্রেতার সাথে খতিয়ানের পূর্বের মালিকের নামের অমিল' : 'Seller name differs from recorded previous owner',
        isBn ? 'বিক্রীত জমির পরিমাণের সাথে খতিয়ানের অবশিষ্ট অংশের পার্থক্য' : 'Declared deed area differs from remaining recorded plot area'
      ];
    }
    return [isBn ? 'কোনো তাৎপর্যপূর্ণ অমিল পাওয়া যায়নি।' : 'No significant mismatch identified.'];
  };

  const getNextActions = () => {
    if (finalStatus === 'REVIEW_REQUIRED') {
      return [
        isBn ? 'সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিস থেকে বায়া দলিলের অবিকল নকল (Certified Copy) সংগ্রহ করুন।' : 'Obtain a certified copy of the parent deed from the sub-registry office.',
        isBn ? 'সহকারী কমিশনার (ভূমি) বা তহশিল অফিসে গিয়ে সর্বশেষ নামজারি ও জমাভাগ খতিয়ান নিশ্চিত করুন।' : 'Verify the latest mutation khatian at the local AC (Land) office.',
        isBn ? 'আইনজীবী বা অভিজ্ঞ দলিল লেখকের মাধ্যমে দলিলের তফসিল ও দাগ নম্বর পুঙ্খানুপুঙ্খ যাচাই করুন।' : 'Consult a legal deed specialist to cross-check the property schedule.'
      ];
    }
    if (finalStatus === 'INSUFFICIENT_EVIDENCE') {
      return [
        isBn ? 'মূল দলিলের স্পষ্ট কপি এবং সর্বশেষ দাখিলা (খাজনার রসিদ) স্ক্যান করে আপলোড করুন।' : 'Upload clear copies of the registered deed and up-to-date land tax receipts.',
        isBn ? 'উপজেলা ভূমি অফিস থেকে সিএস, আরএস ও বিএস পর্চা সংগ্রহ করে চেইন সম্পূর্ণ করুন।' : 'Obtain CS, RS, and BS porchas from the Upazila Land Office to verify lineage.'
      ];
    }
    return [
      isBn ? 'সর্বশেষ বছরের ভূমি উন্নয়ন কর (খাজনা) পরিশোধিত আছে কি না পরীক্ষা করুন।' : 'Ensure up-to-date land development tax receipts are verified.',
      isBn ? 'জমির দখল ও প্রকৃত অবস্থান সরেজমিনে প্রত্যক্ষ করুন।' : 'Perform on-site physical possession and boundary inspection.'
    ];
  };

  return (
    <Card className="p-6 md:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
      {/* 1. Header & Primary Plain-Language Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-700/60 rounded-2xl shrink-0">
            {icon}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              {isBn ? "সহজ ভাষায় এআই স্ক্রিনিং ফলাফল" : "Understand My Result"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {isBn ? statusTitleBn : statusTitleEn}
            </h2>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-2xl border text-sm font-bold flex items-center gap-2 self-start sm:self-auto ${statusBadgeColor}`}>
          <span className="font-mono text-xs">{finalStatus}</span>
        </div>
      </div>

      {/* 2. কেন এই ফলাফল এসেছে? (Why this result?) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? "১. কেন এই ফলাফল এসেছে?" : "1. Why did this result occur?"}</span>
        </h3>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          {getWhyExplanation()}
        </p>
      </div>

      {/* 3. কোন তথ্য মেলেনি বা সতর্ক সংকেত? */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>{isBn ? "২. কোন তথ্য মেলেনি বা অসম্পূর্ণ?" : "2. What information mismatched or was incomplete?"}</span>
        </h3>
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 space-y-2">
          {getWhatMismatched().map((msg, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. এরপর কী করবেন? (Next Citizen Actions) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? "৩. নাগরিক হিসেবে এরপর কী করবেন?" : "3. What should you do next?"}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {getNextActions().map((action, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex flex-col justify-between">
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">পদক্ষেপ {idx + 1}:</span>
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. বিস্তারিত প্রযুক্তিগত ব্যাখ্যা (Technical Expandable Drawer) */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? "৪. বিস্তারিত প্রযুক্তিগত ব্যাখ্যা (মেশিন লার্নিং মেট্রিক্স)" : "4. Technical Explainability (Machine Learning Metrics)"}</span>
          </span>
          {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnical && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs space-y-3 border border-emerald-800/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Random Forest Risk Estimate:</span>
                <span className="text-sm font-bold text-white">
                  {assessment.random_forest?.prediction || 'N/A'} (Score: {assessment.random_forest?.risk_score ?? 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Isolation Forest Anomaly Signal:</span>
                <span className="text-sm font-bold text-white">
                  {assessment.isolation_forest?.status || 'N/A'} (Score: {assessment.isolation_forest?.decision_score?.toFixed(4) ?? 'N/A'})
                </span>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Heuristic Rule Warnings:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Synthetic Disclaimer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isBn
            ? "⚠️ দ্রষ্টব্য: এটি একটি কৃত্রিম সিন্থেটিক স্ক্রিনিং মডেল। এটি কোনো আদালতের রায়, সরকারি দলিল বা আইনি মালিকানার চূড়ান্ত প্রত্যয়ন নয়।"
            : "⚠️ Notice: This is an automated screening model over synthetic records. It does not constitute legal proof or court verdict."}
        </p>
      </div>
    </Card>
  );
};
