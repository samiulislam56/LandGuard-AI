import React from 'react';

export const AnimatedCadastralMotif: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 600 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-35 dark:opacity-40"
      >
        <defs>
          <linearGradient id="cadastralGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4E8A5" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0E8D60" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D7B677" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Conceptual Plot Hexagons & Cadastral Boundaries */}
        <g stroke="url(#cadastralGlow)" strokeWidth="1.5" strokeDasharray="6 4" className="motion-safe:animate-[cadastral-trace_24s_linear_infinite]">
          {/* Plot A - SAVAR 102 */}
          <polygon points="50,40 160,20 220,110 140,160 40,120" />
          {/* Plot B - ADJACENT 103 */}
          <polygon points="160,20 280,30 320,120 220,110" />
          {/* Plot C - ADJACENT 104 */}
          <polygon points="220,110 320,120 290,210 190,200" />
          {/* Plot D - ROADWAY BUFFER */}
          <polygon points="140,160 220,110 190,200 110,230" />
          {/* Plot E - EASTERN KHASRA */}
          <polygon points="320,120 440,90 480,180 370,220 290,210" />
          {/* Plot F - FARMLAND MEADOW */}
          <polygon points="440,90 560,70 580,170 480,180" />
        </g>

        {/* Survey Coordinate Pins / Dag Nodes */}
        <g fill="#D7B677">
          <circle cx="160" cy="20" r="3" />
          <circle cx="220" cy="110" r="4" fill="#C4E8A5" />
          <circle cx="320" cy="120" r="3" />
          <circle cx="140" cy="160" r="3" />
          <circle cx="290" cy="210" r="3" />
          <circle cx="480" cy="180" r="3" />
        </g>

        {/* Plot Labels */}
        <text x="110" y="95" fill="#C4E8A5" fontSize="11" fontFamily="monospace" opacity="0.7">দাগ ১০২</text>
        <text x="230" y="65" fill="#C4E8A5" fontSize="11" fontFamily="monospace" opacity="0.6">দাগ ১০৩</text>
        <text x="375" y="155" fill="#C4E8A5" fontSize="11" fontFamily="monospace" opacity="0.6">দাগ ১০৪</text>
      </svg>
    </div>
  );
};
