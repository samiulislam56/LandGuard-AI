import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  GitCompare, 
  BookOpen, 
  Calendar, 
  ExternalLink
} from 'lucide-react';
import { Card } from '../ui/Card';

interface Transaction {
  transaction_id: string;
  deed_date?: string;
  amount_bdt?: number;
  area_acres?: number;
  seller_id?: string;
  buyer_id?: string;
  scenario?: string;
  overlapping_claim?: number;
  mutation_status?: string;
}

interface StoryStep {
  date: string;
  title: string;
  desc: string;
  type: 'neutral' | 'warning' | 'success';
}

interface Props {
  parcelId: string;
  transactions: Transaction[];
}

export const TransactionComparisonStory: React.FC<Props> = ({ parcelId, transactions }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const tx1Id = transactions[0]?.transaction_id || '';
  const tx2Id = transactions[1]?.transaction_id || transactions[0]?.transaction_id || '';

  const [selectedTx1, setSelectedTx1] = useState<string>(tx1Id);
  const [selectedTx2, setSelectedTx2] = useState<string>(tx2Id);

  const txA = transactions.find(t => t.transaction_id === selectedTx1) || transactions[0];
  const txB = transactions.find(t => t.transaction_id === selectedTx2) || transactions[1] || transactions[0];

  // Storyline generator grounded in actual transaction fields
  const generateStoryline = (): StoryStep[] => {
    if (!transactions || transactions.length === 0) {
      return [{
        date: 'N/A',
        title: isBn ? 'কোনো লেনদেন নেই' : 'No Transactions',
        desc: isBn ? 'এই পার্সেলে কোনো লেনদেন নথিভুক্ত পাওয়া যায়নি।' : 'No transactions recorded for this parcel.',
        type: 'neutral'
      }];
    }

    const storySteps: StoryStep[] = [];

    // Chronological order by deed_date
    const sorted = [...transactions].sort((a, b) => (a.deed_date || '').localeCompare(b.deed_date || ''));

    sorted.forEach((tx, idx) => {
      const isConflict = tx.scenario === 'conflicting_sale' || tx.overlapping_claim === 1;
      const isMutationMismatch = tx.scenario === 'mutation_mismatch';

      if (idx === 0) {
        storySteps.push({
          date: tx.deed_date || 'প্রাথমিক তারিখ',
          title: isBn ? `১ম দলিল (${tx.transaction_id}) সম্পাদন` : `First Deed (${tx.transaction_id}) Executed`,
          desc: isBn
            ? `প্রাথমিক পর্যায়ে ${tx.area_acres || '০.৫৫'} একর জমির হস্তান্তর দলিল সাব-রেজিস্ট্রি অফিসে নথিভুক্ত হয়। মূল্যের পরিমাণ প্রায় ৳${tx.amount_bdt?.toLocaleString() || '২৫,০০,০০০'}।`
            : `Initial deed registered for ${tx.area_acres || '0.55'} acres with registered valuation of approximately ৳${tx.amount_bdt?.toLocaleString() || '2,500,000'}.`,
          type: 'neutral'
        });
      } else {
        storySteps.push({
          date: tx.deed_date || 'পরবর্তী তারিখ',
          title: isBn ? `পরবর্তী দলিল (${tx.transaction_id}) সম্পাদন` : `Subsequent Deed (${tx.transaction_id}) Registered`,
          desc: isConflict
            ? (isBn 
                ? `সতর্কতা: পূর্বের হস্তান্তরের নামজারি বা খাজনা রেকর্ড নিষ্পত্তি হওয়ার পূর্বেই একই খতিয়ান বা দাগে অপর একটি হস্তান্তর দলিল (${tx.transaction_id}) রেজিস্ট্রি করা হয়। এটি দ্বৈত বিক্রয় বা স্বত্ব সংঘাতের সংকেত দেয়।`
                : `Warning: A subsequent deed (${tx.transaction_id}) was registered on the same plot before prior mutation was settled, signaling overlapping claims.`)
            : isMutationMismatch
            ? (isBn
                ? `নামজারি ব্যবধান: এই দলিলের আয়তন বা বিক্রেতার তথ্যে খতিয়ানের সাথে গরমিল দেখা যায়।`
                : `Mutation discrepancy: Area or party details mismatch the registered khatian.`)
            : (isBn
                ? `স্বাভাবিক পুনর্বিক্রয়: পূর্ববর্তী গ্রহীতার হালনাগাদ খারিজের পর নিয়মিত হস্তান্তর নথিভুক্ত হয়।`
                : `Legitimate resale: Regular transfer registered following mutation clearance.`),
          type: isConflict ? 'warning' : 'success'
        });
      }
    });

    return storySteps;
  };

  const stories = generateStoryline();

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. এই জমির নথিতে কী ঘটেছে? (Land Story Guided Narrative)                */}
      {/* ========================================================================= */}
      <Card className="p-6 md:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              {isBn ? "জমির ইতিহাস আখ্যান" : "Guided Narrative"} &bull; {parcelId}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isBn ? "এই জমির নথিতে কী ঘটেছে?" : "What Happened in this Land's Record?"}
            </h2>
          </div>
        </div>

        {/* Chronological Timeline Narrative */}
        <div className="space-y-4">
          {stories.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step.type === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-2 border-amber-500'
                    : step.type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < stories.length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700 my-1" />
                )}
              </div>

              <div className={`flex-1 p-4 rounded-2xl border ${
                step.type === 'warning'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {step.date}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 2. Side-by-Side Transaction Comparison                                   */}
      {/* ========================================================================= */}
      {transactions.length >= 2 && (
        <Card className="p-6 md:p-8 bg-white dark:bg-slate-800 border-emerald-800/20 rounded-3xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-2xl">
                <GitCompare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {isBn ? "পাশাপাশি লেনদেন তুলনা" : "Side-by-Side Comparison"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {isBn ? "দুটি দলিলের পারস্পরিক বিশ্লেষণ" : "Compare Two Deeds Side-by-Side"}
                </h3>
              </div>
            </div>

            {/* Selectors for comparison */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedTx1}
                onChange={(e) => setSelectedTx1(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold"
              >
                {transactions.map(t => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    দলিল ১: {t.transaction_id}
                  </option>
                ))}
              </select>

              <span className="text-xs font-bold text-slate-400">vs</span>

              <select
                value={selectedTx2}
                onChange={(e) => setSelectedTx2(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold"
              >
                {transactions.map(t => (
                  <option key={t.transaction_id} value={t.transaction_id}>
                    দলিল ২: {t.transaction_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          {txA && txB && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
                    <th className="p-3 text-slate-500 font-bold uppercase tracking-wider">তুলনার বিষয় (Attribute)</th>
                    <th className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{txA.transaction_id}</th>
                    <th className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{txB.transaction_id}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">দলিলের তারিখ (Deed Date)</td>
                    <td className="p-3 font-mono">{txA.deed_date || 'N/A'}</td>
                    <td className="p-3 font-mono">{txB.deed_date || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">ঘোষিত জমির পরিমাণ (Area)</td>
                    <td className="p-3 font-mono">{txA.area_acres ?? 0.55} একর</td>
                    <td className="p-3 font-mono">{txB.area_acres ?? 0.55} একর</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">রেজিস্ট্রিকৃত মূল্য (Value BDT)</td>
                    <td className="p-3 font-mono">৳{txA.amount_bdt?.toLocaleString() || '২৫,০০,০০০'}</td>
                    <td className="p-3 font-mono">৳{txB.amount_bdt?.toLocaleString() || '৩০,০০,০০০'}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">স্বত্ব সংঘাত বা ওভারল্যাপ</td>
                    <td className="p-3">
                      {txA.scenario === 'conflicting_sale' || txA.overlapping_claim === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          সংঘাত সংকেত
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          স্বাভাবিক
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {txB.scenario === 'conflicting_sale' || txB.overlapping_claim === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                          সংঘাত সংকেত
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          স্বাভাবিক
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">কার্যক্রম (Action)</td>
                    <td className="p-3">
                      <Link to={`/assess/${txA.transaction_id}`} className="text-emerald-600 hover:underline font-bold flex items-center gap-1">
                        <span>মূল্যায়ন দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="p-3">
                      <Link to={`/assess/${txB.transaction_id}`} className="text-emerald-600 hover:underline font-bold flex items-center gap-1">
                        <span>মূল্যায়ন দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
