---
name: High-Fidelity AI Monitoring
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4ae176'
  on-tertiary: '#003915'
  tertiary-container: '#007e37'
  on-tertiary-container: '#c1ffc5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-label:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  stack-gap: 16px
---

## Brand & Style
The design system is engineered for a high-performance AI monitoring interface. It balances the precision of developer tools with the polished aesthetics of modern SaaS platforms. The personality is professional, authoritative, and technologically advanced, evoking a sense of real-time intelligence and reliability.

The visual style is **Corporate Modern with subtle Tech-Noir influences**. It utilizes deep charcoal surfaces to minimize eye strain during long monitoring sessions, punctuated by vibrant, high-contrast neon accents that signal activity and system health. The interface prioritizes data density without sacrificing clarity, using crisp lines and intentional whitespace to organize complex technical information.

## Colors
The palette is optimized for a dark-mode-first experience, focusing on depth and functional signaling:

- **Primary (Electric Blue):** Used for primary actions, active states, and core branding elements.
- **Secondary (Violet):** Applied to AI-specific features, processing states, and secondary data visualizations.
- **Success (Neon Green):** Reserved strictly for "Connected," "Online," and healthy system metrics.
- **Metrics (Cyan):** Used for numerical data, latency graphs, and technical readouts to ensure high legibility against dark backgrounds.
- **Neutrals:** A range of deep slates and charcoals provide structural layering. The background is a near-black slate to ensure the vibrant accents "pop" with high-fidelity contrast.

## Typography
The system uses **Inter** for its exceptional legibility in data-heavy environments. Its neutral but modern tone ensures that technical content remains the focus. For specialized technical data, monospaced labels are introduced via **Geist** to provide a distinct "developer tool" feel for IDs, timestamps, and raw metrics.

- **Headlines:** Use tight letter spacing and bold weights to create a strong visual hierarchy.
- **Body Text:** Standardized on a 16px base for optimal readability, scaling down to 14px for secondary metadata.
- **Data Labels:** Use the `code-label` style (Geist) in uppercase for system statuses and table headers to differentiate from narrative content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict 4px increments (8pt grid system). This ensures mathematical consistency across all components.

- **Desktop:** A 12-column grid with 24px gutters. Sidebars for navigation and telemetry are fixed (280px), while the main monitoring dashboard expands fluidly.
- **Margins:** Large 32px outer margins on desktop provide "breathing room" for dense data cards.
- **Adaptive Reflow:** On mobile devices, the 12-column grid collapses to a single-column stack. Complex data tables should transition to card-based list views or horizontal overflow containers with clear "swipe" indicators.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows, maintaining a clean, technical look.

- **Level 0 (Background):** Deepest slate (#020617).
- **Level 1 (Cards/Panels):** Charcoal (#1E293B) with a 1px border of #334155.
- **Level 2 (Modals/Popovers):** Slightly lighter slate with a soft, diffused 20% opacity black shadow (0px 10px 30px) and a subtle 1px border.
- **Interaction:** Hovering over interactive elements increases the border brightness or adds a subtle inner glow using the primary blue or secondary violet colors.

## Shapes
The design system employs a **Rounded** aesthetic to soften the technical nature of the data. 

- **Standard Components:** Buttons and inputs use a 0.5rem (8px) radius.
- **Containers:** Dashboard cards and main panels use `rounded-lg` (16px) to create a distinct, modern SaaS container feel. 
- **Status Indicators:** Small status pips are fully circular, while "Pill" badges (tags/chips) use a max-radius to differentiate them from actionable buttons.

## Components
- **Buttons:** Primary buttons feature a solid Electric Blue fill. Secondary buttons use a ghost style with a 1px border. All buttons have a high-contrast white or light-cyan label.
- **Data Cards:** Containers for metrics should include a 16px corner radius, a subtle 1px border, and a title section using the `code-label` typography.
- **Input Fields:** Darker than the card background with a focused state that uses a 2px Electric Blue ring. Labels are placed above the field in `body-sm`.
- **Status Chips:** Small, pill-shaped indicators. "Connected" uses a Neon Green background with 10% opacity and a solid green dot.
- **Monitors & Graphs:** Line charts should use the Cyan accent for the primary data path, with a subtle area gradient fill underneath (10% opacity).
- **Lists:** Data rows should have a subtle hover state (#1E293B) and use dividers only when necessary; whitespace is preferred for separation.