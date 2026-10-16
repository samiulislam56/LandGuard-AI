import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Compass,
  Box,
  FileSpreadsheet,
  Layers,
  ShieldAlert,
  ClipboardList,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { t } = useTranslation();

  const navItems = [
    { label: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
    { label: t('nav.mapIntelligence'), path: '/#map-view', icon: Compass, isHighlight: true },
    { label: t('nav.explorer3d'), path: '/explorer-3d', icon: Box, isHighlight: true },
    { label: t('nav.assessment'), path: '/assess/TX-002911-2', icon: ShieldAlert },
    { label: t('nav.transactions'), path: '/transactions', icon: FileSpreadsheet },
    { label: t('nav.parcels'), path: '/parcels/LG-P-002911', icon: Layers },
    { label: t('nav.reviewCases'), path: '/review-cases', icon: ClipboardList },
    { label: t('nav.reports'), path: '/reports', icon: FileText },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-atlas-border bg-[#07141E] text-slate-100 transition-all duration-300 z-20 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-atlas-border bg-[#102533]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 border border-cyan-400/40 font-mono font-bold text-xs tracking-wider">
            LG
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                {t('app.name')}
                <span className="w-1.5 h-1.5 rounded-full bg-atlas-cyan animate-pulse" />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-atlas-cyan/90">
                {t('app.subtitle')}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={isCollapsed ? t('nav.expand') : t('nav.collapse')}
          aria-label={isCollapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-atlas-cyan border border-atlas-cyan/40 shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  item.isHighlight
                    ? 'bg-atlas-cyan/20 text-atlas-cyan'
                    : 'text-slate-400 group-hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info / Auditor Profile Card */}
      <div className="p-3 border-t border-atlas-border bg-[#102533]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-atlas-cyan/20">
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-atlas-cyan" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{t('app.auditorConsole')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono text-atlas-cyan truncate flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" /> {t('app.fastapiLive')}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={t('app.auditorConsole')}>
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-atlas-cyan" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
