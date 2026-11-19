# CLAUDE.md

PaperPass — 3-pass paper reading notebook for beginner researchers (course project, *Introduction to AI*).

## Source of truth
- **`docs/PRD.md`** defines what to build. Work from it.
- **Do not implement anything listed in PRD §6 "Out of Scope"** (login, sync, PDF viewer, external APIs, AI summaries, notifications, sharing, mobile layout, JSON backup) unless the user explicitly asks to move it into scope.
- Design: `docs/design/` (Google Stitch export). Tokens are in `docs/design/stitch_paperpass_research_app/academic_precision/DESIGN.md` and mirrored in `tailwind.config.js`.
- UI copy is Korean; error/empty-state messages follow PRD §5 wording.

## Stack
- Vite + React 18 + TypeScript + Tailwind CSS 3, react-router (BrowserRouter; `vercel.json` rewrites all paths to `index.html`).
- No backend. All data lives in `localStorage` under key `paperpass:v1` (see `src/lib/store.tsx`, saved 1 s after the last change).
- Desktop only (min width 1280px). Print layout for the pass-3 worksheet uses `@media print` + `@page A4`.

## Layout
- `src/lib/logic.ts` — pure data operations (validation, status rules, concept matching/merging, filters). Keep business rules here and unit-test them in `logic.test.ts`.
- `src/lib/guide.ts` — 3-pass guide questions (PRD §3).
- `src/lib/store.tsx` — state, persistence, toasts.
- `src/pages/` — Dashboard, PaperDetail, ConceptNotebook, PrintWorksheet. `src/components/` — layout, modal, shared UI.

## Commands
- `npm run dev` — dev server
- `npm test` — unit tests (vitest)
- `npm run build` — type-check + production build
