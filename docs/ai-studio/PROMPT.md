Build a web app based on the attached 'PRD.md' and 'Design.md'.

Requirements:
1. The app is called PaperPass. Write all UI text in Korean, translating the PRD's labels, guide questions, error messages, and empty-state messages faithfully.
2. Do NOT add any Gemini API calls or AI features. AI summaries and AI concept explanations are explicitly Out of Scope in the PRD — the user must write everything themselves.
3. No login, no backend, no external APIs. Store all data in the browser's localStorage so it survives a page reload.
4. Desktop only (viewport width 1280px or wider).
5. Build these 5 screens: (1) Dashboard with the paper list, (2) Add/Edit Paper modal, (3) Paper Detail with Pass 1/2/3 tabs of guide questions and a right-side prerequisite concept panel, (4) Concept Notebook including concept merging, (5) an A4 printable Pass 3 worksheet using @media print.
6. Follow the PRD exactly for the guide questions, input length limits, validation rules, edge cases, and status flow (To Read → Pass 1 Done → Pass 2 Done → Pass 3 Done, plus On Hold).
7. Follow the colors, fonts, and spacing tokens in Design.md. Keep the source badge colors (IEEE blue, arXiv red, Google Scholar green, Other gray) and concept status colors (Unknown orange, Looked up yellow, Understood green).
