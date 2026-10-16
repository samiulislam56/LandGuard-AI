import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Search, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Scale,
  Compass
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface DivisionData {
  name_bn: string;
  name_en: string;
  districts: {
    id: string;
    name_bn: string;
    name_en: string;
    hasSyntheticData: boolean;
    upazilas?: Array<{
      name_bn: string;
      name_en: string;
      mouzas: Array<{ name_bn: string; name_en: string; jl_no: string }>;
    }>;
  }[];
}

const GEO_HIERARCHY: Record<string, DivisionData> = {
  dhaka: {
    name_bn: "ঢাকা বিভাগ",
    name_en: "Dhaka Division",
    districts: [
      {
        id: "Dhaka",
        name_bn: "ঢাকা",
        name_en: "Dhaka",
        hasSyntheticData: true,
        upazilas: [
          {
            name_bn: "সাভার",
            name_en: "Savar",
            mouzas: [{ name_bn: "আমিনবাজার", name_en: "Aminbazar", jl_no: "45" }]
          }
        ]
      },
      { id: "Gazipur", name_bn: "গাজীপুর", name_en: "Gazipur", hasSyntheticData: false },
      { id: "Narayanganj", name_bn: "নারায়ণগঞ্জ", name_en: "Narayanganj", hasSyntheticData: false }
    ]
  },
  chattogram: {
    name_bn: "চট্টগ্রাম বিভাগ",
    name_en: "Chattogram Division",
    districts: [
      {
        id: "Chattogram",
        name_bn: "চট্টগ্রাম",
        name_en: "Chattogram",
        hasSyntheticData: true,
        upazilas: [
          {
            name_bn: "পাহাড়তলী",
            name_en: "Pahartali",
            mouzas: [{ name_bn: "উত্তর কাট্টলী", name_en: "North Kattali", jl_no: "12" }]
          }
        ]
      },
      { id: "Coxsbazar", name_bn: "কক্সবাজার", name_en: "Cox's Bazar", hasSyntheticData: false },
      { id: "Cumilla", name_bn: "কুমিল্লা", name_en: "Cumilla", hasSyntheticData: false }
    ]
  },
  rajshahi: {
    name_bn: "রাজশাহী বিভাগ",
    name_en: "Rajshahi Division",
    districts: [
      {
        id: "Rajshahi",
        name_bn: "রাজশাহী",
        name_en: "Rajshahi",
        hasSyntheticData: true,
        upazilas: [
          {
            name_bn: "পবা",
            name_en: "Paba",
            mouzas: [{ name_bn: "নওহাটা", name_en: "Nowhata", jl_no: "08" }]
          }
        ]
      },
      { id: "Bogura", name_bn: "বগুড়া", name_en: "Bogura", hasSyntheticData: false },
      { id: "Pabna", name_bn: "পাবনা", name_en: "Pabna", hasSyntheticData: false }
    ]
  },
  khulna: {
    name_bn: "খুলনা বিভাগ",
    name_en: "Khulna Division",
    districts: [
      {
        id: "Khulna",
        name_bn: "খুলনা",
        name_en: "Khulna",
        hasSyntheticData: true,
        upazilas: [
          {
            name_bn: "রূপসা",
            name_en: "Rupsha",
            mouzas: [{ name_bn: "নৈহাটি", name_en: "Naihati", jl_no: "23" }]
          }
        ]
      },
      { id: "Jashore", name_bn: "যশোর", name_en: "Jashore", hasSyntheticData: false },
      { id: "Satkhira", name_bn: "সাতক্ষীরা", name_en: "Satkhira", hasSyntheticData: false }
    ]
  },
  barishal: {
    name_bn: "বরিশাল বিভাগ",
    name_en: "Barishal Division",
    districts: [{ id: "Barishal", name_bn: "বরিশাল", name_en: "Barishal", hasSyntheticData: false }]
  },
  sylhet: {
    name_bn: "সিলেট বিভাগ",
    name_en: "Sylhet Division",
    districts: [{ id: "Sylhet", name_bn: "সিলেট", name_en: "Sylhet", hasSyntheticData: false }]
  },
  rangpur: {
    name_bn: "রংপুর বিভাগ",
    name_en: "Rangpur Division",
    districts: [{ id: "Rangpur", name_bn: "রংপুর", name_en: "Rangpur", hasSyntheticData: false }]
  },
  mymensingh: {
    name_bn: "ময়মনসিংহ বিভাগ",
    name_en: "Mymensingh Division",
    districts: [{ id: "Mymensingh", name_bn: "ময়মনসিংহ", name_en: "Mymensingh", hasSyntheticData: false }]
  }
};

