import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  FileText, 
  BookOpen, 
  Search, 
  ShieldAlert, 
  Scale
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const RMDPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [searchParams, setSearchParams] = useSearchParams();
  const txParam = searchParams.get('tx') || 'TX-002911-2';
  const [selectedTx, setSelectedTx] = useState(txParam);

  const { data: audit, isLoading, error } = useQuery({
    queryKey: ['rmd-audit', selectedTx],
    queryFn: () => api.getRMDAudit(selectedTx),
    enabled: Boolean(selectedTx),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RMD_ALIGNED':
        return <Badge variant="success" className="text-sm px-3 py-1 font-medium">{isBn ? "নথি সামঞ্জস্যপূর্ণ" : "Aligned & Consistent"}</Badge>;
      case 'RMD_CHAIN_DISCREPANCY':
        return <Badge variant="danger" className="text-sm px-3 py-1 font-medium">{isBn ? "মালিকানা ধারাবাহিকতায় অসংগতি" : "Chain of Title Discrepancy"}</Badge>;
      case 'RMD_MUTATION_MISSING':
        return <Badge variant="warning" className="text-sm px-3 py-1 font-medium">{isBn ? "নামজারি নথির অসংগতি" : "Mutation Discrepancy"}</Badge>;
      case 'RMD_AREA_OVERCLAIM':
        return <Badge variant="danger" className="text-sm px-3 py-1 font-medium">{isBn ? "জমির পরিমাণ অমিল" : "Area Over-claim"}</Badge>;
      default:
        return <Badge variant="warning" className="text-sm px-3 py-1 font-medium">{isBn ? "পর্যালোচনা প্রয়োজন" : "Review Needed"}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-emerald-900/10 dark:border-emerald-500/20 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {isBn ? "মিশন-ক্রিটিক্যাল ডোমেন মডিউল" : "Domain Triangulation"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Khatian • Namjari • Dalil
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Scale className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
              {t('rmd.title', 'RMD (রেকর্ড-মিউটেশন-দলিল) ত্রিভুজ অডিট')}
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-300">
              {t('rmd.subtitle', 'খতিয়ান (RoR), নামজারি (Mutation) ও রেজিস্ট্রি দলিলের (Deed) পারস্পরিক ধারাবাহিকতা যাচাই')}
            </p>
          </div>

          {/* Quick Transaction Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={selectedTx}
                onChange={(e) => setSelectedTx(e.target.value)}
                placeholder="যেমন: TX-002911-2"
                className="pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-600 w-44"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSearchParams({ tx: selectedTx })}
            >
              {isBn ? "অডিট করুন" : "Audit"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-3" />
          <p className="text-slate-600 dark:text-slate-400">{isBn ? "RMD নথিপত্র অডিট করা হচ্ছে..." : "Loading RMD Triangulation Audit..."}</p>
        </div>
      )}

      {error && (
        <Card className="p-6 border-rose-300 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-semibold">{isBn ? "অডিট তথ্য লোড করা যায়নি" : "Failed to load audit record"}</h3>
              <p className="text-sm mt-0.5">{isBn ? "লেনদেন আইডিটি সঠিক কি না যাচাই করুন।" : "Please check if transaction ID exists."}</p>
            </div>
          </div>
        </Card>
      )}

      {audit && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`p-6 rounded-2xl border ${
            audit.risk_severity === 'HIGH'
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
              : audit.risk_severity === 'MEDIUM'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {getStatusBadge(audit.rmd_status)}
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ID: {audit.transaction_id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {isBn ? audit.rmd_status_bn : audit.rmd_status}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {isBn ? audit.recommendation_bn : "Verification recommended with land revenue authority."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/assess/${audit.transaction_id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileText className="w-4 h-4" />
                    {isBn ? "AI যাচাই দেখুন" : "View Assessment"}
                  </Button>
                </Link>
                <Link to={`/parcels/${audit.parcel_id}`}>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Layers className="w-4 h-4" />
                    {isBn ? "পার্সেল ইতিহাস" : "Parcel History"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Three Pillars Triangulation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Khatian (RoR) */}
            <Card className="p-5 border-t-4 border-t-blue-600 bg-white dark:bg-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {t('rmd.khatianPillar', '১. খতিয়ান (Record of Rights)')}
                  </h3>
                </div>
                <Badge variant="default" className="text-xs">RoR</Badge>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "খতিয়ান নং:" : "Khatian No:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{audit.pillars.khatian.khatian_no || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "দাগ নং:" : "Dag No:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{audit.pillars.khatian.dag_no || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "মোট এলাকা:" : "Recorded Area:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{audit.pillars.khatian.total_area_acres} {isBn ? "একর" : "acres"}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block mb-1">{isBn ? "রেকর্ডীয় মালিকগণ:" : "Recorded Owners:"}</span>
                  <div className="flex flex-wrap gap-1">
                    {audit.pillars.khatian.recorded_owners.length > 0 ? (
                      audit.pillars.khatian.recorded_owners.map((owner, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-mono">
                          {owner}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">{isBn ? "মালিকের নাম অনুপলব্ধ" : "No recorded owners"}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Pillar 2: Registered Deed (Sub-Registry) */}
            <Card className="p-5 border-t-4 border-t-emerald-600 bg-white dark:bg-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {t('rmd.deedPillar', '২. রেজিস্ট্রি দলিল (Sub-Registry Deed)')}
                  </h3>
                </div>
                <Badge variant="success" className="text-xs">Deed</Badge>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "দলিল তারিখ:" : "Date:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{audit.pillars.deed.transaction_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "বিক্রেতা:" : "Seller:"}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                    {audit.pillars.deed.seller_alias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "ক্রেতা:" : "Buyer:"}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                    {audit.pillars.deed.buyer_alias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "হস্তান্তরিত জমি:" : "Sale Area:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{audit.pillars.deed.sale_area_acres} {isBn ? "একর" : "acres"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "রেজিস্ট্রি স্থিতি:" : "Registration:"}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {audit.pillars.deed.registered ? (isBn ? "রেজিস্ট্রিকৃত" : "Registered") : (isBn ? "অনিবন্ধিত" : "Unregistered")}
                  </span>
                </div>
              </div>
            </Card>

            {/* Pillar 3: Mutation (Namjari / Khariz) */}
            <Card className="p-5 border-t-4 border-t-amber-500 bg-white dark:bg-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {t('rmd.mutationPillar', '৩. নামজারি (Khariz / Mutation)')}
                  </h3>
                </div>
                <Badge variant={audit.pillars.mutation.has_mutation ? "default" : "warning"} className="text-xs">
                  {audit.pillars.mutation.has_mutation ? "Mutated" : "Pending"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "নামজারি রেকর্ড:" : "Mutation Records:"}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {audit.pillars.mutation.records_count} {isBn ? "টি কেস" : "cases"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isBn ? "ধারাবাহিকতা:" : "Consistency:"}</span>
                  <span className={`font-medium ${
                    audit.pillars.mutation.consistency === 'CONSISTENT' 
                      ? 'text-emerald-600' 
                      : 'text-amber-600'
                  }`}>
                    {audit.pillars.mutation.consistency === 'CONSISTENT' 
                      ? (isBn ? "সামঞ্জস্যপূর্ণ" : "Consistent") 
                      : (isBn ? "অসংগতি বা অনুপস্থিত" : "Discrepancy / Absent")}
                  </span>
                </div>
                {audit.pillars.mutation.records.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 block mb-1">{isBn ? "অনুমোদিত কেস নম্বর:" : "Case Numbers:"}</span>
                    {audit.pillars.mutation.records.map((m, idx) => (
                      <div key={idx} className="text-xs font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-1.5 rounded mb-1">
                        {m.mutation_id} • {m.status || "FILED"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Triangulation Discrepancies Details */}
          {audit.discrepancies.length > 0 ? (
            <Card className="p-6 bg-white dark:bg-slate-800 shadow-sm border-l-4 border-l-rose-600">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                {isBn ? "শনাক্তকৃত অসংগতি ও ঝুঁকি বিশ্লেষণ" : "Identified Discrepancies & Risk Analysis"}
              </h3>
              <div className="space-y-3">
                {audit.discrepancies.map((disc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold">
                          {disc.pillar}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {disc.code}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {isBn ? disc.message_bn : disc.message_en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">
                {isBn ? "মৌলিক কোনো অসংগতি পাওয়া যায়নি" : "No Fundamental Discrepancies Detected"}
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 max-w-xl mx-auto">
                {isBn 
                  ? "খতিয়ানের রেকর্ডীয় মালিক, রেজিস্ট্রি দলিলের বিক্রেতা এবং নামজারি অনুমোদন সংক্রান্ত তথ্যে প্রাথমিক সামঞ্জস্য পরিলক্ষিত হয়েছে।"
                  : "Baseline alignment verified between recorded ownership, transfer deed, and subsequent mutation."}
              </p>
            </Card>
          )}

          {/* Synthetic Disclaimer */}
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            {audit.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
