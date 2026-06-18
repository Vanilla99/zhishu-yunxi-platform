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

const checks = [
  ["typed experiment files", source.data, /export type ExperimentFile/],
  ["typed analysis jobs", source.data, /export type AnalysisJob/],
  ["typed pilot leads", source.data, /export type PilotLead/],
  ["weighted analysis pipeline", source.data, /export const analysisPipeline/],
  ["mock experiment import", source.service, /createExperimentFromDraft/],
  ["mock file inference", source.service, /inferExperimentFile/],
  ["mock analysis job", source.service, /createAnalysisJob/],
  ["mock report generation", source.service, /createReportFromJob/],
  ["mock pilot lead", source.service, /createPilotLead/],
  ["workflow experiment state", source.workflow, /setExperimentRows/],
  ["workflow job state", source.workflow, /setAnalysisJobs/],
  ["workflow report state", source.workflow, /setReportRows/],
  ["workflow lead state", source.workflow, /setPilotLeads/],
  ["experiment import modal", source.app, /新建 \/ 导入实验样例/],
  ["experiment status switching", source.app, /状态切换/],
  ["experiment empty state", source.app, /没有匹配的实验记录/],
  ["analysis task queue", source.app, /任务队列/],
  ["analysis retry flow", source.app, /retryJob/],
  ["analysis staged pipeline", source.app, /analysisPipeline\.map/],
  ["generated report handoff", source.app, /报告草稿已生成/],
  ["report list", source.app, /报告列表/],
  ["report document", source.reportDocument, /function ReportDocument/],
  ["report export", source.reportDocument, /打印\/导出 PDF/],
  ["report regenerate", source.reportDocument, /onRegenerate/],
  ["pilot lead tracking", source.app, /试点线索跟进/],
  ["pilot submission state", source.app, /submittedLead/],
  ["shared empty state component", source.ui, /export function EmptyState/],
  ["responsive button sizing", source.ui, /min-h-11/],
  ["buttons prevent icon shrink", source.ui, /shrink-0/],
  ["panels prevent child overflow", source.ui, /min-w-0 rounded/],
  ["safe modal viewport width", source.ui, /w-\[calc\(100vw-2rem\)\]/],
  ["table horizontal overflow guard", source.dataDisplay, /overflow-x-auto/],
  ["mobile navigation exists", source.app, /lg:hidden/],
  ["loading state copy", source.app, /分析进行中/],
  ["failure state copy", source.app, /失败待处理|失败/],
  ["retry action copy", source.app, /重试/],
  ["print stylesheet", source.styles, /@media print/],
  ["global border-box", source.styles, /box-sizing:\s*border-box/],
  ["global horizontal overflow guard", source.styles, /overflow-x:\s*clip/],
  ["long text wrap guard", source.styles, /overflow-wrap:\s*anywhere/],
  ["media max width guard", source.styles, /img,\s*\nsvg,\s*\ncanvas,\s*\nvideo/],
  ["no negative or custom tracking classes", `${source.app}\n${source.ui}\n${source.dataDisplay}\n${source.reportDocument}`, /^(?![\s\S]*tracking-)/],
  ["no viewport-scaled text classes", `${source.app}\n${source.ui}\n${source.dataDisplay}\n${source.reportDocument}\n${source.styles}`, /^(?![\s\S]*text-\[[^\]]*(vw|vh|cqw|cqi)[^\]]*\])/],
  ["phase2 readme path", source.readme, /试点线索跟进/],
  ["phase2 readme import step", source.readme, /新建 \/ 导入样例/],
];

const forbidden = [/比赛/, /评委/, /Demo/, /假数据/];

const pipelineWeight = [...source.data.matchAll(/weight:\s*(\d+)/g)].reduce(
  (sum, match) => sum + Number(match[1]),
  0,
);

checks.push(["analysis pipeline sums to 100", `${pipelineWeight}`, /^100$/]);

const failures = checks
  .filter(([, text, pattern]) => !pattern.test(text))
  .map(([name]) => name);

const forbiddenHits = forbidden
  .filter((pattern) => Object.values(source).some((text) => pattern.test(text)))
  .map((pattern) => pattern.source);

if (failures.length || forbiddenHits.length) {
  if (failures.length) {
    console.error("Phase 2 acceptance checks failed:");
    for (const failure of failures) console.error(`- ${failure}`);
  }
  if (forbiddenHits.length) {
    console.error("Forbidden copy found:");
    for (const hit of forbiddenHits) console.error(`- ${hit}`);
  }
  process.exit(1);
}

console.log(`Phase 2 acceptance checks passed (${checks.length} checks).`);
