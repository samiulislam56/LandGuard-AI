import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CadastralMotionBackgroundProps {
  className?: string;
  variant?: 'subtle' | 'hero' | 'surface';
  children?: React.ReactNode;
}

export const CadastralMotionBackground: React.FC<CadastralMotionBackgroundProps> = ({
  className = '',
  variant = 'subtle',
  children,
}) => {
  const { prefersReducedMotion } = useTheme();

  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Background Animated SVG Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      >
        {/* Ambient Radial Depth Glows */}
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000 ${
            variant === 'hero' ? 'opacity-30 dark:opacity-25' : 'opacity-15 dark:opacity-20'
          } bg-emerald-500/20 dark:bg-emerald-600/15`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl transition-opacity duration-1000 ${
            variant === 'hero' ? 'opacity-25 dark:opacity-20' : 'opacity-10 dark:opacity-15'
          } bg-amber-500/10 dark:bg-emerald-400/10`}
        />

        {/* Dynamic Animated Cadastral & Topographic SVG Grid */}
        <svg
          className={`w-full h-full min-h-[400px] object-cover transition-opacity duration-700 ${
            prefersReducedMotion ? 'opacity-40' : 'opacity-60 dark:opacity-75'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 800"
        >
          <defs>
            {/* Topographic Contour Wave Pattern */}
            <linearGradient id="topoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.18" />
              <stop offset="50%" stopColor="var(--signal-teal)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#D7B677" stopOpacity="0.08" />
            </linearGradient>

            {/* Cadastral Parcel Line Pattern */}
            <linearGradient id="parcelStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--signal-teal)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.10" />
            </linearGradient>

            {/* Subtle Parcel Hatching */}
            <pattern id="cadastralHatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="var(--signal-teal)" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>

          {/* Hatching background field */}
          <rect width="1200" height="800" fill="url(#cadastralHatch)" />

          {/* Topographic Elevation Curves (Flowing Ambient Land Waves) */}
          <g className={prefersReducedMotion ? '' : 'cadastral-wave-drift'}>
            <path
              d="M-100,200 C200,120 400,260 700,180 C1000,100 1150,220 1350,160"
              fill="none"
              stroke="url(#topoGradient)"
              strokeWidth="1.2"
              strokeDasharray="6 4"
            />
            <path
              d="M-100,320 C250,240 500,380 800,300 C1100,220 1200,340 1350,280"
              fill="none"
              stroke="url(#topoGradient)"
              strokeWidth="0.9"
            />
            <path
              d="M-100,460 C180,380 420,520 720,440 C1020,360 1180,480 1350,420"
              fill="none"
              stroke="url(#topoGradient)"
              strokeWidth="1.4"
              strokeDasharray="12 6"
            />
            <path
              d="M-100,600 C280,520 540,660 840,580 C1140,500 1220,620 1350,560"
              fill="none"
              stroke="url(#topoGradient)"
              strokeWidth="0.8"
            />
          </g>

          {/* Cadastral Land Parcel Geometric Outlines (Mouza Boundaries) */}
          <g className={prefersReducedMotion ? '' : 'cadastral-parcel-shimmer'}>
            {/* Plot 101 */}
            <polygon
              points="120,180 280,150 310,310 140,340"
              fill="var(--signal-teal)"
              fillOpacity="0.025"
              stroke="url(#parcelStroke)"
              strokeWidth="1.5"
            />
            {/* Plot 102 (Reference Focus Area) */}
            <polygon
              points="280,150 490,130 520,290 310,310"
              fill="var(--accent-cyan)"
              fillOpacity="0.04"
              stroke="var(--accent-cyan)"
              strokeWidth="2"
              strokeDasharray={prefersReducedMotion ? 'none' : '8 6'}
              className={prefersReducedMotion ? '' : 'cadastral-border-pulse'}
            />
            {/* Plot 103 */}
            <polygon
              points="490,130 680,160 660,320 520,290"
              fill="var(--signal-teal)"
              fillOpacity="0.02"
              stroke="url(#parcelStroke)"
              strokeWidth="1.5"
            />
            {/* Plot 104 */}
            <polygon
              points="680,160 890,140 870,300 660,320"
              fill="none"
              stroke="url(#parcelStroke)"
              strokeWidth="1.2"
            />
            {/* Plot 105 */}
            <polygon
              points="140,340 310,310 330,490 160,520"
              fill="none"
              stroke="url(#parcelStroke)"
              strokeWidth="1.2"
            />
            {/* Plot 106 */}
            <polygon
              points="310,310 520,290 540,470 330,490"
              fill="var(--signal-teal)"
              fillOpacity="0.02"
              stroke="url(#parcelStroke)"
              strokeWidth="1.5"
            />
            {/* Plot 107 */}
            <polygon
              points="520,290 660,320 680,500 540,470"
              fill="none"
              stroke="url(#parcelStroke)"
              strokeWidth="1.2"
            />
            {/* Plot 108 */}
            <polygon
              points="660,320 870,300 890,480 680,500"
              fill="var(--signal-teal)"
              fillOpacity="0.02"
              stroke="url(#parcelStroke)"
              strokeWidth="1.5"
            />
          </g>

          {/* Survey Coordinate Nodes (Pillars / Geodetic Control Points) */}
          <g className={prefersReducedMotion ? '' : 'cadastral-nodes-glow'}>
            <circle cx="280" cy="150" r="3.5" fill="var(--accent-cyan)" fillOpacity="0.7" />
            <circle cx="310" cy="310" r="3.5" fill="var(--accent-cyan)" fillOpacity="0.7" />
            <circle cx="490" cy="130" r="3.5" fill="var(--accent-cyan)" fillOpacity="0.7" />
            <circle cx="520" cy="290" r="4.5" fill="var(--accent-cyan)" fillOpacity="0.9">
              {!prefersReducedMotion && (
                <animate attributeName="r" values="3.5;6;3.5" dur="4s" repeatCount="indefinite" />
              )}
            </circle>
            <circle cx="680" cy="160" r="3.5" fill="#D7B677" fillOpacity="0.6" />
            <circle cx="660" cy="320" r="3.5" fill="#D7B677" fillOpacity="0.6" />
            <circle cx="330" cy="490" r="3.5" fill="var(--signal-teal)" fillOpacity="0.6" />
            <circle cx="540" cy="470" r="3.5" fill="var(--signal-teal)" fillOpacity="0.6" />
          </g>
        </svg>

        {/* Soft Vignette Mask to ensure 100% foreground contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-current opacity-5 pointer-events-none" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
