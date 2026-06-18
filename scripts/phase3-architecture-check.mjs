import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const files = {
  app: "src/App.tsx",
  charts: "src/components/charts.tsx",
  dataDisplay: "src/components/data-display.tsx",
  reportDocument: "src/features/reports/ReportDocument.tsx",
  reportExport: "src/features/reports/reportExport.ts",
  workflow: "src/features/workflow/usePlatformWorkflow.ts",
  build: "scripts/build.mjs",
  buildShim: "scripts/build-permission-shims.cjs",
  packageJson: "package.json",
  readme: "README.md",
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

function collectSourceFiles(dir) {
  const entries = readdirSync(dir);
  const result = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      result.push(...collectSourceFiles(path));
    } else if (/\.(ts|tsx|js|mjs|css)$/.test(entry)) {
      result.push(path);
    }
  }
  return result;
}

const srcText = collectSourceFiles("src")
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const appLines = source.app.split(/\r?\n/).length;

const checks = [
  {
    name: "App entry stays below Phase 3 line budget",
    pass: appLines <= 2400,
    detail: `src/App.tsx has ${appLines} lines; budget is 2400`,
  },
  {
    name: "Workflow state is centralized outside App",
    pass:
      /export function usePlatformWorkflow/.test(source.workflow) &&
      /setExperimentRows/.test(source.workflow) &&
      /setAnalysisJobs/.test(source.workflow) &&
      /setReportRows/.test(source.workflow) &&
      /setPilotLeads/.test(source.workflow) &&
      !/setExperimentRows|setAnalysisJobs|setReportRows|setPilotLeads/.test(source.app),
  },
  {
    name: "Report export is isolated from App",
    pass:
      /export function buildReportHtml/.test(source.reportExport) &&
      /export function downloadReport/.test(source.reportExport) &&
      /from "\.\/features\/reports\/reportExport"/.test(source.app) &&
      !/function buildReportHtml/.test(source.app),
  },
  {
    name: "Report document is a feature module",
    pass:
      /export function ReportDocument/.test(source.reportDocument) &&
      /from "\.\/features\/reports\/ReportDocument"/.test(source.app),
  },
  {
    name: "Reusable data display components are extracted",
    pass:
      /export function ResponsiveTable/.test(source.dataDisplay) &&
      /export function ExperimentTable/.test(source.dataDisplay) &&
      /overflow-x-auto/.test(source.dataDisplay),
  },
  {
    name: "Heavy Recharts runtime is no longer imported by source",
    pass:
      !/recharts/i.test(srcText) &&
      !/from ["']recharts["']/.test(srcText) &&
      !/<(ResponsiveContainer|AreaChart|BarChart|LineChart|PieChart|Tooltip|CartesianGrid|XAxis|YAxis|Area|Bar|Line|Pie|Cell)\b/.test(
        source.app,
      ),
  },
  {
    name: "Lightweight SVG chart layer exists",
    pass:
      /export function DonutChart/.test(source.charts) &&
      /export function AreaTrendChart/.test(source.charts) &&
      /export function GroupedBarChart/.test(source.charts) &&
      /export function LineTrendChart/.test(source.charts),
  },
  {
    name: "Phase 2 gates remain wired",
    pass: /"phase2:audit"/.test(source.packageJson) && /"phase2:check"/.test(source.packageJson),
  },
  {
    name: "Phase 3 gate is documented and wired",
    pass:
      /"phase3:check"/.test(source.packageJson) &&
      /Phase 3/.test(source.readme) &&
      /phase3:check/.test(source.readme),
  },
  {
    name: "Build permission shim is wired into production build",
    pass:
      /"build":\s*"node scripts\/build\.mjs"/.test(source.packageJson) &&
      /build-permission-shims\.cjs/.test(source.build) &&
      /Module\._load/.test(source.buildShim),
  },
  {
    name: "Design guardrails stay enforced in source",
    pass:
      !/tracking-/.test(`${source.app}\n${source.dataDisplay}\n${source.reportDocument}`) &&
      !/text-\[[^\]]*(vw|vh|cqw|cqi)[^\]]*\]/.test(srcText) &&
      existsSync("src/assets/hero-lab.png"),
  },
];

const failures = checks.filter((check) => !check.pass);

if (failures.length) {
  console.error("Phase 3 architecture checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure.name}${failure.detail ? ` (${failure.detail})` : ""}`);
  }
  process.exit(1);
}

console.log(`Phase 3 architecture checks passed (${checks.length} checks).`);
