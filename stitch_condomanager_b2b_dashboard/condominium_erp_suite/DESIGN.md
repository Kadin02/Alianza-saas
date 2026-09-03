---
name: Condominium ERP Suite
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#505f7c'
  primary: '#15243e'
  on-primary: '#ffffff'
  primary-container: '#2b3a55'
  on-primary-container: '#95a4c4'
  inverse-primary: '#b7c7e8'
  secondary: '#005cbb'
  on-secondary: '#ffffff'
  secondary-container: '#5798ff'
  on-secondary-container: '#002f66'
  tertiary: '#00292f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004149'
  on-tertiary-container: '#09b5c8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b7c7e8'
  on-primary-fixed: '#0b1b35'
  on-primary-fixed-variant: '#384763'
  secondary-fixed: '#d7e3ff'
  secondary-fixed-dim: '#abc7ff'
  on-secondary-fixed: '#001b3f'
  on-secondary-fixed-variant: '#00458f'
  tertiary-fixed: '#98f0ff'
  tertiary-fixed-dim: '#4ed8eb'
  on-tertiary-fixed: '#001f24'
  on-tertiary-fixed-variant: '#004f58'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  sidebar-width: 16.25rem
  sidebar-collapsed-width: 4.5rem
  table-row-dense: 2.25rem
  table-row-regular: 3rem
  container-padding: 1.5rem
---

## Brand & Style

This design system defines a desktop-first B2B SaaS platform engineered for multi-tenant condominium administration, HOA accounting, and physical asset operations. The aesthetic merges corporate clarity with high-density utility—drawing inspiration from institutional property management platforms and modern European ERP frameworks. 

The platform communicates financial precision, auditability, operational authority, and institutional trust. Visual weight leans heavily into high-contrast data presentation, crisp borders, and balanced whitespace that mitigates cognitive fatigue during prolonged operational cycles (billing reconciliations, tenant maintenance triages, and assembly voting logs).

## Colors

The system employs a controlled corporate palette engineered for high clarity across deep hierarchical interfaces and dense financial matrices:

- **Primary Brand & Typography (`#2b3a55`):** Deep architectural navy. Serves as the primary structural color for persistent sidebars, top-level navigation, and main body typography. It replaces harsh pure blacks to maintain high contrast while reducing eye strain.
- **Accent Interactive Blue (`#3a80e6`):** Primary action color. Allocated strictly for primary call-to-actions, active navigation highlights, focused input rings, and active state switches.
- **Support Teal (`#00b3c6`):** Secondary interactive anchor. Reserved for operational status indicators, secondary feature flags, micro-metric highlights, and tenant-portal cross-linking.
- **Canvas / Neutral (`#f0f2f5`):** A tinted, cool grey foundation that prevents screen glare and separates background utility from elevated content surfaces.
- **Surface Pure White (`#ffffff`):** Dedicated to functional cards, active rows, data grids, modal sheets, and slide-over drawers.
- **Semantic Feedback:**
  - **Success / Pagado (`#10b981`):** Reconciled ledger items, active leases, and resolved service requests.
  - **Warning / Pendiente (`#f59e0b`):** Pending approvals, scheduled maintenance, and expiring contracts.
  - **Danger / Vencido (`#ef4444`):** Overdue maintenance fees, legal notices, and critical infrastructural defects.

## Typography

Typography relies entirely on the Inter font family, utilizing its balanced tabular numbers and tall x-height to deliver legible accounting ledgers and technical records.

- Numeric tabular figures (`tnum`, `zero`) must be enforced for all currency amounts, condominium unit numbers, balance sheets, and dates to preserve vertical alignment in tables.
- Uppercase styling is restricted strictly to `label-sm` elements (table column headers, status badge text, and technical category dividers) with expanded tracking.
- Hierarchy emphasizes scannability: Page headings establish context quickly, while operational text scales between 12px and 13px to preserve spatial efficiency without sacrificing legibility.

## Layout & Spacing

The interface applies a structured, desktop-centric fluid workspace that adapts systematically between 1280px and 1920px+ monitors.

- **Primary Architecture:** Rigid dual-tier layout consisting of a fixed-width left navigation sidebar (260px expanded, 72px icon-only collapse), a sticky top header (56px) for tenant-switching and global searches, and a fluid primary canvas.
- **Grid Structure:** Inside workspace views, an 8pt baseline rhythm governs all components. Content layouts implement a 12-column grid with 24px gutters and 24px outer margins.
- **Density Control:** Data listings support a toggled dual-density layout:
  - *Standard Mode:* Row heights at 48px (`table-row-regular`) for general administration and tenant management.
  - *Compact Mode:* Row heights at 36px (`table-row-dense`) for bank reconciliations, fiscal year balance sheets, and bulk unit updates.

## Elevation & Depth

Visual depth is achieved through low-contrast outlines coupled with ambient, cool-tinted drop shadows rather than abrupt elevation shifts. This keeps data surfaces tactile without distracting from dense tabular records.

