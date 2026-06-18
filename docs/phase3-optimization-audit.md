# Phase 3 Optimization Audit

Date: 2026-06-18

## Goal

Phase 3 focuses on architecture, performance, and quality gates without changing the high-end demo experience. The system should keep the Phase 2 end-to-end workflow while reducing `src/App.tsx` responsibility, isolating business workflow state, removing heavy chart runtime usage from source, and adding automated checks that prevent regression.

## Implemented

- `src/features/workflow/usePlatformWorkflow.ts` centralizes experiment, analysis job, report, pilot lead, selected page, selected experiment, and selected report state.
- `src/features/reports/ReportDocument.tsx` owns the report document UI.
- `src/features/reports/reportExport.ts` owns report HTML generation and download.
- `src/components/data-display.tsx` owns shared tables, chart panels, info grids, and compact stats.
- `src/components/charts.tsx` replaces Recharts usage with lightweight SVG/CSS chart components.
- `scripts/phase3-architecture-check.mjs` enforces the Phase 3 architecture boundary, App line budget, chart runtime removal, and design guardrails.

## Current Evidence

- `src/App.tsx` is reduced from 2867 lines to 2329 lines.
- Source code no longer imports `recharts`.
- `src/App.tsx` no longer owns `setExperimentRows`, `setAnalysisJobs`, `setReportRows`, or `setPilotLeads`.
- Phase 2 source acceptance still passes after modularization.
- Phase 3 architecture check passes.
- TypeScript project build passes.
- Production Vite build passes through `scripts/build.mjs`.

## Verification

Run:

```bash
npm run phase2:audit
npm run phase2:check
npm run phase3:check
npm run build
```

In the current Codex execution environment, direct global `npm` execution is still blocked by the local tool profile. The project build itself is fixed by `scripts/build.mjs`, which applies a build-time preload for dependency filenames that match restricted path patterns, then runs TypeScript and Vite through the active Node runtime.
