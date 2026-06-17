import { readFileSync } from "node:fs";

const files = {
  app: "src/App.tsx",
  data: "src/data/platformData.ts",
  service: "src/data/mockService.ts",
  ui: "src/components/ui.tsx",
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
  ["top-level experiment state", source.app, /setExperimentRows/],
  ["top-level job state", source.app, /setAnalysisJobs/],
  ["top-level report state", source.app, /setReportRows/],
  ["top-level lead state", source.app, /setPilotLeads/],
  ["experiment import modal", source.app, /新建 \/ 导入实验样例/],
  ["experiment status switching", source.app, /状态切换/],
  ["experiment empty state", source.app, /没有匹配的实验记录/],
  ["analysis task queue", source.app, /任务队列/],
  ["analysis retry flow", source.app, /retryJob/],
  ["analysis staged pipeline", source.app, /analysisPipeline\.map/],
  ["generated report handoff", source.app, /报告草稿已生成/],
  ["report list", source.app, /报告列表/],
  ["report document", source.app, /function ReportDocument/],
  ["report export", source.app, /打印\/导出 PDF/],
  ["report regenerate", source.app, /onRegenerate/],
  ["pilot lead tracking", source.app, /试点线索跟进/],
  ["pilot submission state", source.app, /submittedLead/],
  ["shared empty state component", source.ui, /export function EmptyState/],
  ["responsive button sizing", source.ui, /min-h-11/],
  ["phase2 readme path", source.readme, /试点线索跟进/],
  ["phase2 readme import step", source.readme, /新建 \/ 导入样例/],
];

const forbidden = [/比赛/, /评委/, /Demo/, /假数据/];

const pipelineWeight = [...source.data.matchAll(/weight:\s*(\d+)/g)].reduce(
  (sum, match) => sum + Number(match[1]),
  0,
);

if (pipelineWeight !== 100) {
  checks.push(["analysis pipeline sums to 100", `${pipelineWeight}`, /^100$/]);
}

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
