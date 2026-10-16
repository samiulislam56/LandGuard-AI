import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Search,
  Compass,
  Scale,
  Box,
  FileSpreadsheet,
  ClipboardList,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const navItems = [
    { label: isBn ? "হোমপেজ" : "Home", path: '/', icon: Home },
    { label: isBn ? "জমি খুঁজুন" : "Land Search", path: '/search', icon: Search, isHighlight: true },
    { label: isBn ? "খসড়া ম্যাপ" : "Khasra Map", path: '/khasra-map', icon: Compass, isHighlight: true },
    { label: isBn ? "RMD অডিট" : "RMD Audit", path: '/rmd', icon: Scale, isHighlight: true },
    { label: isBn ? "৩ডি এক্সপ্লোরার" : "3D Explorer", path: '/explorer-3d', icon: Box },
    { label: isBn ? "লেনদেন তালিকা" : "Transactions", path: '/transactions', icon: FileSpreadsheet },
    { label: isBn ? "রিভিউ ওয়ার্কস্পেস" : "Review Queue", path: '/reviews', icon: ClipboardList },
    { label: isBn ? "প্রতিবেদন কেন্দ্র" : "Reports", path: '/reports', icon: FileText },
    { label: isBn ? "সহায়তা ও পরিভাষা" : "Help & Glossary", path: '/help', icon: HelpCircle },
    { label: isBn ? "সেটিংস" : "Settings", path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-300 z-20 shrink-0 select-none shadow-sm ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Main Navigation"
    >
      {/* Sidebar Header / Toggle */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 dark:border-slate-800">
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            {isBn ? "সেবা ও নেভিগেশন" : "Navigation"}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
          title={isCollapsed ? "প্রসারিত করুন" : "সংকুচিত করুন"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  item.isHighlight
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Guest Mode Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 m-2 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isBn ? "উন্মুক্ত সিন্থেটিক মডেল" : "Synthetic Prototype"}</span>
        </div>
      )}
    </aside>
  );
};
