---
name: Academic Precision
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
  on-surface-variant: '#45474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#001816'
  on-tertiary: '#ffffff'
  tertiary-container: '#002f2b'
  on-tertiary-container: '#469e95'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#9cf2e8'
  tertiary-fixed-dim: '#80d5cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  source-ieee: '#2563eb'
  source-ieee-bg: '#dbeafe'
  source-arxiv: '#dc2626'
  source-arxiv-bg: '#fee2e2'
  source-scholar: '#059669'
  source-scholar-bg: '#d1fae5'
  source-other: '#475569'
  source-other-bg: '#f1f5f9'
  status-unknown: '#d97706'
  status-unknown-bg: '#fef3c7'
  status-lookup: '#ca8a04'
  status-lookup-bg: '#fef9c3'
  status-understood: '#16a34a'
  status-understood-bg: '#dcfce7'
  pass-step-active: '#0f172a'
  pass-step-complete: '#2563eb'
  pass-step-pending: '#cbd5e1'
  paper-canvas: '#f8fafc'
  paper-surface: '#ffffff'
  paper-border: '#e2e8f0'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 1.375rem
    fontWeight: '500'
    lineHeight: 1.875rem
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  mono-cite:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-split: 2rem
  margin: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system embodies calm academic rigor, analytical clarity, and distraction-free workflow tailored for engineering researchers reading dense literature in signal processing and optical communications. 

### Brand Personality & Emotional Tone
- **Cognitive Serenity:** The workspace functions as an uncluttered cognitive desk. Visual noise is stripped away to preserve the reader's mental bandwidth when decoding dense technical papers.
- **Academic Authority:** Grounded, disciplined, and scholarly. The interface avoids frivolous micro-interactions or playful gamification, treating research with the seriousness of a laboratory notebook.
- **Empowering Progression:** Demystifies literature reading through S. Keshav’s structured 3-Pass method, transforming overwhelming technical papers into manageable milestones.

### Design Movement: Academic Minimalist & Tonal Structure
The system synthesizes Swiss functionalism and modern technical publishing. It relies on crisp typographic hierarchies, precise tabular data structures, subtle neutral slate surfaces, and functional, high-semantic color coding (differentiating scholarly repositories and conceptual comprehension levels). Elevation is achieved primarily through thin, low-contrast structural dividers and tinted surface planes rather than heavy shadows.

## Colors

The color palette centers on a disciplined slate-neutral core that supports long hours of deep reading on desktop displays (1280px+).

### Color Philosophy & Functional Roles
- **Primary (`#1e293b`):** Deep slate navy serves as the primary visual anchor for high-priority actions, active navigation states, and primary titles.
- **Secondary (`#2563eb`):** Scholar blue serves as the intentional focal color for primary hyperlinks, current step completions, and active interactive elements.
- **Tertiary (`#0f766e`):** Academic teal is reserved for supplementary meta-information, research taxonomy tags, and system affirmations.
- **Neutral (`#64748b`):** Muted slate manages secondary typography, supporting field captions, and inactive structural boundaries.

### Semantic Color Coding
1. **Source Badges:**
   - **IEEE Xplore:** Text `#2563eb`, Background `#dbeafe`
   - **arXiv:** Text `#dc2626`, Background `#fee2e2`
   - **Google Scholar:** Text `#059669`, Background `#d1fae5`
   - **Other:** Text `#475569`, Background `#f1f5f9`
2. **Concept Status Tags:**
   - **Unknown (모름):** Text `#d97706`, Background `#fef3c7`, Border `#fde68a`
   - **Looked up (찾아봄):** Text `#ca8a04`, Background `#fef9c3`, Border `#fef08a`
   - **Understood (이해함):** Text `#16a34a`, Background `#dcfce7`, Border `#bbf7d0`
3. **Pass Progress Bar:**
   - Step 1 (Pass 1 - 훑기), Step 2 (Pass 2 - 이해), Step 3 (Pass 3 - 깊이) transition from `pass-step-pending` (`#cbd5e1`) to `pass-step-active` (`#0f172a`) and `pass-step-complete` (`#2563eb`).

## Typography

Typography balances functional UI clarity with scholarly publication heritage.

### Font Hierarchy & Roles
- **Editorial Academic Serifs (`Newsreader`):** Applied exclusively to paper titles, research problem statements, and major reading section headlines (`headline-xl`, `headline-lg`, `headline-md`). This conveys academic authenticity and enhances long-form legibility for paper titles.
- **Analytical Grotesque Sans (`Inter`):** Applied to UI navigation, input forms, guide questions, answers, and summary dashboards. Provides clear readability for bilingual Korean and English technical terms (e.g., IM/DD, Volterra 비선형성).
- **Technical Monospace (`JetBrains Mono`):** Dedicated to technical metadata, citations, formula references (e.g., `Sec. II-B, Eq. (3)`), and publication years. Its tabular spacing ensures precise horizontal alignment in metadata rows.

## Layout & Spacing

The application targets fixed desktop work environments (screen width ≥ 1280px) common in engineering research laboratories.