// Demo quick search examples
const DEMO_PARCEL_SAMPLES = [
  { parcel_id: "PARCEL-002911", district: "Dhaka", upazila: "Savar", mouza: "Aminbazar", dag_no: "102", khatian_no: "KH-102", total_area_acres: 0.55, scenario: "conflicting_sale" },
  { parcel_id: "PARCEL-000104", district: "Chattogram", upazila: "Pahartali", mouza: "North Kattali", dag_no: "205", khatian_no: "KH-205", total_area_acres: 0.82, scenario: "clean" },
  { parcel_id: "PARCEL-001420", district: "Rajshahi", upazila: "Paba", mouza: "Nowhata", dag_no: "310", khatian_no: "KH-310", total_area_acres: 1.15, scenario: "mutation_mismatch" },
  { parcel_id: "PARCEL-000850", district: "Khulna", upazila: "Rupsha", mouza: "Naihati", dag_no: "418", khatian_no: "KH-418", total_area_acres: 0.40, scenario: "area_mismatch" }
];

export const SearchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [division, setDivision] = useState<string>('dhaka');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [upazila, setUpazila] = useState<string>('Savar');
  const [mouza, setMouza] = useState<string>('Aminbazar');
  const [identifier, setIdentifier] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const selectedDivisionData = GEO_HIERARCHY[division];
  const availableDistricts = selectedDivisionData?.districts || [];
  const selectedDistrictData = availableDistricts.find(d => d.id === district);
  const isDistrictSupported = selectedDistrictData?.hasSyntheticData ?? false;

  const handleDivisionChange = (divKey: string) => {
    setDivision(divKey);
    const firstDist = GEO_HIERARCHY[divKey]?.districts[0]?.id || '';
    setDistrict(firstDist);
    setUpazila('');
    setMouza('');
  };

  const handleReset = () => {
    setDivision('dhaka');
    setDistrict('Dhaka');
    setUpazila('Savar');
    setMouza('Aminbazar');
    setIdentifier('');
    setHasSearched(false);
  };

  const filteredResults = useMemo(() => {
    if (!hasSearched) return [];
    if (!isDistrictSupported) return [];

    return DEMO_PARCEL_SAMPLES.filter(sample => {
      const matchDistrict = !district || sample.district.toLowerCase() === district.toLowerCase();
      if (!identifier.trim()) return matchDistrict;

      const q = identifier.trim().toLowerCase();
      return (
        sample.parcel_id.toLowerCase().includes(q) ||
        sample.dag_no.toLowerCase().includes(q) ||
        sample.khatian_no.toLowerCase().includes(q)
      );
    });
  }, [hasSearched, isDistrictSupported, district, identifier]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-emerald-900/10 dark:border-emerald-500/20 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            {isBn ? "সহজ ভূমি তথ্য সেবা" : "Citizen Land Service"}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
          {t('search.title', 'সহজ জমি অনুসন্ধান')}
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1">
          {t('search.subtitle', 'বিভাগ, জেলা ও দাগ বা খতিয়ান নম্বর নির্বাচন করে জমির তথ্য অনুসন্ধান করুন')}
        </p>
      </div>

      {/* Cascading Search Card (Reference 1 Style) */}
      <Card className="p-6 md:p-8 bg-white dark:bg-slate-800 border-emerald-800/10 dark:border-emerald-500/20 shadow-md rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setHasSearched(true);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Division Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('search.divisionLabel', 'বিভাগ নির্বাচন করুন')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                {Object.entries(GEO_HIERARCHY).map(([key, div]) => (
                  <option key={key} value={key}>
                    {isBn ? div.name_bn : div.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('search.districtLabel', 'জেলা নির্বাচন করুন')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isBn ? d.name_bn : d.name_en} {d.hasSyntheticData ? (isBn ? "(উপলব্ধ)" : "(Available)") : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Upazila */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('search.upazilaLabel', 'উপজেলা')}
              </label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder={isBn ? "যেমন: সাভার" : "e.g. Savar"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* 4. Mouza */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('search.mouzaLabel', 'মৌজা ও জেএল')}
              </label>
              <input
                type="text"
                value={mouza}
                onChange={(e) => setMouza(e.target.value)}
                placeholder={isBn ? "যেমন: আমিনবাজার (JL 45)" : "e.g. Aminbazar (JL 45)"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Identifier Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('search.identifierLabel', 'দাগ নম্বর / খতিয়ান নম্বর / পার্সেল আইডি')}
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('search.placeholderIdentifier', 'যেমন: 102, KH-102, বা PARCEL-002911')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('search.coverageNotice', 'এই ডেমোটিতে ঢাকা, চট্টগ্রাম, রাজশাহী এবং খুলনা জেলার ৩,০০০ সিন্থেটিক পার্সেল সংরক্ষিত রয়েছে।')}</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                {t('search.resetBtn', 'রিসেট')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-6 py-2.5 gap-2 bg-emerald-700 hover:bg-emerald-800"
              >
                <Search className="w-4 h-4" />
                {t('search.submitBtn', 'খুঁজুন')}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* District Boundary Notice if unsupported district selected */}
      {!isDistrictSupported && hasSearched && (
        <Card className="p-6 border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base">
                {isBn ? "নির্বাচিত জেলার জন্য সিন্থেটিক রেকর্ড সংরক্ষিত নেই" : "No Synthetic Records for Selected District"}
              </h3>
              <p className="text-sm mt-1 text-amber-800 dark:text-amber-300">
                {t('search.unsupportedDistrict', 'নির্বাচিত জেলার জন্য বর্তমানে কোনো সিন্থেটিক রেকর্ড সংরক্ষিত নেই। ডেমো পরীক্ষার জন্য ঢাকা, চট্টগ্রাম, রাজশাহী বা খুলনা জেলা নির্বাচন করুন।')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDivision('dhaka'); setDistrict('Dhaka'); }}>
                  {isBn ? "ঢাকা জেলা দেখুন" : "View Dhaka"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setDivision('chattogram'); setDistrict('Chattogram'); }}>
                  {isBn ? "চট্টগ্রাম জেলা দেখুন" : "View Chattogram"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setDivision('rajshahi'); setDistrict('Rajshahi'); }}>
                  {isBn ? "রাজশাহী জেলা দেখুন" : "View Rajshahi"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setDivision('khulna'); setDistrict('Khulna'); }}>
                  {isBn ? "খুলনা জেলা দেখুন" : "View Khulna"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && isDistrictSupported && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {isBn ? "উপলব্ধ সিন্থেটিক পার্সেলসমূহ" : "Available Synthetic Parcels"}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {filteredResults.length} {isBn ? "টি পাওয়া গেছে" : "found"}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResults.map((p) => (
              <Card key={p.parcel_id} className="p-5 hover:border-emerald-500/50 transition-all bg-white dark:bg-slate-800 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                        {p.parcel_id}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {p.district} • {p.upazila}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {isBn ? "দাগ নং:" : "Dag No:"} {p.dag_no} • {isBn ? "খতিয়ান:" : "Khatian:"} {p.khatian_no}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {isBn ? "মৌজা:" : "Mouza:"} {p.mouza} • {isBn ? "জমির পরিমাণ:" : "Area:"} <span className="font-semibold text-slate-800 dark:text-slate-200">{p.total_area_acres} {isBn ? "একর" : "acres"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
                  <Link to={`/khasra-map?parcel=${p.parcel_id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      {isBn ? "খসড়া ম্যাপ" : "Khasra Map"}
                    </Button>
                  </Link>
                  <Link to={`/rmd?tx=TX-002911-2`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1 text-emerald-700 border-emerald-300">
                      <Scale className="w-3.5 h-3.5" />
                      {isBn ? "RMD অডিট" : "RMD Audit"}
                    </Button>
                  </Link>
                  <Link to={`/parcels/${p.parcel_id}`}>
                    <Button variant="primary" size="sm" className="text-xs gap-1 ml-auto">
                      {isBn ? "বিস্তারিত ইতিহাস" : "History"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
