import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  HelpCircle, 
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HelpGlossaryPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const glossaryItems = [
    {
      term_bn: "দাগ নম্বর (Dag Number)",
      term_en: "Dag / Plot Number",
      def_bn: "ভূমি জরিপের সময় কোনো মৌজার অন্তর্গত নির্দিষ্ট একটি জমি বা প্লটের সীমানা চিহ্নিত করে যে পৃথক পরিচিতি নম্বর দেওয়া হয়, তাকে দাগ নম্বর বলে।",
      def_en: "A distinct numerical identifier assigned to a specific parcel of land within a Mouza during cadastral land surveys."
    },
    {
      term_bn: "খতিয়ান / পরচা (Khatian / RoR)",
      term_en: "Record of Rights (Khatian)",
      def_bn: "সরকারি রাজস্ব রেকর্ডে এক বা একাধিক দাগের জমির মালিকানা স্বত্ব, পরিমাণ এবং প্রদেয় খাজনার বিবরণ সম্বলিত সরকারি নথিপত্রকে খতিয়ান বা পরচা বলে। সিএস, এসএ এবং আরএস হলো বিভিন্ন ঐতিহাসিক জরিপের খতিয়ান।",
      def_en: "The official cadastral register of title, holding records of ownership shares, acreage, and revenue liability under CS, SA, or RS surveys."
    },
    {
      term_bn: "নামজারি / খারিজ (Mutation / Namjari)",
      term_en: "Mutation (Namjari)",
      def_bn: "জমি ক্রয়, উত্তরাধিকার বা হেবার মাধ্যমে হস্তান্তরিত হলে সরকারি রাজস্ব রেকর্ডে পূর্বের মালিকের নাম কেটে নতুন ক্রেতা বা ওয়ারিশের নাম অন্তর্ভুক্ত করার আইনি প্রক্রিয়া।",
      def_en: "The official administrative process of mutating the revenue ledger to replace the transferor with the transferee following a conveyance deed."
    },
    {
      term_bn: "RMD ত্রিভুজ অডিট",
      term_en: "RMD Triangulation Audit",
      def_bn: "খতিয়ান (Record of Rights), নামজারি (Mutation) এবং রেজিস্ট্রি দলিলের (Deed) পারস্পরিক ধারাবাহিকতা যাচাই। এর মাধ্যমে নিশ্চিত করা হয় যে বিক্রেতার প্রকৃত খতিয়ান স্বত্ব আছে এবং দলিলের পর নামজারি সম্পূর্ণ হয়েছে।",
      def_en: "Cross-verification audit across Khatian ownership, Mutation registration, and transfer Deed to eliminate double-selling conflicts."
    },
    {
      term_bn: "বায়া দলিল (Lineage / Parent Deed)",
      term_en: "Chain of Title (Parent Deed)",
      def_bn: "বর্তমান বিক্রেতার পূর্বে জমিটি কীভাবে কার কাছ থেকে হস্তান্তরিত হয়ে এসেছে, সেই ধারাবাহিক পূর্ববর্তী দলিলসমূহকে বায়া দলিল বলে।",
      def_en: "Historical antecedent conveyances establishing the unbroken root and continuous chain of title leading to the current seller."
    },
    {
      term_bn: "মৌজা ও জেএল নম্বর (Mouza & JL No)",
      term_en: "Mouza & Jurisdiction List (JL) Number",
      def_bn: "ভূমি রাজস্ব প্রশাসনের সর্বনিম্ন ভৌগোলিক বা জরিপ একক হলো মৌজা। প্রতিটি থানায় প্রতিটি মৌজার একটি নির্দিষ্ট ক্রমিক সংখ্যা থাকে যাকে জেএল (Jurisdiction List) নম্বর বলে।",
      def_en: "The lowest geographical survey unit in revenue administration, identified by an official Jurisdiction List (JL) index number."
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-emerald-900/10 dark:border-emerald-500/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {isBn ? "সহায়তা ও নির্দেশিকা" : "Guidance & Glossary"}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
          {isBn ? "ভূমি পরিভাষা কোষ ও নাগরিক সহায়িকা" : "Land Terminology Glossary & Help"}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1">
          {isBn 
            ? "জমির খতিয়ান, দাগ, নামজারি ও দলিলের মৌলিক পরিভাষাসমূহ সাধারণ মানুষের জন্য সহজ ভাষায় ব্যাখ্যা"
            : "Plain-language explanations of essential Bangladesh cadastral and title terminology."}
        </p>
      </div>

      {/* Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {glossaryItems.map((item, idx) => (
          <Card key={idx} className="p-5 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:border-emerald-500/40 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              {isBn ? item.term_bn : item.term_en}
            </h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn ? item.def_bn : item.def_en}
            </p>
          </Card>
        ))}
      </div>

      {/* Need Help Banner */}
      <Card className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {isBn ? "আরও প্রশ্ন আছে?" : "Have More Questions?"}
            </h4>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {isBn 
                ? "স্ক্রিনের নিচে ডানপাশে ‘AI সহকারী’ বাটনে ক্লিক করে সরাসরি সহজ বাংলায় প্রশ্ন করুন।"
                : "Click the floating 'AI Copilot' button in the bottom right corner for immediate assistance."}
            </p>
          </div>
        </div>

        <Link to="/search">
          <Button variant="primary" size="sm" className="gap-2 bg-emerald-700 hover:bg-emerald-800">
            {isBn ? "জমি খুঁজুন" : "Search Land"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
};
