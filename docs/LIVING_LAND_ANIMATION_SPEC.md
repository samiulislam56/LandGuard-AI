# LIVING LAND — BOTANICAL INTELLIGENCE ANIMATION SPECIFICATION

## 1. Design Concept & Emotional Tone
**Design Name**: *Living Land — Botanical Intelligence Experience*
**Emotional Persona**: Lush, prestigious, grounded, institutional yet natural, reassuring to Bangladeshi citizens, farmers, and property buyers.
**Color Tokens**:
- Deep Forest Base: `#062B22`
- Emerald Accent: `#0E8D60`
- Sprout Green: `#C4E8A5`
- Cadastral Gold: `#D7B677`
- Alabaster Background: `#F5F8F2`

---

## 2. Animation Layers & Architecture

### Animation A — Agricultural Hero
- **Source**: High-resolution Bangladesh agricultural photography (`/assets/images/hero-bg.jpg`). Preserved 100% without deletion or replacement.
- **Motion**: Pure CSS `@keyframes slow-drift` operating on `transform: scale() translate()` over a restrained 25-second breathing cycle.
- **Vignette**: Multi-stop radial and linear gradients (`#062B22/95` to transparent) providing perfect readability for foreground Bengali headlines.

### Animation B — Animated Cadastral Boundaries
- **Source**: [`frontend/src/components/ui/AnimatedCadastralMotif.tsx`](file:///e:/LandGuard-AI/frontend/src/components/ui/AnimatedCadastralMotif.tsx).
- **Motion**: SVG stroke-dashoffset tracing animation (`@keyframes cadastral-trace`) animating along conceptual plot perimeters.
- **Disclaimer**: Clearly rendered as a conceptual design motif, avoiding any false claim of official surveyed borders.

### Animation C — Performance & Battery Saving (Lite Mode)
- **Toggle Control**: Located in the top right of the hero banner (`Lite Mode` / `Full Motion`).
- **Persistence**: Saved to `localStorage.getItem('landguard_lite_mode')`.
- **Low-Power Behavior**: Disables continuous CSS scale animations and hides background SVG boundary loops to maximize battery life on low-end mobile devices.

### Animation D — Accessibility & Reduced Motion
- Uses standard CSS media query `@media (prefers-reduced-motion: reduce)`.
- When active, all durations collapse to `0.01ms`, removing all motion for users prone to vestibular motion sickness.
