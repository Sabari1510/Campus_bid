---
name: Academic Athletics & Dynamic Exchange
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#505f7b'
  primary: '#000616'
  on-primary: '#ffffff'
  primary-container: '#0f1f38'
  on-primary-container: '#7887a5'
  inverse-primary: '#b8c7e7'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#100400'
  on-tertiary: '#ffffff'
  tertiary-container: '#341800'
  on-tertiary-container: '#cc6f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b8c7e7'
  on-primary-fixed: '#0b1b34'
  on-primary-fixed-variant: '#384762'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system merges collegiate varsity prestige with high-tempo, modern exchange dynamics. It reflects campus heritage and athletic drive through deep collegiate indigo-navies, tempered by high-visibility stadium accents—electric cobalt for active state tracking and warm amber-crimson for time-critical bid mechanics.

The aesthetic balances bold collegiate typography, structured layouts, and crisp high-contrast surfaces. Interfaces communicate urgency, security, and collegiate affiliation without descending into cluttered novelty. Micro-interactions are snappy and tactile, evocative of campus shot-clocks and exchange tickers.

## Colors

The palette establishes an authoritative, collegiate-grade foundation paired with athletic telemetry accents.

- **Primary (`#0f1f38`)**: Varsity Navy. Anchors navigation headers, prominent typography, surface borders, and dominant institutional buttons.
- **Secondary (`#2563eb`)**: Electric Cobalt. Governs active filters, focused strokes, live listing counters, and interactive highlights.
- **Tertiary (`#d97706`)**: Stadium Amber/Warm Crimson tone. Strictly allocated to high-urgency states: auction countdowns, live bidding buttons, active drop timers, and bid-placed confirmation tags.
- **Neutral (`#64748b`)**: Crisp Slate. Powers muted metadata, secondary borders, subheaders, and empty-state iconography.
- **Canvas & Card Layers**: Base background resolves to ultra-crisp slate `#f8fafc`. Active cards rest on pure optical white `#ffffff` framed by high-contrast fine borders (`#e2e8f0` to `#cbd5e1`).

## Typography

The type system pairs the angular, technical punch of **Space Grotesk** with the neutral, hyper-legible utility of **Inter**.

- **Space Grotesk** is reserved for headlines, currency display, countdown timers, lot numbers, badges, and button labels. It injects athletic scoreboards and vintage varsity ticker energy into every metric.
- **Inter** handles narrative descriptions, terms, item condition disclaimers, chat exchanges, and technical line items, ensuring optical clarity at standard reading sizes.
- **Tabular Numerals**: Apply `font-feature-settings: "tnum" 1` across all countdown components, bid tables, and current high-bid cards to prevent horizontal jitter during clock decrements.

## Layout & Spacing

A structured 12-column responsive fluid grid anchors all pages, scaling down to an 8-column layout for tablets and a 4-column layout on mobile.

- **Desktop (1280px+)**: 12 columns, `gutter: 1.5rem`, outer `margin: 2rem`, maximum container constraint of `1440px`.
- **Tablet (768px - 1279px)**: 8 columns, `gutter: 1.25rem`, outer `margin: 1.5rem`.
- **Mobile (< 768px)**: 4 columns, `gutter-mobile: 1rem`, outer `margin-mobile: 1rem`.

Card layouts, auction boards, and relay feeds scale with strict multiples of `0.25rem` (4px base unit). Compact listing rows maintain an interior padding of `space-sm` vertically and `space-md` horizontally, preserving dense athletic scoreboard density without overcrowding touch boundaries.

## Elevation & Depth

Visual hierarchy employs sharp, tonal borders reinforced with ultra-low-diffusion, tinted ambient shadows rather than blurry generic drop shadows.