- **Level 0 (Canvas Base):** Ground background `#f0f2f5`. Completely flat.
- **Level 1 (Cards & Data Grids):** Pure white background (`#ffffff`), 1px structural boundary colored with `#2b3a55` at 8% opacity (`rgba(43, 58, 85, 0.08)`), overlaid with shadow: `0 1px 3px 0 rgba(43, 58, 85, 0.04), 0 1px 2px -1px rgba(43, 58, 85, 0.03)`.
- **Level 2 (Hover States & Active Cards):** 1px structural boundary at 12% opacity, overlaid with shadow: `0 4px 6px -1px rgba(43, 58, 85, 0.07), 0 2px 4px -2px rgba(43, 58, 85, 0.05)`.
- **Level 3 (Dropdowns, Filter Flyouts, Context Menus):** Pure white surface, subtle 1px border at 10% opacity, shadow: `0 10px 15px -3px rgba(43, 58, 85, 0.08), 0 4px 6px -4px rgba(43, 58, 85, 0.04)`.
- **Level 4 (Drawers & Modals):** Pure white surface, zero stroke, elevated through a heavy surrounding wash: `0 20px 25px -5px rgba(43, 58, 85, 0.12), 0 8px 10px -6px rgba(43, 58, 85, 0.08)`. Backdrops feature `#2b3a55` at 40% opacity with a 2px blur.

## Shapes

The design system pairs structural, dense tables with friendly, contemporary rounded surfaces. 

- Outer cards, KPI metric panels, modal sheets, and slide-in drawers employ generous `rounded-2xl` contours (~14px to 16px). This rounds off the corporate austerity of ERP tools and frames dense inner data modules cleanly.
- Form controls, input text fields, select menus, segmented buttons, and action buttons strictly use intermediate roundedness (6px to 8px) to conserve interactive target area and maintain precise grid alignments.
- Operational status badges, user avatars, and quick-filter pills utilize full circular radiuses (9999px pill shapes).

## Components

### Buttons & Interactive Controls
- **Primary Action:** Solid `#3a80e6` fill, white `#ffffff` label, 8px corner radius, 36px standard height. Hover triggers a shift to `#2d6fd1` with an ambient glow. Focus ring renders as a 2px offset in `#3a80e6` at 30% opacity.
- **Secondary Action:** Transparent fill, 1px solid border in `#2b3a55` at 18% opacity, text in `#2b3a55`. Hover transitions background to `rgba(43, 58, 85, 0.04)`.
- **Destructive Action:** Subtle light crimson tint fill (`#ef4444` at 10% opacity) with text in `#ef4444`. Promotes safety during payment voids and lease cancellations.
- **Inline Action Buttons:** Compact 28px × 28px transparent square buttons with 6px corner radius. Icons (View, Edit, Void/Cancel) default to `#2b3a55` at 60% opacity, shifting to full color on individual hover.

### Data Tables & Dense Grids
- **Header Structure:** 36px fixed height, uppercase `label-sm` typography, light cool tint background (`#f8fafc`), with a 1px solid border `#e2e8f0` on top and bottom.
- **Rows:** Zebra striping alternates between `#ffffff` and `#fbfcfd`. Active or selected rows transition into an interactive soft blue tint (`#3a80e6` at 6% opacity) with a solid 3px left border in `#3a80e6`.
- **Text Alignment:** Financial figures and balances align strictly to the right with tabular numbers; names, concepts, and IDs align left; dates and status indicators align center.

### Status Badges (Pills)
- Compact pill badges styled with an 8px vertical padding threshold, uppercase tracking, and semi-transparent background fills:
  - *Pagado / Completado:* `#10b981` at 12% fill, `#047857` solid text.
  - *Pendiente / En Revisión:* `#f59e0b` at 12% fill, `#b45309` solid text.
  - *Vencido / Mora:* `#ef4444` at 12% fill, `#b91c1c` solid text.
  - *Informativo:* `#3a80e6` at 12% fill, `#1d4ed8` solid text.

### KPI Metric Cards
- White surface, `rounded-2xl` curvature, containing:
  - 11px uppercase label text (`#2b3a55` at 60% opacity).
  - High-impact 24px bold primary metric in tabular figures.
  - Right-aligned micro-trend component (e.g., Sparkline or `+4.2% vs. mes anterior` badge using semantic green/red typography).

### Input Fields & Filter Bars
- Inputs feature a crisp 1px border (`#2b3a55` at 16% opacity) against `#ffffff`, with an active border highlight in `#3a80e6` and a 3px soft blue glow. Height is standardized to 36px.
- Global filter bar arranges multi-condominium tenant switchers, date ranges, balance thresholds, and full-text search fields into an integrated, horizontal panel directly above data tables.

### Drawers & Slide-Over Panels
- Used for deep editing (e.g., Unit Owner Profiles, Expense Allocation Sheets). Slides from the right edge with a width of 480px or 640px, anchoring action footers (Save, Discard) with a permanent white backdrop and divider border.