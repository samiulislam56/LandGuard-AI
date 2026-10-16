# LANDGUARD GREENFIELD — INCLUSIVE UI/UX DESIGN SYSTEM

**System Name:** LandGuard Greenfield  
**Philosophy:** Human-Friendly, Calming, Agricultural Land Intelligence  
**Standard:** WCAG 2.1 Level AA Compliant  

---

## 1. Visual Identity & Color Tokens

The Greenfield color palette takes inspiration from the lush rural landscapes, paddy fields, alluvial soil, and riverine heritage of Bangladesh.

### Light Theme (Default)
| Token Name | Hex Code | HSL Value | Semantic Role |
| :--- | :---: | :---: | :--- |
| `--color-bg-canvas` | `#FBFBF9` | `60, 14%, 98%` | Primary warm canvas |
| `--color-surface-card` | `#FFFFFF` | `0, 0%, 100%` | Card surfaces with subtle ivory tint |
| `--color-surface-hover` | `#F4F6F0` | `80, 20%, 95%` | Subtle interactive hover |
| `--color-brand-primary` | `#2D6A4F` | `152, 40%, 30%` | Primary agricultural green accent |
| `--color-brand-forest` | `#1B4332` | `153, 42%, 18%` | Deep forest green headings & buttons |
| `--color-brand-light` | `#D8F3DC` | `129, 58%, 90%` | Soft green badge background |
| `--color-text-main` | `#1E293B` | `217, 33%, 17%` | Charcoal high-contrast body text |
| `--color-text-muted` | `#475569` | `215, 16%, 47%` | Secondary readable caption text |
| `--color-border-subtle` | `#E2E8F0` | `214, 32%, 91%` | Clean, non-distracting card borders |
| `--color-accent-gold` | `#B45309` | `26, 90%, 37%` | Khasra & Dag evidence highlights |
| `--color-alert-danger` | `#DC2626` | `0, 72%, 51%` | Discrepancy & conflict indicators |
| `--color-alert-warning` | `#D97706` | `38, 92%, 44%` | Review required notices |

### Dark Theme (Botanical Forest)
| Token Name | Hex Code | Semantic Role |
| :--- | :---: | :--- |
| `--color-bg-canvas` | `#0B130E` | Deep botanical night canvas |
| `--color-surface-card` | `#132219` | Muted dark forest surface |
| `--color-surface-hover` | `#1B3024` | Elevated surface on hover |
| `--color-brand-primary` | `#52B788` | Luminous soft leaf green |
| `--color-text-main` | `#ECFDF5` | Soft high-contrast off-white |
| `--color-text-muted` | `#94A3B8` | Clear secondary grey |
| `--color-border-subtle` | `#1F3829` | Restrained dark border |

---

## 2. Typography Standards

### Font Families
- **Bengali Primary:** `'Noto Sans Bengali'`, `'Hind Siliguri'`, system-ui, sans-serif
- **English Complementary:** `'Manrope'`, `'Inter'`, system-ui, sans-serif
- **Cadastral Identifiers (Dag/Khatian/Parcel):** Font-feature `'tnum'` (tabular numbers) for numerical alignment.

### Bengali Typographic Rules
1. **Line Height:** Bengali matras (মাত্রাস) and diacritics require a minimum line-height of `1.6` for body text to avoid clipping vowel marks.
2. **Font Weight:** Use `font-semibold` (`600`) and `font-bold` (`700`) for headers to ensure crisp legibility on non-Retina displays.
3. **No Tiny Text:** Minimum body font size is `14px` (`text-sm`), with `16px` (`text-base`) as default for citizen-facing descriptions.

---

## 3. Micro-Interactions & Surfaces

- **Glassmorphic Restraint:** Translucent navigation panels use `backdrop-blur-md` with at least 85% opacity (`bg-white/90` or `bg-slate-900/90`) to guarantee that background movement never degrades text readability.
- **Button Touch Targets:** Minimum button height is `44px` with `px-5 py-2.5` padding, suitable for finger taps on mobile devices.
- **Elevation:** Soft diffused shadows (`box-shadow: 0 4px 20px -2px rgba(27, 67, 50, 0.08)` in light mode) give elements physical depth without visual clutter.
- **Feedback & States:** Visible active/focus rings with 2px offset (`ring-2 ring-emerald-600 ring-offset-2`).