- **Level 0 (Base)**: `#f8fafc` canvas background with zero elevation.
- **Level 1 (Cards & Static Containers)**: `#ffffff` background with a crisp border (`1px solid #e2e8f0`) and subtle deep-navy ambient occlusion (`box-shadow: 0 1px 3px 0 rgba(15, 31, 56, 0.05), 0 1px 2px -1px rgba(15, 31, 56, 0.05)`).
- **Level 2 (Hovered Item / Dropdown)**: 1px border shifting to `#cbd5e1`, paired with `box-shadow: 0 10px 15px -3px rgba(15, 31, 56, 0.08), 0 4px 6px -4px rgba(15, 31, 56, 0.04)`.
- **Level 3 (Live Bidding Drawer & Action Modals)**: Sharp 1px border tinted in `#0f1f38` at 15% opacity, paired with directional shadow `box-shadow: 0 20px 25px -5px rgba(15, 31, 56, 0.12), 0 8px 10px -6px rgba(15, 31, 56, 0.08)`.
- **Active Hotstate (Ending Soon)**: Cards feature a dual rim: `1px solid #d97706` coupled with an ambient glow (`box-shadow: 0 0 0 1px #d97706, 0 8px 20px -4px rgba(217, 119, 6, 0.15)`).

## Shapes

The design system implements a soft, structural geometry (`roundedness: 1`). Elements favor precise engineering and collegiate architectural lines rather than playful or bubbly curves.

- Standard buttons, badges, chips, and input fields utilize `0.25rem` (4px) corner radiuses.
- Content cards, bidding trays, modal frames, and dynamic hero banners scale to `rounded-lg` (`0.5rem` / 8px).
- Stadium Badges and countdown pills utilize `rounded-full` strictly when communicating binary state statuses (e.g., "LIVE NOW", "RESERVE MET").

## Components

### Buttons
- **Primary / Place Bid**: Background `#d97706`, text `#ffffff`, font `Space Grotesk` (Semi-bold, uppercase tracking). Active press applies a subtle translate Y (`+1px`) with zero shadow, providing physical scoreboard button tactile feedback.
- **Secondary / Collegiate Action**: Background `#0f1f38`, text `#ffffff`. Hover scales to `#162b4e`.
- **Outline / Filter**: 1px border `#cbd5e1`, background `#ffffff`, text `#0f1f38`. Hover transitions border to `#2563eb` and text to `#2563eb`.

### Chips & Auction Badges
- **Live State Pill**: High-contrast pill featuring a pulsating `#d97706` indicator dot, background `rgba(217, 119, 6, 0.12)`, text `#b45309`, labeled with `label-sm`.
- **Campus Affiliation Chip**: Background `#f1f5f9`, border `1px solid #e2e8f0`, text `#0f1f38`, displaying collegiate departmental and dorm identifiers.

### Cards (Item & Auction Grid)
- Structured white surface framed by a 1px border in `#e2e8f0`.
- Top edge incorporates an integrated countdown bar: background `rgba(15, 31, 56, 0.04)` displaying tabular countdown timer in `Space Grotesk`.
- Item thumbnail maintains fixed aspect ratio (`4:3` or `1:1`) with an inset overlay for high bid indicators.
- Bottom footer cleanly separates current price from quick-bid incremental trigger buttons (`+$5`, `+$10`, `+$25`).

### Inputs & Number Steppers
- Text inputs: `#ffffff` background with a 1px border `#cbd5e1`. Focus elevates border to 2px solid `#2563eb` with an electric blue offset ring.
- Numeric Bid Stepper: Segmented controls with tactile `+` and `-` endcaps using `#f8fafc` backgrounds and bold `Space Grotesk` numerals in `#0f1f38`.

### Checkboxes & Radios
- Square with `0.125rem` radius corners. Unchecked: `1px solid #94a3b8`. Checked: solid `#0f1f38` fill with sharp `#ffffff` geometric glyph. Active focus glows in `#2563eb`.

### Countdown Tickers & Activity Feed
- Real-time ticker components use dark mode contrast blocks inside the light interface: `#0f1f38` background, `#f59e0b` digits, with monospaced letter spacing to emulate stadium jumbotrons.