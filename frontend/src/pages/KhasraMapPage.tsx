import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Info,
  Scale,
  Box,
  Search,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { CadastralMap } from '../components/gis/CadastralMap';

// Schematic plots layout for Aminbazar Mouza (Inspired by Reference 3 & 4)
interface KhasraPlot {
  dag_no: string;
  khatian_no: string;
  parcel_id: string;
  area_acres: number;
  status: 'clean' | 'conflict' | 'mismatch' | 'review';
  owner: string;
  polygon: string; // SVG path or polygon points
  center: [number, number];
}

const SCHEMATIC_PLOTS: KhasraPlot[] = [
  { dag_no: "101", khatian_no: "KH-101", parcel_id: "LG-P-002910", area_acres: 0.42, status: "clean", owner: "PERSON-0012", polygon: "M 40 40 L 180 30 L 190 150 L 50 160 Z", center: [115, 95] },
  { dag_no: "102", khatian_no: "KH-102", parcel_id: "LG-P-002911", area_acres: 0.55, status: "conflict", owner: "PERSON-0045", polygon: "M 180 30 L 340 45 L 350 170 L 190 150 Z", center: [265, 98] },
  { dag_no: "103", khatian_no: "KH-103", parcel_id: "LG-P-002912", area_acres: 0.38, status: "clean", owner: "PERSON-0088", polygon: "M 340 45 L 480 35 L 490 160 L 350 170 Z", center: [415, 102] },
  { dag_no: "104", khatian_no: "KH-104", parcel_id: "LG-P-002913", area_acres: 0.65, status: "review", owner: "PERSON-0105", polygon: "M 480 35 L 620 50 L 610 180 L 490 160 Z", center: [550, 106] },
  { dag_no: "105", khatian_no: "KH-105", parcel_id: "LG-P-002914", area_acres: 0.30, status: "clean", owner: "PERSON-0120", polygon: "M 50 160 L 190 150 L 180 290 L 40 280 Z", center: [115, 220] },
  { dag_no: "106", khatian_no: "KH-106", parcel_id: "LG-P-002915", area_acres: 0.48, status: "mismatch", owner: "PERSON-0134", polygon: "M 190 150 L 350 170 L 340 300 L 180 290 Z", center: [265, 228] },
  { dag_no: "107", khatian_no: "KH-107", parcel_id: "LG-P-002916", area_acres: 0.52, status: "clean", owner: "PERSON-0160", polygon: "M 350 170 L 490 160 L 480 295 L 340 300 Z", center: [415, 230] },
  { dag_no: "108", khatian_no: "KH-108", parcel_id: "LG-P-002917", area_acres: 0.70, status: "clean", owner: "PERSON-0182", polygon: "M 490 160 L 610 180 L 600 310 L 480 295 Z", center: [545, 236] }
];

// Cadastral Survey Boundary Corner Stones ("সীমানা পিলার / বেড়ের কোণা")
const SURVEY_CORNER_STONES: [number, number][] = [
  [40, 40], [180, 30], [340, 45], [480, 35], [620, 50],
  [50, 160], [190, 150], [350, 170], [490, 160], [610, 180],
  [40, 280], [180, 290], [340, 300], [480, 295], [600, 310]
];

