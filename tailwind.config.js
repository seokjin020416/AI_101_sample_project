/** @type {import('tailwindcss').Config} */
// Design tokens from docs/design/stitch_paperpass_research_app/academic_precision/DESIGN.md
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: '#ffffff',
        tint: '#eff4ff',
        'tint-strong': '#e5eeff',
        line: '#e2e8f0',
        'line-strong': '#cbd5e1',
        ink: '#0f172a',
        'ink-2': '#334155',
        'ink-3': '#475569',
        'ink-4': '#64748b',
        'ink-5': '#94a3b8',
        primary: { DEFAULT: '#1e293b', hover: '#0f172a' },
        accent: { DEFAULT: '#2563eb', dark: '#0051d5' },
        danger: { DEFAULT: '#ba1a1a', bg: '#ffdad6' },
        src: {
          ieee: '#2563eb', 'ieee-bg': '#dbeafe',
          arxiv: '#dc2626', 'arxiv-bg': '#fee2e2',
          scholar: '#059669', 'scholar-bg': '#d1fae5',
          other: '#475569', 'other-bg': '#f1f5f9',
        },
        st: {
          unknown: '#d97706', 'unknown-bg': '#fef3c7', 'unknown-bd': '#fde68a',
          lookup: '#ca8a04', 'lookup-bg': '#fef9c3', 'lookup-bd': '#fef08a',
          understood: '#16a34a', 'understood-bg': '#dcfce7', 'understood-bd': '#bbf7d0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard Variable', 'Pretendard', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Pretendard Variable', 'Pretendard', 'serif'],
        mono: ['"JetBrains Mono"', 'Pretendard Variable', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        overlay: '0 4px 6px -1px rgba(15,23,42,0.05), 0 10px 15px -3px rgba(15,23,42,0.08)',
      },
      maxWidth: { page: '1440px' },
    },
  },
  plugins: [],
};
