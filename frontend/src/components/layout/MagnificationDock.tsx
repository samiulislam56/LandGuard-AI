import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Layers,
  Sparkles,
  ClipboardList,
  FileText,
  Settings,
  Box,
} from 'lucide-react';

export const MagnificationDock: React.FC = () => {
  const { t } = useTranslation();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dockItems = [
    { name: t('nav.dashboard'), to: '/', icon: LayoutDashboard },
    { name: t('nav.explorer3d'), to: '/explorer-3d', icon: Box },
    { name: t('nav.transactions'), to: '/transactions', icon: ArrowRightLeft },
    { name: t('nav.parcels'), to: '/parcels/LG-P-002911', icon: Layers },
    { name: t('nav.assessment'), to: '/assess/TX-002911-2', icon: Sparkles },
    { name: t('nav.reviewCases'), to: '/reviews', icon: ClipboardList, badge: '1,188' },
    { name: t('nav.reports'), to: '/reports', icon: FileText },
    { name: t('nav.settings'), to: '/settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Quick Access Dock"
      className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 p-1.5 rounded-2xl bg-atlas-surface/90 backdrop-blur-xl border border-atlas-border shadow-atlas-lg"
    >
      {/* Top Indicator */}
      <div className="w-1.5 h-1.5 rounded-full bg-atlas-cyan animate-pulse mb-1" />

      {dockItems.map((item, idx) => {
        const Icon = item.icon;
        const isHovered = hoveredIdx === idx;
        const isNeighbor =
          hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;

        // Magnification scale
        const scaleClass = isHovered
          ? 'scale-125 -translate-x-1 z-10'
          : isNeighbor
          ? 'scale-110'
          : 'scale-100';

        return (
          <div key={item.to} className="relative group flex items-center">
            <NavLink
              to={item.to}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${scaleClass} ${
                  isActive
                    ? 'bg-atlas-cyan text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-atlas-textMuted hover:text-atlas-textPrimary hover:bg-atlas-elevated'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform" />
            </NavLink>

            {/* Accessible Flyout Tooltip */}
            <div className="absolute left-14 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 px-2.5 py-1 rounded-md bg-atlas-surface border border-atlas-border text-xs font-medium text-atlas-textPrimary whitespace-nowrap shadow-xl z-50">
              <span className="flex items-center gap-1.5">
                {item.name}
                {item.badge && (
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-mono text-[10px]">
                    {item.badge}
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      })}

      <div className="w-1.5 h-1.5 rounded-full bg-atlas-cyan/40 mt-1" />
    </nav>
  );
};
