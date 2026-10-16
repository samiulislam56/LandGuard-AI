import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Search,
  Compass,
  Scale,
  Box,
  Layers,
  ClipboardList,
  FileText,
  HelpCircle,
  Settings,
  X,
  ShieldCheck
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const navItems = [
    { label: isBn ? "হোমপেজ" : "Home", path: '/home', icon: Home },
    { label: isBn ? "জমি খুঁজুন" : "Land Search", path: '/search', icon: Search },
    { label: isBn ? "খসড়া ম্যাপ" : "Khasra Map", path: '/khasra-map', icon: Compass },
    { label: isBn ? "RMD অডিট" : "RMD Audit", path: '/rmd', icon: Scale },
    { label: isBn ? "৩ডি এক্সপ্লোরার" : "3D Explorer", path: '/explorer-3d', icon: Box },
    { label: isBn ? "লেনদেন তালিকা" : "Transactions", path: '/transactions', icon: Layers },
    { label: isBn ? "রিভিউ ওয়ার্কস্পেস" : "Review Queue", path: '/reviews', icon: ClipboardList },
    { label: isBn ? "প্রতিবেদন কেন্দ্র" : "Reports", path: '/reports', icon: FileText },
    { label: isBn ? "সহায়তা ও পরিভাষা" : "Help & Glossary", path: '/help', icon: HelpCircle },
    { label: isBn ? "সেটিংস" : "Settings", path: '/settings', icon: Settings },
  ];

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              LG
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              LandGuard AI
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isBn ? "উন্মুক্ত সিন্থেটিক ডেমো" : "Open Synthetic Demo"}</span>
        </div>
      </div>
    </div>
  );
};