### Layout Architecture
- **Max Width Container:** Centered at 1440px max width with `2.5rem` outer margins to maintain a focused reading plane.
- **Dual-Panel Workspace (Paper Detail):**
  - **Left / Main Column (68% width):** Houses the 3-Pass guided questions, multi-step navigation, and substantive notes.
  - **Right Panel (32% width, sticky):** Houses the companion concept shelf (`전제 개념 기록`). It remains visible during vertical scrolling so researchers can record unknown terminology without breaking reading flow.
- **Dashboard Grid:** 3-column fluid grid with `1.5rem` gutters at ≥ 1280px, collapsing to 2 columns on intermediate viewports.
- **Print Layout (A4 Worksheet):** Unrolls the dual panel into a clean, single-column vertical flow with rigid 15mm page margins and page-break controls.

## Elevation & Depth

Visual hierarchy relies on structural borders and subtle tonal layering rather than heavy ambient drop shadows, maintaining an ink-on-paper aesthetic suitable for analytical work.

### Depth System
1. **Base Canvas:** Soft off-white neutral (`#f8fafc`).
2. **Surface Container:** Crisp white (`#ffffff`) bordered by `1px solid #e2e8f0`.
3. **Elevated Overlays (Modals & Popovers):** Grounded on pure white with a dual-tier shadow:
   `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 10px 15px -3px rgba(15, 23, 42, 0.08);`
   bordered with `1px solid #cbd5e1`.
4. **Sticky Companion Panel:** Subtle left hairline border (`1px solid #e2e8f0`) with backdrop blur (`backdrop-filter: blur(8px)`) over a semi-translucent white base (`rgba(255, 255, 255, 0.92)`).

## Shapes

The design system adopts a **Soft (1)** shape language with low corner radii (`0.25rem` / 4px base, up to `0.5rem` / 8px for cards and containers).

### Corner Radii Guidelines
- **Badges, Tags, & Citation Tokens:** `rounded-sm` (2px) to `rounded` (4px) to retain technical precision.
- **Input Fields, Textareas, & Buttons:** `rounded` (4px) for firm, professional affordance.
- **Panels, Cards, & Modals:** `rounded-lg` (8px) for cohesive surface containment without playful rounding.
- **Progress Trackers:** Straight linear segments with crisp perpendicular dividers.

## Components

### 1. Buttons
- **Primary:** Solid `#1e293b` with white text, `4px` radius, `0.5rem 1rem` padding, `title-md` font. Hover shifts to `#0f172a`.
- **Secondary / Action:** White background with `#e2e8f0` border, `#334155` text. Hover shifts to `#f8fafc` and `#cbd5e1` border.
- **Ghost / Utility:** Transparent background with `#64748b` text, used for quick inline actions (`+ 개념`, `원문 열기`).

### 2. Source Badges & Concept Tags
- **Source Badges:** Compact inline badge (`mono-cite`), uppercase, `4px` radius, `2px 8px` padding. Styled strictly according to repository source colors (IEEE blue, arXiv red, Scholar green, Other slate).
- **Concept Status Tags:** Two-state interactive badge displaying status dot and label:
  - *Unknown (모름):* Amber tint (`#fef3c7`), border `#fde68a`, dot `#d97706`.
  - *Looked up (찾아봄):* Yellow tint (`#fef9c3`), border `#fef08a`, dot `#ca8a04`.
  - *Understood (이해함):* Emerald tint (`#dcfce7`), border `#bbf7d0`, dot `#16a34a`.

### 3. 3-Step Pass Progress Bar
- Structured horizontally across the top of Paper Cards and the Detail header:
  - **Pass 1 (훑기):** Rapid structural survey.
  - **Pass 2 (이해):** Detailed mechanics.
  - **Pass 3 (깊이):** Assumptions and reproducibility.
- Visual state consists of 3 segmented pills: Completed steps are filled with `#2563eb`; active step is highlighted with `#0f172a` and an underline accent; upcoming steps remain `#e2e8f0`.

### 4. Input Fields & Guided Question Areas
- **Question Prompt:** Set in `title-md` Inter with a small numbering badge (`Q1`, `Q2`).
- **Answer Textarea:** Minimalist inset field (`#ffffff`), `1px solid #cbd5e1` border, expanding vertically with a subtle focus ring (`2px solid #2563eb` with `0px` offset). Placeholder copy provides discipline-specific examples (e.g., *“PAM4 변조, 100Gbps, 2km SSMF...”*).
- **Auto-save Indicator:** Quiet inline feedback near the tab header: `mono-cite` text showing `"저장됨 ✓"` or `"저장 중..."` in `#64748b`.

### 5. Cards & Dual-Panel Shell
- **Paper Card:** `#ffffff` surface, `1px solid #e2e8f0` border, `1.25rem` padding. Features paper title in `headline-md` Newsreader, source badge, authors, citation year in `mono-code`, and unresolved concept pill counts.
- **Right Companion Panel:** Pinned concept drawer containing quick-input fields for term name and contextual locator (e.g., `Sec. III-A, Fig. 2`), followed by the scrollable list of recorded concepts.

### 6. Print-Friendly A4 Worksheet (`@media print`)
- Strips all buttons, navigation bars, and background colors.
- Enforces strict high-contrast black typography (`#000000`) on white.
- Generates guided boxed spaces with dotted underlines for physical handwriting notes.
- Automatically inserts page breaks between Pass 2 summary and Pass 3 deep-dive sections.