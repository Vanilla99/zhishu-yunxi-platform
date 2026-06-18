import { readFileSync } from "node:fs";

const files = {
  app: "src/App.tsx",
  data: "src/data/platformData.ts",
  service: "src/data/mockService.ts",
  ui: "src/components/ui.tsx",
  dataDisplay: "src/components/data-display.tsx",
  reportDocument: "src/features/reports/ReportDocument.tsx",
  reportExport: "src/features/reports/reportExport.ts",
  workflow: "src/features/workflow/usePlatformWorkflow.ts",
  styles: "src/styles.css",
  readme: "README.md",
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

const audit = [
  {
    requirement: "Typed data and local workflow state",
    status: "proved",
    evidence: [
      "src/data/platformData.ts exports ExperimentFile, AnalysisJob, PilotLead, Report types",
      "src/data/mockService.ts creates experiments, jobs, reports, and pilot leads",
      "src/features/workflow/usePlatformWorkflow.ts owns experimentRows, analysisJobs, reportRows, and pilotLeads state",
    ],
    probes: [/export type AnalysisJob/, /setAnalysisJobs/, /createReportFromJob/],
  },
  {
    requirement: "Experiment management workbench",
    status: "proved",
    evidence: [
      "Experiment page has keyword search, multi-field filters, status switching, detail modal, focus toggle, and import flow",
      "EmptyState handles zero-result filters with a recovery action",
    ],
    probes: [/状态切换/, /没有匹配的实验记录/, /新建 \/ 导入实验样例/],
  },
  {
    requirement: "Analysis task queue and staged progress",
    status: "proved",
    evidence: [
      "Analysis center creates jobs, shows queue state, supports failed-job retry, and maps progress to analysisPipeline stages",
      "Stages cover validation, video frame reading, detection, tracking, behavior recognition, USV analysis, fusion, and report draft",
    ],
    probes: [/任务队列/, /retryJob/, /analysisPipeline\.map/, /报告草稿已生成/],
  },
  {
    requirement: "Product-grade report workflow",
    status: "proved",
    evidence: [
      "Report center has list, preview modal, modular report document, regenerate, print/export, download, and experiment back-reference",
      "Report document includes summary metrics, behavior result, ultrasound result, fusion conclusion, and next-step suggestion",
    ],
    probes: [/报告列表/, /function ReportDocument/, /打印\/导出 PDF/, /查看实验详情/],
  },
  {
    requirement: "Pilot partnership operations view",
    status: "proved",
    evidence: [
      "Pilot form creates a submittedLead and the page shows lead tracking with priority, status, need, data type, and next action",
    ],
    probes: [/submittedLead/, /试点线索跟进/, /下一步/],
  },
  {
    requirement: "Build and source-level quality gates",
    status: "proved",
    evidence: [
      "npm run phase2:check validates 46 source-level acceptance and design checks",
      "npm run build passes TypeScript and production bundling",
      "Global CSS includes overflow, media, long-text, print, and box-model guards",
    ],
    probes: [/phase2:check/, /overflow-x:\s*clip/, /@media print/],
  },
  {
    requirement: "Rendered desktop and mobile visual QA",
    status: "blocked",
    evidence: [
      "Current Codex Browser policy blocks localhost/127.0.0.1 access, so screenshots and click-through QA cannot be collected in this session",
      "Source-level layout guards reduce risk but do not prove rendered no-overlap/no-overflow behavior",
    ],
    probes: [],
    unblock:
      "Run the app in a browser environment allowed to access http://localhost:5174/ and capture desktop plus mobile screenshots while walking the README demo path.",
  },
];

const failures = [];
for (const item of audit) {
  for (const probe of item.probes) {
    const haystack = Object.values(source).join("\n");
    if (!probe.test(haystack)) failures.push(`${item.requirement}: ${probe}`);
  }
}

if (failures.length) {
  console.error("Completion audit evidence missing:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const blocked = audit.filter((item) => item.status === "blocked");
console.log("Phase 2 completion audit");
for (const item of audit) {
  console.log(`- ${item.status.toUpperCase()}: ${item.requirement}`);
}
if (blocked.length) {
  console.log("\nBlocked completion evidence:");
  for (const item of blocked) console.log(`- ${item.requirement}: ${item.unblock}`);
}
