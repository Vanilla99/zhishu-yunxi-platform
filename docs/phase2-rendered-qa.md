# Phase 2 Rendered QA

Date: 2026-06-18

## Environment

- Server: `npm run preview -- --port 5174 --strictPort`
- URL: `http://localhost:5174/`
- Browser: headless Chromium through Playwright
- Desktop viewport: `1440 x 1100`
- Mobile viewport: `390 x 844`

## Walked Path

1. Home
2. Dashboard
3. Experiment management and import modal
4. Analysis center and running task state
5. Report center
6. Pilot application and lead tracking

## Results

- Desktop and mobile pages returned no console errors and no page errors.
- Desktop and mobile pages had `horizontalOverflow: 0` at the document/body level.
- Report center rendered export actions: `打印/导出 PDF` / `下载报告`.
- Pilot page rendered `试点线索跟进`.
- Internal table containers intentionally provide horizontal scrolling on mobile; this is expected for dense scientific data tables and did not create page-level overflow.
- The mobile analysis page was visually inspected from `/private/tmp/zhishu-mobile-analysis.png`; layout, cards, navigation, progress stages, charts, and report actions remained coherent at `390px` width.

## Screenshot Artifacts

Screenshots were generated during this QA run under `/private/tmp`:

- `/private/tmp/zhishu-desktop-home.png`
- `/private/tmp/zhishu-desktop-reports.png`
- `/private/tmp/zhishu-desktop-pilot.png`
- `/private/tmp/zhishu-mobile-home.png`
- `/private/tmp/zhishu-mobile-reports.png`
- `/private/tmp/zhishu-mobile-pilot.png`
- `/private/tmp/zhishu-mobile-analysis.png`
