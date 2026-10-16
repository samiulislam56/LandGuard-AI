import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Search,
  MapPin,
  ShieldAlert,
  ClipboardList,
  FileText,
  Settings,
  X,
  Box,
  Compass,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
    { label: t('nav.mapIntelligence'), path: '/#map-view', icon: Compass },
    { label: t('nav.explorer3d'), path: '/explorer-3d', icon: Box },
    { label: t('nav.assessment'), path: '/assess/TX-002911-2', icon: ShieldAlert },
    { label: t('nav.transactions'), path: '/transactions', icon: Search },
    { label: t('nav.parcels'), path: '/parcels/LG-P-002911', icon: MapPin },
    { label: t('nav.reviewCases'), path: '/review-cases', icon: ClipboardList },
    { label: t('nav.reports'), path: '/reports', icon: FileText },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-[#07141E] text-slate-100 h-full flex flex-col shadow-2xl z-10 border-r border-atlas-border">
        <div className="h-16 flex items-center justify-between px-4 border-b border-atlas-border bg-[#102533]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-700 text-white flex items-center justify-center shrink-0 border border-cyan-400/40 font-mono font-bold text-xs">
              LG
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              {t('app.name')}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-atlas-cyan/20 text-atlas-cyan border border-atlas-cyan/40 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-atlas-border text-xs font-mono text-slate-400 bg-[#102533]">
          <p className="font-semibold text-white">{t('app.fastapiLive')}</p>
          <p className="text-[11px] text-atlas-cyan">{t('app.subtitle')}</p>
        </div>
      </div>
    </div>
  );
};