export const KhasraMapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [searchParams] = useSearchParams();
  const initialParcel = searchParams.get('parcel');

  const [activeMode, setActiveMode] = useState<'schematic' | 'geo'>('schematic');
  const [searchDagQuery, setSearchDagQuery] = useState<string>('');
  const [selectedDag, setSelectedDag] = useState<string>(() => {
    if (initialParcel) {
      const match = SCHEMATIC_PLOTS.find(p => p.parcel_id === initialParcel);
      if (match) return match.dag_no;
    }
    return '102';
  });

  const selectedPlot = SCHEMATIC_PLOTS.find(p => p.dag_no === selectedDag) || SCHEMATIC_PLOTS[1];

  const filteredPlots = SCHEMATIC_PLOTS.filter(p => 
    !searchDagQuery.trim() || 
    p.dag_no.includes(searchDagQuery.trim()) ||
    p.parcel_id.toLowerCase().includes(searchDagQuery.trim().toLowerCase())
  );

  const getStatusColor = (status: string): { fill: string; stroke: string; badge: BadgeVariant; label: string } => {
    switch (status) {
      case 'conflict': return { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#DC2626', badge: 'danger', label: isBn ? 'দ্বন্দ্বমূলক বিক্রয়' : 'Conflict' };
      case 'mismatch': return { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#D97706', badge: 'warning', label: isBn ? 'নামজারি অমিল' : 'Mismatch' };
      case 'review': return { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#2563EB', badge: 'default', label: isBn ? 'পর্যালোচনা' : 'Review' };
      default: return { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#047857', badge: 'success', label: isBn ? 'স্বাভাবিক' : 'Clean' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/10 dark:border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {isBn ? "ক্যাডাস্ট্রাল ম্যাপ ইন্টারফেস" : "Cadastral Map"}
            </span>
            <span className="text-xs text-slate-500">
              মৌজা: আমিনবাজার • সাভার, ঢাকা
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            {t('khasra.title', 'ডিজিটাল খসড়া পার্সেল মানচিত্র')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {t('khasra.subtitle', 'নম্বরযুক্ত দাগের সীমানা ও পার্সেল সম্পর্ক ভিজ্যুয়ালাইজেশন')}
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMode('schematic')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'schematic'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            {t('khasra.modeSchematic', 'ধারণামূলক খসড়া ম্যাপ')}
          </button>
          <button
            onClick={() => setActiveMode('geo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'geo'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('khasra.modeGeo', 'ভৌগোলিক মানচিত্র')}
          </button>
        </div>
      </div>

      {/* Mandatory Schematic Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          {t('khasra.disclaimer', 'ধারণামূলক খসড়া মানচিত্র — সরকারি জরিপ নয়। এটি কেবলমাত্র সিন্থেটিক ডেটা প্রদর্শনী ও সিদ্ধান্ত সহায়ক মডেল।')}
        </p>
      </div>

      {/* Interactive Dag Quick Switcher & Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-emerald-800/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Quick search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchDagQuery}
            onChange={(e) => setSearchDagQuery(e.target.value)}
            placeholder={isBn ? "দাগ নম্বর খুঁজুন (যেমন: ১০২)..." : "Search Dag (e.g. 102)..."}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
          />
        </div>

        {/* Right: Horizontal scrollable Dag selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            {isBn ? "দাগের তালিকা:" : "Dag List:"}
          </span>
          {filteredPlots.map((plot) => {
            const isSelected = selectedDag === plot.dag_no;
            const statusStyle = getStatusColor(plot.status);
            return (
              <button
                key={plot.dag_no}
                type="button"
                onClick={() => setSelectedDag(plot.dag_no)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? 'bg-amber-400 dark:bg-amber-500 text-slate-950 ring-2 ring-amber-500 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusStyle.stroke }} />
                <span>দাগ {plot.dag_no}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Container */}
      {activeMode === 'schematic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schematic SVG Map Card */}
          <Card className="lg:col-span-2 p-4 bg-emerald-50/30 dark:bg-slate-900 border-emerald-800/20 shadow-md relative overflow-hidden rounded-2xl flex flex-col justify-between">
            {/* Mouza Title & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  মৌজা মানচিত্র স্কেচ • সীমানা বেড় ও পিলার
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  আমিনবাজার (JL 45), সাভার
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  {isBn ? "স্বাভাবিক" : "Clean"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-600" />
                  {isBn ? "দ্বন্দ্বমূলক" : "Conflict"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  {isBn ? "নামজারি অমিল" : "Mismatch"}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  উজ্জ্বল সীমানা বেড়
                </span>
              </div>
            </div>

            {/* Interactive SVG Cadastral Grid */}
            <div className="w-full bg-white dark:bg-slate-800/90 rounded-xl p-3 border-2 border-emerald-800/20 shadow-inner flex items-center justify-center">
              <svg
                viewBox="0 0 660 360"
                className="w-full h-auto max-h-[460px] select-none"
              >
                {/* Background grid texture */}
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-100 dark:text-slate-700" />
                </pattern>
                <rect width="660" height="360" fill="url(#grid)" />

                {/* Road / River boundary line */}
                <path
                  d="M 20 20 Q 200 10 320 25 T 640 20"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="6"
                  strokeDasharray="8 4"
                />
                <text x="330" y="16" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {isBn ? "মৌজা সংযোগ রাস্তা" : "Connecting Village Road"}
                </text>

                {/* Outer Mouza Boundary Perimeter (মৌজার বহিঃসীমানা বেড়) */}
                <rect
                  x="22"
                  y="15"
                  width="616"
                  height="315"
                  rx="12"
                  fill="none"
                  stroke="#047857"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  opacity="0.8"
                />
                <text x="330" y="324" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {isBn ? "আমিনবাজার মৌজা বহিঃসীমানা বেড় (Mouza Boundary Ridge)" : "Mouza Boundary Ridge"}
                </text>

                {/* Parcel Polygons with High-Contrast Boundary Borders ("জমির বেড়") */}
                {SCHEMATIC_PLOTS.map((plot) => {
                  const style = getStatusColor(plot.status);
                  const isSelected = selectedDag === plot.dag_no;

                  return (
                    <g key={plot.dag_no} onClick={() => setSelectedDag(plot.dag_no)} className="cursor-pointer group">
                      {/* Outer Glowing Border Aura for Selected Plot */}
                      {isSelected && (
                        <path
                          d={plot.polygon}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="8"
                          strokeLinejoin="round"
                          opacity="0.7"
                        />
                      )}

                      {/* Main Plot Cadastral Boundary ("জমির মূল বেড়") */}
                      <path
                        d={plot.polygon}
                        fill={isSelected ? '#FEF08A' : style.fill}
                        stroke={isSelected ? '#78350F' : style.stroke}
                        strokeWidth={isSelected ? '4.5' : '3.5'}
                        strokeLinejoin="round"
                        className="transition-all duration-200 hover:brightness-105"
                      />

                      {/* Dag Number Badge */}
                      <circle
                        cx={plot.center[0]}
                        cy={plot.center[1] - 8}
                        r="15"
                        fill={isSelected ? '#78350F' : style.stroke}
                        className="transition-transform group-hover:scale-110"
                      />
                      <text
                        x={plot.center[0]}
                        y={plot.center[1] - 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {plot.dag_no}
                      </text>

                      {/* Area label */}
                      <text
                        x={plot.center[0]}
                        y={plot.center[1] + 16}
                        fill={isSelected ? '#78350F' : '#0F172A'}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {plot.area_acres} {isBn ? "একর" : "ac"}
                      </text>
                    </g>
                  );
                })}

                {/* Cadastral Survey Boundary Corner Stone Markers ("সীমানা পিলার") */}
                {SURVEY_CORNER_STONES.map(([cx, cy], i) => (
                  <g key={`corner-${i}`}>
                    <circle cx={cx} cy={cy} r="4.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx={cx} cy={cy} r="2" fill="#78350F" />
                  </g>
                ))}
              </svg>
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-2">
              {t('khasra.clickPlotHint', 'বিস্তারিত তথ্য ও লেনদেনের ইতিহাস দেখতে যেকোনো দাগের ওপর ক্লিক করুন।')}
            </p>
          </Card>

          {/* Plot Inspector Panel */}
          <Card className="p-6 bg-white dark:bg-slate-800 shadow-md border-emerald-800/20 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t('khasra.inspectPlot', 'পার্সেল তথ্য ও ইতিহাস')}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {isBn ? "দাগ নং:" : "Dag No:"} {selectedPlot.dag_no}
                  </h3>
                </div>
                <Badge variant={getStatusColor(selectedPlot.status).badge}>
                  {getStatusColor(selectedPlot.status).label}
                </Badge>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500">{isBn ? "পার্সেল আইডি:" : "Parcel ID:"}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedPlot.parcel_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500">{isBn ? "খতিয়ান নং:" : "Khatian No:"}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPlot.khatian_no}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500">{isBn ? "মোট এলাকা:" : "Total Acreage:"}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPlot.area_acres} {isBn ? "একর" : "acres"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-500">{isBn ? "রেকর্ডীয় মালিক:" : "Recorded Owner:"}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">{selectedPlot.owner}</span>
                </div>
              </div>

              {selectedPlot.status === 'conflict' && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{isBn ? "দ্বৈত-বিক্রয় ঝুঁকি সতর্কবার্তা" : "Double-Selling Risk"}</span>
                  </div>
                  <p>
                    {isBn 
                      ? "এই দাগে একাধিক অসঙ্গতিপূর্ণ বিক্রয় দলিল নিবন্ধিত হয়েছে। আরএমডি অডিটে বিক্রেতা ও নামজারির গরমিল রয়েছে।"
                      : "Multiple conflicting transfer deeds recorded. RMD triangulation audit indicates title mismatch."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Link to={`/rmd?tx=TX-002911-2`} className="block">
                <Button variant="primary" className="w-full gap-2 justify-center bg-emerald-700 hover:bg-emerald-800">
                  <Scale className="w-4 h-4" />
                  {isBn ? "RMD ত্রিভুজ অডিট দেখুন" : "Open RMD Audit"}
                </Button>
              </Link>
              <Link to={`/parcels/${selectedPlot.parcel_id}`} className="block">
                <Button variant="outline" className="w-full gap-2 justify-center">
                  <FileText className="w-4 h-4" />
                  {isBn ? "সম্পূর্ণ দলিল ইতিহাস" : "Deed History"}
                </Button>
              </Link>
              <Link to={`/explorer-3d`} className="block">
                <Button variant="ghost" className="w-full gap-2 justify-center text-xs">
                  <Box className="w-4 h-4 text-emerald-600" />
                  {isBn ? "৩ডি এক্সপ্লোরারে দেখুন" : "View in 3D"}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        /* Geographic Map Context Mode */
        <Card className="p-4 bg-white dark:bg-slate-800 border-emerald-800/20 shadow-md rounded-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isBn ? "বাংলাদেশ ভৌগোলিক মানচিত্র প্রেক্ষাপট" : "Bangladesh Geographic Map Context"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? "৮টি বিভাগ ও ৬৪টি জেলার অবস্থান ও কাভারেজ এলাকা" : "Geographic boundaries across Bangladesh divisions & districts"}
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Google Maps / Leaflet GIS
            </span>
          </div>

          <CadastralMap height="520px" />
        </Card>
      )}
    </div>
  );
};
