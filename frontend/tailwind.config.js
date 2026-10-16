/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atlas: {
          app: 'var(--bg-app)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          panel: 'var(--bg-surface-panel)',
          cyan: 'var(--accent-cyan)',
          teal: 'var(--signal-teal)',
          tealHover: 'var(--signal-teal-hover)',
          amber: 'var(--warning-amber)',
          red: 'var(--critical-red)',
          blue: 'var(--info-blue)',
          border: 'var(--border-subtle)',
          borderStrong: 'var(--border-strong)',
          textPrimary: 'var(--text-primary)',
          textSecondary: 'var(--text-secondary)',
          textMuted: 'var(--text-muted)',
        },
        cadastral: {
          midnight: '#07141E',
          deep: '#102533',
          green: '#16313E',
          teal: '#20C7D4',
          tealHover: '#1AB5C2',
          amber: '#E7B34B',
          alert: '#E46B70',
          paper: '#F3F7F8',
          ink: '#102630',
          cardLight: '#FFFFFF',
          cardDark: '#102533',
          borderLight: '#CFDEE1',
          borderDark: 'rgba(32, 199, 212, 0.22)',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'Hind Siliguri', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'atlas-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        'atlas-md': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'atlas-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',
        'atlas-glow': '0 0 20px -3px rgba(32, 199, 212, 0.35)',
        'cadastral': '0 1px 3px 0 rgba(7, 20, 30, 0.08)',
        'cadastral-lg': '0 10px 25px -3px rgba(7, 20, 30, 0.35)',
      }
    },
  },
  plugins: [],
};
