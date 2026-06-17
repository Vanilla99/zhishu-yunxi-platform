import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  AudioWaveform,
  BadgeCheck,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Microscope,
  MousePointer2,
  Network,
  PanelRightOpen,
  Play,
  Plus,
  Printer,
  RefreshCcw,
  Route,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Star,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import heroImage from "./assets/hero-lab.png";
import {
  analysisPipeline,
  analysisTasks,
  behaviorDistribution,
  behaviorSegments,
  capabilities,
  completionTrend,
  concentrationRelation,
  dashboardMetrics,
  dataTypeShare,
  dataTypes,
  experiments,
  initialAnalysisJobs,
  initialPilotLeads,
  navItems,
  painPoints,
  pilotMethods,
  pilotTargets,
  reports,
  reportSummary,
  reportTypes,
  scenarios,
  ultrasoundSegments,
  ultrasoundTrend,
  waveformData,
  type AnalysisJob,
  type Experiment,
  type ExperimentFile,
  type PageKey,
  type PilotLead,
  type Report,
} from "./data/platformData";
import {
  createAnalysisJob,
  createExperimentFromDraft,
  createPilotLead,
  createReportFromJob,
  formatNow,
  getStageProgress,
  inferExperimentFile,
} from "./data/mockService";
import { cn } from "./lib/utils";
import {
  Button,
  DownloadButton,
  EmptyVideoFrame,
  MetricCard,
  Modal,
  MotionBlock,
  Panel,
  Pill,
  ProgressLine,
  SectionTitle,
  SelectShell,
  Spectrogram,
  StatusBadge,
} from "./components/ui";

const tooltipStyle = {
  borderRadius: "18px",
  border: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
};

const showcasePath: Array<{ key: PageKey; label: string; caption: string }> = [
  { key: "dashboard", label: "数据驾驶舱", caption: "锁定重点实验" },
  { key: "experiments", label: "实验详情", caption: "复核数据与文件" },
  { key: "analysis", label: "智能分析", caption: "生成融合结论" },
  { key: "reports", label: "报告预览", caption: "导出正式材料" },
  { key: "pilot", label: "合作试点", caption: "提交合作意向" },
];

function getReportForExperiment(experimentId: string, reportRows: Report[]) {
  return (
    reportRows.find((report) => report.experimentId === experimentId) ??
    reportRows[0] ??
    reports[0]
  );
}

function buildReportHtml(report: Report, experiment: Experiment) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${report.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0a1020; margin: 40px; line-height: 1.75; }
    header { border-bottom: 1px solid #dbe4ef; padding-bottom: 20px; margin-bottom: 24px; }
    h1 { font-size: 28px; margin: 0 0 12px; }
    h2 { font-size: 18px; margin-top: 28px; }
    .meta { color: #64748b; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .box { border: 1px solid #dbe4ef; border-radius: 8px; padding: 14px; background: #f8fafc; }
    .label { color: #64748b; font-size: 12px; margin: 0 0 4px; }
    .value { font-weight: 700; margin: 0; }
  </style>
</head>
<body>
  <header>
    <p class="meta">智鼠云析 · 小鼠行为智能分析与药物助研系统</p>
    <h1>${report.name}</h1>
    <p class="meta">报告编号 ${report.id} · 生成时间 ${report.generatedAt}</p>
  </header>
  <section class="grid">
    <div class="box"><p class="label">实验编号</p><p class="value">${experiment.id}</p></div>
    <div class="box"><p class="label">实验类型</p><p class="value">${experiment.type}</p></div>
    <div class="box"><p class="label">数据类型</p><p class="value">${experiment.dataType}</p></div>
    <div class="box"><p class="label">行为结论</p><p class="value">${report.conclusion}</p></div>
  </section>
  <h2>多模态融合结论</h2>
  <p>视频行为识别结果显示，${experiment.mouseId} 在当前实验条件下的静止片段持续时间增加，行走轨迹覆盖面积下降；超声波分析显示叫声密度与平均功率同步下降。融合模型综合判断药物干预后行为活跃度下降，融合置信度为 93%。</p>
  <h2>辅助建议</h2>
  <p>建议对 00:06:03-00:06:47 的追逐片段进行人工复核，并在相同剂量下补充 2 组重复实验。</p>
</body>
</html>`;
}

function downloadReport(report: Report, experimentRows: Experiment[]) {
  const experiment =
    experimentRows.find((item) => item.id === report.experimentId) ?? experiments[0];
  const blob = new Blob([buildReportHtml(report, experiment)], {
    type: "text/html;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${report.id}-${experiment.id}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

type AppState = {
  page: PageKey;
  selectedExperimentId: string;
  selectedReportId: string;
};

export default function App() {
  const [experimentRows, setExperimentRows] = useState<Experiment[]>(() => experiments);
  const [reportRows, setReportRows] = useState<Report[]>(() => reports);
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>(() => initialAnalysisJobs);
  const [pilotLeads, setPilotLeads] = useState<PilotLead[]>(() => initialPilotLeads);
  const [state, setState] = useState<AppState>({
    page: "home",
    selectedExperimentId: experiments[0].id,
    selectedReportId: reports[0].id,
  });
  const [analysisSignal, setAnalysisSignal] = useState({
    completedExperimentId: experiments[0].id,
    generatedReportId: reports[0].id,
  });

  const navigate = (page: PageKey) => {
    setState((current) => ({ ...current, page }));
  };

  const selectExperiment = (experimentId: string, page?: PageKey) => {
    const relatedReport = getReportForExperiment(experimentId, reportRows);
    setState((current) => ({
      ...current,
      selectedExperimentId: experimentId,
      selectedReportId: relatedReport.id,
      page: page ?? current.page,
    }));
  };

  const selectReport = (reportId: string, page?: PageKey) => {
    const relatedReport = reportRows.find((item) => item.id === reportId);
    setState((current) => ({
      ...current,
      selectedReportId: reportId,
      selectedExperimentId: relatedReport?.experimentId ?? current.selectedExperimentId,
      page: page ?? current.page,
    }));
  };

  const openReportForExperiment = (experimentId: string) => {
    const relatedReport = getReportForExperiment(experimentId, reportRows);
    setState((current) => ({
      ...current,
      selectedExperimentId: experimentId,
      selectedReportId: relatedReport.id,
      page: "reports",
    }));
  };

  const importExperiment = (draft: Parameters<typeof createExperimentFromDraft>[0], files: ExperimentFile[]) => {
    const experiment = createExperimentFromDraft(draft, files, experimentRows.length);
    setExperimentRows((current) => [experiment, ...current]);
    setState((current) => ({
      ...current,
      selectedExperimentId: experiment.id,
      page: "experiments",
    }));
    return experiment;
  };

  const upsertAnalysisJob = (job: AnalysisJob) => {
    setAnalysisJobs((current) => {
      const exists = current.some((item) => item.id === job.id);
      return exists
        ? current.map((item) => (item.id === job.id ? job : item))
        : [job, ...current];
    });
  };

  const completeAnalysisJob = (job: AnalysisJob) => {
    const experiment =
      experimentRows.find((item) => item.id === job.experimentId) ?? experimentRows[0];
    const report = createReportFromJob(job, experiment, reportRows);
    const completedJob: AnalysisJob = {
      ...job,
      status: "已完成",
      progress: 100,
      currentStage: "report",
      reportId: report.id,
      updatedAt: report.generatedAt,
      failureReason: undefined,
    };

    setAnalysisJobs((current) =>
      current.map((item) => (item.id === job.id ? completedJob : item)),
    );
    setReportRows((current) => [report, ...current.filter((item) => item.id !== report.id)]);
    setExperimentRows((current) =>
      current.map((item) =>
        item.id === job.experimentId
          ? {
              ...item,
              status: "已完成",
              reportReady: true,
              confidence: Math.max(item.confidence, report.score),
              lastAnalysis: report.generatedAt,
              keyFinding: report.conclusion,
            }
          : item,
      ),
    );
    setAnalysisSignal({
      completedExperimentId: job.experimentId,
      generatedReportId: report.id,
    });
    setState((current) => ({
      ...current,
      selectedExperimentId: job.experimentId,
      selectedReportId: report.id,
    }));
  };

  const retryAnalysisJob = (jobId: string) => {
    setAnalysisJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "排队中",
              progress: 0,
              currentStage: "validate",
              failureReason: undefined,
            }
          : job,
      ),
    );
  };

  const addPilotLead = (draft: Parameters<typeof createPilotLead>[0]) => {
    const lead = createPilotLead(draft, pilotLeads.length);
    setPilotLeads((current) => [lead, ...current]);
    return lead;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.page]);

  const activeExperiment =
    experimentRows.find((item) => item.id === state.selectedExperimentId) ??
    experimentRows[0];
  const activeReport =
    reportRows.find((item) => item.id === state.selectedReportId) ?? reportRows[0];

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-ink antialiased">
      <TopNav active={state.page} onNavigate={navigate} />
      <main>
        {state.page === "home" ? (
          <HomePage onNavigate={navigate} />
        ) : null}
        {state.page === "dashboard" ? (
          <DashboardPage
            experiments={experimentRows}
            jobs={analysisJobs}
            onNavigate={navigate}
            onSelectExperiment={selectExperiment}
          />
        ) : null}
        {state.page === "experiments" ? (
          <ExperimentsPage
            experiments={experimentRows}
            onNavigate={navigate}
            onSelectExperiment={selectExperiment}
            onImportExperiment={importExperiment}
          />
        ) : null}
        {state.page === "analysis" ? (
          <AnalysisPage
            activeExperiment={activeExperiment}
            experiments={experimentRows}
            jobs={analysisJobs}
            onSelectExperiment={selectExperiment}
            onNavigate={navigate}
            onCreateJob={(tasks) => createAnalysisJob(activeExperiment, tasks)}
            onUpsertJob={upsertAnalysisJob}
            onCompleteJob={completeAnalysisJob}
            onRetryJob={retryAnalysisJob}
            onOpenReport={openReportForExperiment}
            generatedReportId={analysisSignal.generatedReportId}
          />
        ) : null}
        {state.page === "reports" ? (
          <ReportsPage
            activeReport={activeReport}
            reports={reportRows}
            experiments={experimentRows}
            onSelectReport={selectReport}
            onSelectExperiment={selectExperiment}
            onNavigate={navigate}
            generatedReportId={analysisSignal.generatedReportId}
          />
        ) : null}
        {state.page === "pilot" ? (
          <PilotPage
            leads={pilotLeads}
            onCreateLead={addPilotLead}
            onNavigate={navigate}
          />
        ) : null}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

function TopNav({
  active,
  onNavigate,
}: {
  active: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print fixed left-0 right-0 top-0 z-30 border-b border-white/60 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 rounded-full pr-3 text-left"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white shadow-glow">
            <MousePointer2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-ink">
              智鼠云析
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">
              多模态小鼠行为智能分析
            </span>
          </span>
        </button>

        <nav className="hidden items-center rounded-full border border-slate-200/70 bg-white/70 p-1 shadow-sm lg:flex">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active === item.key
                  ? "bg-ink text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" icon={BellRing}>
            通知
          </Button>
          <Button size="sm" icon={Sparkles} onClick={() => onNavigate("analysis")}>
            发起分析
          </Button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
          className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-2xl px-4 py-3 text-left text-sm font-semibold",
                  active === item.key
                    ? "bg-ink text-white"
                    : "bg-slate-50 text-slate-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PageFrame({
  children,
  title,
  description,
  eyebrow,
  action,
  demoStep,
  onNavigate,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  eyebrow: string;
  action?: React.ReactNode;
  demoStep?: PageKey;
  onNavigate?: (page: PageKey) => void;
}) {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_18%_12%,rgba(94,234,212,0.2),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(72,101,255,0.16),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl">
        <SectionTitle
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={action}
        />
        {demoStep && onNavigate ? (
          <ShowcasePath active={demoStep} onNavigate={onNavigate} />
        ) : null}
        {children}
      </div>
    </section>
  );
}

function ShowcasePath({
  active,
  onNavigate,
}: {
  active: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  const activeIndex = showcasePath.findIndex((item) => item.key === active);

  return (
    <Panel tight className="mb-5 bg-white/72">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
        <Route className="h-4 w-4" />
        演示路径
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {showcasePath.map((item, index) => {
          const done = index < activeIndex;
          const current = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "min-h-[74px] rounded-lg border px-3 py-3 text-left transition",
                current
                  ? "border-blue-300 bg-blue-50 text-blue-800 shadow-sm"
                  : done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/70",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{item.label}</span>
                {done ? <CheckCircle2 className="h-4 w-4" /> : null}
              </span>
              <span className="mt-1 block text-xs leading-5 opacity-75">
                {item.caption}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[84vh] px-4 pt-20 sm:px-6 lg:px-8">
        <img
          src={heroImage}
          alt="智鼠云析科研影像主视觉"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,248,252,0.96)_0%,rgba(245,248,252,0.84)_54%,rgba(245,248,252,0.98)_100%)] md:bg-[linear-gradient(90deg,rgba(245,248,252,0.98)_0%,rgba(245,248,252,0.82)_37%,rgba(245,248,252,0.18)_70%,rgba(245,248,252,0.06)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f5f8fc] to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(84vh-5rem)] max-w-7xl items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionBlock>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              多模态感知 · 行为识别 · 药物助研
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl lg:text-7xl">
              智鼠云析
            </h1>
            <p className="mt-5 max-w-2xl text-2xl font-medium leading-tight text-slate-800 sm:text-3xl">
              多模态感知驱动的小鼠行为智能分析平台
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              将普通视频、红外视频、超声波信号与实验信息表统一到一套智能分析流程中，辅助科研团队更快获得可信、可复核、可导出的行为学结论。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" icon={ArrowRight} onClick={() => onNavigate("dashboard")}>
                进入平台
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={FileText}
                onClick={() => onNavigate("reports")}
              >
                查看样例报告
              </Button>
              <Button
                size="lg"
                variant="outline"
                icon={MessageSquareText}
                onClick={() => onNavigate("pilot")}
              >
                申请试点
              </Button>
            </div>
          </MotionBlock>

          <MotionBlock delay={0.16} className="hidden lg:block">
            <Panel className="ml-auto max-w-md bg-white/84">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Live Analysis
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">
                    融合置信度 93%
                  </h3>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
                  <BrainCircuit className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {["视频检测", "超声波特征", "时序融合"].map((label, index) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className="text-slate-500">{91 + index * 2}%</span>
                    </div>
                    <ProgressLine value={91 + index * 2} />
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {["嗅探", "静止", "追逐"].map((label, index) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100"
                  >
                    <p className="text-lg font-semibold text-ink">
                      {[42, 38, 20][index]}%
                    </p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </MotionBlock>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Scientific workflow"
            title="从观察到结论，压缩行为学分析链路"
            description="面向医学院实验室、药企临床前研究中心、神经科学团队和 CRO 机构，提供更稳定的行为识别、声学预测和报告生成体验。"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((item, index) => (
              <MotionBlock key={item.title} delay={index * 0.05}>
                <Panel className="h-full">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </Panel>
              </MotionBlock>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Core capability"
            title="围绕小鼠行为实验构建的八项核心能力"
            description="视觉、声学、时序与药物信息被统一为一套可解释的分析结果，适合科研复盘、试点合作和报告沉淀。"
            action={
              <Button icon={Play} onClick={() => onNavigate("analysis")}>
                体验智能分析
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => (
              <Panel key={item.title} className="group overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-ink group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xl font-semibold text-blue-600">
                    {item.value}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {item.title}
                </h3>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-ink p-6 text-white shadow-glow md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Application scenarios
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                面向真实科研场景，而不是通用视频识别工具
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                通过统一数据结构、行为时间轴、模型置信度和报告模板，让不同团队能在同一套平台里快速协作。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario}
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white/90"
                >
                  {scenario}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardPage({
  experiments,
  jobs,
  onNavigate,
  onSelectExperiment,
}: {
  experiments: Experiment[];
  jobs: AnalysisJob[];
  onNavigate: (page: PageKey) => void;
  onSelectExperiment: (experimentId: string, page?: PageKey) => void;
}) {
  const runningJobs = jobs.filter((job) => job.status === "运行中" || job.status === "排队中");
  const failedJobs = jobs.filter((job) => job.status === "失败");
  const completedJobs = jobs.filter((job) => job.status === "已完成");

  return (
    <PageFrame
      eyebrow="Data cockpit"
      title="数据驾驶舱"
      description="集中查看实验规模、数据结构、任务完成趋势和重点实验状态，为科研团队提供可扫描的全局态势。"
      demoStep="dashboard"
      onNavigate={onNavigate}
      action={
        <Button icon={Plus} onClick={() => onNavigate("analysis")}>
          新建分析任务
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <Panel className="bg-ink text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                Operations cockpit
              </p>
              <h3 className="mt-3 text-2xl font-semibold">运行态摘要</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                从实验导入、任务排队、模型分析到报告生成，平台用同一套状态跟踪每个节点。
              </p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-ink">
              <LayoutDashboard className="h-6 w-6" />
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["运行 / 排队", `${runningJobs.length}`],
              ["失败待处理", `${failedJobs.length}`],
              ["完成任务", `${completedJobs.length}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-sm text-slate-300">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-ink">最近分析任务</h3>
              <p className="mt-1 text-sm text-slate-500">
                点击重点实验可继续复核或生成报告。
              </p>
            </div>
            <Button size="sm" variant="outline" icon={Play} onClick={() => onNavigate("analysis")}>
              查看队列
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {jobs.slice(0, 4).map((job) => {
              const experiment = experiments.find((item) => item.id === job.experimentId);
              return (
                <button
                  key={job.id}
                  onClick={() => onSelectExperiment(job.experimentId, "analysis")}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {experiment?.mouseId ?? job.experimentId} · {job.updatedAt}
                      </p>
                    </div>
                    <StatusBadge status={job.status} pulse={job.status === "运行中"} />
                  </div>
                  <div className="mt-4">
                    <ProgressLine value={job.progress} />
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ChartPanel title="行为类型分布" icon={Activity}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={behaviorDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={108}
                paddingAngle={4}
                isAnimationActive={false}
              >
                {behaviorDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {behaviorDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="超声波活跃趋势" icon={AudioWaveform}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={ultrasoundTrend}>
              <defs>
                <linearGradient id="active" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="density" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="active"
                name="活跃指数"
                stroke="#2563eb"
                fill="url(#active)"
                strokeWidth={3}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="density"
                name="叫声密度"
                stroke="#14b8a6"
                fill="url(#density)"
                strokeWidth={3}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="药物浓度与行为频次关系" icon={FlaskConical}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={concentrationRelation}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis
                dataKey="concentration"
                tickLine={false}
                axisLine={false}
                label={{ value: "浓度 μM", position: "insideBottom", offset: -5 }}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="frequency"
                name="行为频次"
                radius={[12, 12, 0, 0]}
                fill="#2563eb"
                isAnimationActive={false}
              />
              <Bar
                dataKey="activity"
                name="活跃度"
                radius={[12, 12, 0, 0]}
                fill="#14b8a6"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="任务完成与报告趋势" icon={LayoutDashboard}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrend}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="completed"
                name="完成任务"
                stroke="#4865ff"
                strokeWidth={3}
                dot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="reports"
                name="生成报告"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <Panel className="mt-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink">重点实验列表</h3>
            <p className="mt-1 text-sm text-slate-500">
              点击操作可进入实验详情、发起智能分析或生成报告。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dataTypeShare.map((item) => (
              <Pill key={item.name}>{item.name} {item.value}%</Pill>
            ))}
          </div>
        </div>
        <ExperimentTable
          experiments={experiments.filter((item) => item.focus || item.status !== "待分析")}
          compact
          onView={(id) => onSelectExperiment(id, "experiments")}
          onAnalyze={(id) => onSelectExperiment(id, "analysis")}
          onReport={(id) => onSelectExperiment(id, "reports")}
        />
      </Panel>
    </PageFrame>
  );
}

function ExperimentsPage({
  experiments,
  onNavigate,
  onSelectExperiment,
  onImportExperiment,
}: {
  experiments: Experiment[];
  onNavigate: (page: PageKey) => void;
  onSelectExperiment: (experimentId: string, page?: PageKey) => void;
  onImportExperiment: (
    draft: Parameters<typeof createExperimentFromDraft>[0],
    files: ExperimentFile[],
  ) => Experiment;
}) {
  const [filters, setFilters] = useState({
    type: "全部实验类型",
    dataType: "全部数据类型",
    drug: "全部药物",
    sex: "全部性别",
    report: "全部报告状态",
  });
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Experiment | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importedFiles, setImportedFiles] = useState<ExperimentFile[]>([]);
  const importFileInput = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<Parameters<typeof createExperimentFromDraft>[0]>({
    label: "新导入药物反应样例",
    type: "药物影响评估",
    mouseId: "M-NX45",
    sex: "雄性",
    drug: "候选化合物 C",
    dose: "3.0 mg/kg",
    concentration: "8 μM",
    dataType: "普通视频 + 红外视频 + 超声波",
    behavior: "行走 / 嗅探",
    owner: "演示实验室",
  });
  const [focusedIds, setFocusedIds] = useState(
    experiments.filter((item) => item.focus).map((item) => item.id),
  );

  const filtered = useMemo(() => {
    return experiments.filter((item) => {
      const keywordHit =
        !keyword ||
        [item.id, item.label, item.mouseId, item.drug, item.behavior]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase());
      const typeHit = filters.type === "全部实验类型" || item.type === filters.type;
      const dataTypeHit =
        filters.dataType === "全部数据类型" ||
        item.dataType.includes(filters.dataType.replace("文件", ""));
      const drugHit = filters.drug === "全部药物" || item.drug === filters.drug;
      const sexHit = filters.sex === "全部性别" || item.sex === filters.sex;
      const reportHit =
        filters.report === "全部报告状态" ||
        (filters.report === "已生成报告" ? item.reportReady : !item.reportReady);
      return keywordHit && typeHit && dataTypeHit && drugHit && sexHit && reportHit;
    });
  }, [filters, keyword]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleFocus = (id: string) => {
    setFocusedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const updateDraft = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addSampleFiles = () => {
    setImportedFiles([
      {
        id: "FILE-SAMPLE-VIDEO",
        name: "compound-c-main-video.mp4",
        size: "2.8 GB",
        type: "普通视频",
        status: "上传完成",
      },
      {
        id: "FILE-SAMPLE-INFRA",
        name: "compound-c-infrared.mov",
        size: "1.9 GB",
        type: "红外视频",
        status: "上传完成",
      },
      {
        id: "FILE-SAMPLE-USV",
        name: "compound-c-usv.wav",
        size: "512 MB",
        type: "超声波音频",
        status: "上传完成",
      },
      {
        id: "FILE-SAMPLE-PROFILE",
        name: "compound-c-profile.xlsx",
        size: "1.4 MB",
        type: "实验信息表",
        status: "上传完成",
      },
    ]);
  };

  const handleImportFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setImportedFiles(Array.from(fileList).map(inferExperimentFile));
  };

  const submitImport = () => {
    const experiment = onImportExperiment(
      draft,
      importedFiles.length ? importedFiles : [
        {
          id: "FILE-FALLBACK-VIDEO",
          name: "new-experiment-main.mp4",
          size: "2.1 GB",
          type: "普通视频",
          status: "上传完成",
        },
        {
          id: "FILE-FALLBACK-USV",
          name: "new-experiment-usv.wav",
          size: "386 MB",
          type: "超声波音频",
          status: "上传完成",
        },
      ],
    );
    setFocusedIds((current) => [experiment.id, ...current]);
    setDetail(experiment);
    setImportOpen(false);
  };

  return (
    <PageFrame
      eyebrow="Experiment samples"
      title="实验样例管理"
      description="以实验为中心管理视频、红外、超声波和实验信息表，支持筛选、详情复核、重点关注、分析任务和报告入口。"
      demoStep="experiments"
      onNavigate={onNavigate}
      action={
        <Button icon={UploadCloud} onClick={() => setImportOpen(true)}>
          新建 / 导入样例
        </Button>
      }
    >
      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_repeat(5,1fr)]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">
              关键词
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索实验编号、小鼠、药物或行为"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400"
              />
            </div>
          </label>
          <SelectShell
            label="实验类型"
            value={filters.type}
            onChange={(value) => updateFilter("type", value)}
            options={["全部实验类型", ...Array.from(new Set(experiments.map((item) => item.type)))]}
          />
          <SelectShell
            label="数据类型"
            value={filters.dataType}
            onChange={(value) => updateFilter("dataType", value)}
            options={["全部数据类型", ...dataTypes]}
          />
          <SelectShell
            label="药物类型"
            value={filters.drug}
            onChange={(value) => updateFilter("drug", value)}
            options={["全部药物", ...Array.from(new Set(experiments.map((item) => item.drug)))]}
          />
          <SelectShell
            label="小鼠性别"
            value={filters.sex}
            onChange={(value) => updateFilter("sex", value)}
            options={["全部性别", "雄性", "雌性"]}
          />
          <SelectShell
            label="报告状态"
            value={filters.report}
            onChange={(value) => updateFilter("report", value)}
            options={["全部报告状态", "已生成报告", "未生成报告"]}
          />
        </div>
      </Panel>

      <Panel className="mt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-ink">实验列表</h3>
            <p className="text-sm text-slate-500">当前显示 {filtered.length} 条实验记录</p>
          </div>
          <Button variant="outline" icon={RefreshCcw}>
            同步记录
          </Button>
        </div>
        <ExperimentTable
          experiments={filtered.map((item) => ({
            ...item,
            focus: focusedIds.includes(item.id),
          }))}
          onView={(id) => setDetail(experiments.find((item) => item.id === id) ?? null)}
          onAnalyze={(id) => onSelectExperiment(id, "analysis")}
          onReport={(id) => {
            onSelectExperiment(id);
            onNavigate("reports");
          }}
          onFocus={toggleFocus}
        />
      </Panel>

      <Modal
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.label ?? "实验详情"}
        description={detail?.id}
        width="max-w-5xl"
      >
        {detail ? (
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel className="bg-slate-50/80">
              <h4 className="font-semibold text-ink">实验基础信息</h4>
              <InfoGrid
                items={[
                  ["实验类型", detail.type],
                  ["小鼠编号", detail.mouseId],
                  ["小鼠性别", detail.sex],
                  ["注射药物", detail.drug],
                  ["注射剂量", detail.dose],
                  ["药物浓度", detail.concentration],
                  ["数据类型", detail.dataType],
                  ["实验时长", detail.duration],
                ]}
              />
            </Panel>
            <div className="space-y-5">
              <Panel>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-ink">历史分析记录</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {detail.keyFinding}
                    </p>
                  </div>
                  <StatusBadge status={detail.status} pulse={detail.status === "分析中"} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="最近分析时间" value={detail.lastAnalysis} />
                  <MiniStat label="模型置信度" value={detail.confidence ? `${detail.confidence}%` : "待分析"} />
                  <MiniStat label="报告记录" value={detail.reportReady ? "已生成" : "未生成"} />
                </div>
              </Panel>
              <Panel>
                <h4 className="font-semibold text-ink">文件信息</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["普通视频", "behavior-main.mp4", "2.4 GB"],
                    ["超声波音频", "usv-track.wav", "438 MB"],
                    ["实验信息表", "experiment-profile.xlsx", "1.2 MB"],
                  ].map(([type, name, size]) => (
                    <div
                      key={type}
                      className="rounded-2xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-xs font-semibold text-blue-600">{type}</p>
                      <p className="mt-2 truncate text-sm font-semibold text-ink">{name}</p>
                      <p className="mt-1 text-xs text-slate-500">{size}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    icon={Play}
                    onClick={() => onSelectExperiment(detail.id, "analysis")}
                  >
                    发起智能分析
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Activity}
                    onClick={() => onSelectExperiment(detail.id, "analysis")}
                  >
                    查看行为时间轴
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FileText}
                    onClick={() => onSelectExperiment(detail.id, "reports")}
                  >
                    生成报告
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="新建 / 导入实验样例"
        description="模拟真实接入流程：填写实验信息、上传文件、生成待分析实验记录。"
        width="max-w-5xl"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
          <Panel className="bg-slate-50/80">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="实验标签"
                value={draft.label}
                onChange={(value) => updateDraft("label", value)}
              />
              <SelectShell
                label="实验类型"
                value={draft.type}
                onChange={(value) => updateDraft("type", value)}
                options={["药物影响评估", "神经行为实验", "行为识别", "药物浓度实验", "多模态融合分析"]}
              />
              <Field
                label="小鼠编号"
                value={draft.mouseId}
                onChange={(value) => updateDraft("mouseId", value)}
              />
              <SelectShell
                label="小鼠性别"
                value={draft.sex}
                onChange={(value) => updateDraft("sex", value as "雄性" | "雌性")}
                options={["雄性", "雌性"]}
              />
              <Field
                label="药物名称"
                value={draft.drug}
                onChange={(value) => updateDraft("drug", value)}
              />
              <Field
                label="注射剂量"
                value={draft.dose}
                onChange={(value) => updateDraft("dose", value)}
              />
              <Field
                label="药物浓度"
                value={draft.concentration}
                onChange={(value) => updateDraft("concentration", value)}
              />
              <SelectShell
                label="数据类型"
                value={draft.dataType}
                onChange={(value) => updateDraft("dataType", value)}
                options={[
                  "普通视频",
                  "红外视频",
                  "超声波音频",
                  "普通视频 + 超声波",
                  "普通视频 + 红外视频 + 超声波",
                ]}
              />
              <Field
                label="目标行为"
                value={draft.behavior}
                onChange={(value) => updateDraft("behavior", value)}
              />
              <Field
                label="负责人"
                value={draft.owner}
                onChange={(value) => updateDraft("owner", value)}
              />
            </div>
          </Panel>
          <div className="space-y-5">
            <Panel>
              <button
                onClick={() => importFileInput.current?.click()}
                className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-blue-300 bg-blue-50/60 px-6 text-center transition hover:border-blue-500 hover:bg-blue-50"
              >
                <UploadCloud className="h-10 w-10 text-blue-600" />
                <span className="mt-4 text-base font-semibold text-ink">
                  上传实验文件
                </span>
                <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  支持视频、红外、超声波和实验表格。也可一键载入演示文件。
                </span>
              </button>
              <input
                ref={importFileInput}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleImportFiles(event.target.files)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={UploadCloud} onClick={addSampleFiles}>
                  载入演示文件
                </Button>
                <Button size="sm" icon={Plus} onClick={submitImport}>
                  生成实验记录
                </Button>
              </div>
            </Panel>
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-ink">待接入文件</h4>
                <StatusBadge status={importedFiles.length ? "上传完成" : "等待文件"} />
              </div>
              <div className="space-y-3">
                {(importedFiles.length ? importedFiles : [
                  {
                    id: "EMPTY-FILE",
                    name: "尚未选择文件",
                    size: "可使用演示文件",
                    type: "等待接入",
                    status: "需补充" as const,
                  },
                ]).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {file.type} · {file.size}
                      </p>
                    </div>
                    <StatusBadge status={file.status} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </Modal>
    </PageFrame>
  );
}

function AnalysisPage({
  activeExperiment,
  experiments,
  jobs,
  onSelectExperiment,
  onNavigate,
  onCreateJob,
  onUpsertJob,
  onCompleteJob,
  onRetryJob,
  onOpenReport,
  generatedReportId,
}: {
  activeExperiment: Experiment;
  experiments: Experiment[];
  jobs: AnalysisJob[];
  onSelectExperiment: (experimentId: string, page?: PageKey) => void;
  onNavigate: (page: PageKey) => void;
  onCreateJob: (tasks: string[]) => AnalysisJob;
  onUpsertJob: (job: AnalysisJob) => void;
  onCompleteJob: (job: AnalysisJob) => void;
  onRetryJob: (jobId: string) => void;
  onOpenReport: (experimentId: string) => void;
  generatedReportId: string;
}) {
  const [inputMode, setInputMode] = useState<"sample" | "upload">("sample");
  const [selectedTasks, setSelectedTasks] = useState(["多模态融合分析", "药物影响分析"]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [reportDraftReady, setReportDraftReady] = useState(false);
  const [files, setFiles] = useState<ExperimentFile[]>([
    { id: "FILE-DEFAULT-VIDEO", name: "behavior-main.mp4", size: "2.4 GB", type: "普通视频", status: "已就绪" },
    { id: "FILE-DEFAULT-USV", name: "usv-track.wav", size: "438 MB", type: "超声波音频", status: "已就绪" },
  ]);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const activeJob =
    jobs.find((job) => job.id === activeJobId) ??
    jobs.find((job) => job.experimentId === activeExperiment.id);
  const hasStarted = stepIndex >= 0;
  const stepsComplete = stepIndex >= analysisPipeline.length;
  const analysisComplete = stepsComplete && reportDraftReady;

  const progress =
    stepsComplete
      ? 100
      : stepIndex < 0
        ? 0
        : getStageProgress(stepIndex);
  const displayedProgress = hasStarted ? progress : activeJob?.progress ?? 0;
  const displayedStage =
    activeJob && !hasStarted
      ? analysisPipeline.find((stage) => stage.key === activeJob.currentStage)
      : analysisPipeline[stepIndex];
  const displayedStageIndex = hasStarted
    ? stepIndex
    : activeJob?.status === "已完成"
      ? analysisPipeline.length
      : displayedStage
        ? analysisPipeline.findIndex((stage) => stage.key === displayedStage.key)
        : -1;

  useEffect(() => {
    setStepIndex(-1);
    setRunning(false);
    setReportDraftReady(false);
    setActiveJobId(null);
    setFiles(
      activeExperiment.files?.length
        ? activeExperiment.files
        : [
            { id: "FILE-DEFAULT-VIDEO", name: "behavior-main.mp4", size: "2.4 GB", type: "普通视频", status: "已就绪" },
            { id: "FILE-DEFAULT-USV", name: "usv-track.wav", size: "438 MB", type: "超声波音频", status: "已就绪" },
          ],
    );
  }, [activeExperiment.id]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, analysisPipeline.length));
    }, 520);
    return () => window.clearTimeout(timer);
  }, [running, stepIndex]);

  useEffect(() => {
    if (!activeJob || stepIndex < 0 || stepIndex >= analysisPipeline.length) return;
    const stage = analysisPipeline[stepIndex];
    const nextProgress = getStageProgress(stepIndex);
    if (
      activeJob.status !== "运行中" ||
      activeJob.progress !== nextProgress ||
      activeJob.currentStage !== stage.key
    ) {
      onUpsertJob({
        ...activeJob,
        status: "运行中",
        progress: nextProgress,
        currentStage: stage.key,
        updatedAt: formatNow(),
      });
    }
  }, [activeJob, onUpsertJob, stepIndex]);

  useEffect(() => {
    if (!running || stepIndex < analysisPipeline.length || !activeJob) return;
    setRunning(false);
    setReportDraftReady(true);
    if (activeJob.status !== "已完成") {
      onCompleteJob(activeJob);
    }
  }, [activeJob, onCompleteJob, running, stepIndex]);

  const startAnalysis = () => {
    const job = createAnalysisJob(activeExperiment, selectedTasks);
    setActiveJobId(job.id);
    onUpsertJob({ ...job, status: "运行中", updatedAt: formatNow() });
    setStepIndex(0);
    setRunning(true);
    setReportDraftReady(false);
  };

  const retryJob = (job: AnalysisJob) => {
    onRetryJob(job.id);
    setActiveJobId(job.id);
    setStepIndex(0);
    setRunning(true);
    setReportDraftReady(false);
  };

  const toggleTask = (task: string) => {
    setSelectedTasks((current) =>
      current.includes(task)
        ? current.filter((item) => item !== task)
        : [...current, task],
    );
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next = Array.from(fileList).map(inferExperimentFile);
    setFiles((current) => [...current, ...next]);
  };

  return (
    <PageFrame
      eyebrow="Intelligent analysis"
      title="智能分析中心"
      description="选择样例实验或上传数据，完成从数据校验、目标检测、行为识别、超声波特征提取到多模态融合的完整演示链路。"
      demoStep="analysis"
      onNavigate={onNavigate}
      action={
        <Button icon={FileText} variant="secondary" onClick={() => onNavigate("reports")}>
          查看报告中心
        </Button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-5">
          <Panel>
            <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1">
              {[
                ["sample", "选择样例实验"],
                ["upload", "上传数据"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setInputMode(key as "sample" | "upload")}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    inputMode === key
                      ? "bg-white text-ink shadow-sm"
                      : "text-slate-500 hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {inputMode === "sample" ? (
              <div className="space-y-4">
                <SelectShell
                  label="实验编号"
                  value={activeExperiment.id}
                  onChange={(value) => onSelectExperiment(value)}
                  options={experiments.map((item) => item.id)}
                />
                <InfoGrid
                  items={[
                    ["实验类型", activeExperiment.type],
                    ["数据类型", activeExperiment.dataType],
                    ["药物名称", activeExperiment.drug],
                    ["小鼠编号", activeExperiment.mouseId],
                    ["当前状态", activeExperiment.status],
                    ["行为类型", activeExperiment.behavior],
                  ]}
                />
              </div>
            ) : (
              <div>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex min-h-[188px] w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-blue-300 bg-blue-50/60 px-6 text-center transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <UploadCloud className="h-10 w-10 text-blue-600" />
                  <span className="mt-4 text-base font-semibold text-ink">
                    上传视频、红外、超声波或实验信息表
                  </span>
                  <span className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    支持 MP4、AVI、MOV、WAV、CSV、XLSX 文件，上传后自动识别数据类型。
                  </span>
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="mb-4 text-lg font-semibold text-ink">分析任务类型</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysisTasks.map((task) => (
                <button
                  key={task}
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3 text-left text-sm font-semibold transition",
                    selectedTasks.includes(task)
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full border",
                      selectedTasks.includes(task)
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-300",
                    )}
                  >
                    {selectedTasks.includes(task) ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : null}
                  </span>
                  {task}
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">已接入文件</h3>
              <StatusBadge status="数据就绪" />
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {file.type} · {file.size}
                    </p>
                  </div>
                  <StatusBadge status={file.status} />
                </div>
              ))}
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              icon={Play}
              disabled={running || selectedTasks.length === 0}
              onClick={startAnalysis}
            >
              {running ? "分析进行中" : "开始智能分析"}
            </Button>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink">任务队列</h3>
                <p className="mt-1 text-sm text-slate-500">
                  排队、运行、失败和完成任务集中管理。
                </p>
              </div>
              <Pill>{jobs.length} 个任务</Pill>
            </div>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveJobId(job.id);
                    onSelectExperiment(job.experimentId);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setActiveJobId(job.id);
                      onSelectExperiment(job.experimentId);
                    }
                  }}
                  className={cn(
                    "w-full cursor-pointer rounded-2xl border p-3 text-left transition",
                    activeJob?.id === job.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {job.id} · {job.updatedAt}
                      </p>
                    </div>
                    <StatusBadge status={job.status} pulse={job.status === "运行中"} />
                  </div>
                  <div className="mt-3">
                    <ProgressLine value={job.progress} />
                  </div>
                  {job.failureReason ? (
                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      {job.failureReason}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.status === "失败" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        icon={RotateCcw}
                        onClick={(event) => {
                          event.stopPropagation();
                          retryJob(job);
                        }}
                      >
                        重试
                      </Button>
                    ) : null}
                    {job.reportId ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        icon={FileText}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenReport(job.experimentId);
                        }}
                      >
                        查看结果
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink">分析进度</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {analysisComplete
                    ? "分析结果已生成，报告草稿已就绪"
                    : stepsComplete
                      ? "正在整理报告草稿"
                      : !hasStarted
                        ? activeJob
                          ? `${activeJob.status} · ${displayedStage?.detail ?? "等待下一步处理"}`
                          : "等待启动分析任务"
                        : displayedStage?.detail}
                </p>
              </div>
              <span className="text-2xl font-semibold text-blue-600">{displayedProgress}%</span>
            </div>
            <ProgressLine value={displayedProgress} />
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {analysisPipeline.map((step, index) => (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm",
                    index < displayedStageIndex || stepsComplete || activeJob?.status === "已完成"
                      ? "bg-emerald-50 text-emerald-700"
                      : index === displayedStageIndex
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-50 text-slate-500",
                  )}
                >
                  {index < displayedStageIndex || stepsComplete || activeJob?.status === "已完成" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Sparkles className={cn("h-4 w-4", index === displayedStageIndex && "animate-pulse")} />
                  )}
                  <span>
                    <span className="block font-semibold">{step.title}</span>
                    <span className="block text-xs opacity-75">{step.detail}</span>
                  </span>
                </div>
              ))}
            </div>
            {analysisComplete ? (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold text-emerald-900">
                      报告草稿已生成
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      已关联报告 {generatedReportId}，可进入报告中心预览、打印或下载。
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    icon={FileText}
                    onClick={() => onOpenReport(activeExperiment.id)}
                  >
                    预览报告草稿
                  </Button>
                </div>
              </div>
            ) : null}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-ink">原始视频预览</h3>
                <Pill>{activeExperiment.id}</Pill>
              </div>
              <EmptyVideoFrame />
            </Panel>
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-ink">检测后视频预览</h3>
                <Pill>目标框 · 轨迹</Pill>
              </div>
              <EmptyVideoFrame mode="infra" />
            </Panel>
          </div>

          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">视频分析结果</h3>
              <StatusBadge status="复核通过" />
            </div>
            <ResponsiveTable>
              <thead>
                <tr>
                  {["行为编号", "行为类型", "开始时间", "结束时间", "持续时长", "置信度", "复核状态"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {behaviorSegments.map((segment) => (
                  <tr key={segment.id}>
                    <td>{segment.id}</td>
                    <td>{segment.type}</td>
                    <td>{segment.start}</td>
                    <td>{segment.end}</td>
                    <td>{segment.duration}</td>
                    <td>{segment.confidence}%</td>
                    <td><StatusBadge status={segment.review} /></td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartPanel title="超声波波形图" icon={AudioWaveform}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={waveformData}>
                  <defs>
                    <linearGradient id="wave" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    dataKey="amp"
                    name="振幅"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#wave)"
                    type="monotone"
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="freq"
                    name="频率"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">声谱图</h3>
                <Pill>USV</Pill>
              </div>
              <Spectrogram />
            </Panel>
          </div>

          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">超声波片段</h3>
              <Pill>片段数量 {ultrasoundSegments.length}</Pill>
            </div>
            <ResponsiveTable>
              <thead>
                <tr>
                  {["片段编号", "开始时间", "结束时间", "叫声数量", "平均频率", "平均功率", "预测行为", "置信度"].map((head) => (
                    <th key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultrasoundSegments.map((segment) => (
                  <tr key={segment.id}>
                    <td>{segment.id}</td>
                    <td>{segment.start}</td>
                    <td>{segment.end}</td>
                    <td>{segment.calls}</td>
                    <td>{segment.frequency}</td>
                    <td>{segment.power}</td>
                    <td>{segment.behavior}</td>
                    <td>{segment.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          </Panel>

          <Panel className="bg-ink text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                  Fusion result
                </p>
                <h3 className="mt-2 text-2xl font-semibold">多模态融合结果</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  视频模型预测为静止行为增加，超声波模型预测为叫声密度下降，融合后判断为药物干预后行为活跃度下降，关键影响因素为静止时长、USV 密度和轨迹覆盖面积。
                </p>
              </div>
              <Button
                variant="dark"
                icon={FileText}
                disabled={!analysisComplete}
                onClick={() => onOpenReport(activeExperiment.id)}
              >
                {analysisComplete ? "预览报告" : "完成分析后生成报告"}
              </Button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {reportSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4"
                >
                  <item.icon className="h-5 w-5 text-cyan-200" />
                  <p className="mt-3 text-sm text-slate-300">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </PageFrame>
  );
}

function ReportsPage({
  activeReport,
  reports,
  experiments,
  onSelectReport,
  onSelectExperiment,
  onNavigate,
  generatedReportId,
}: {
  activeReport: Report;
  reports: Report[];
  experiments: Experiment[];
  onSelectReport: (reportId: string, page?: PageKey) => void;
  onSelectExperiment: (experimentId: string, page?: PageKey) => void;
  onNavigate: (page: PageKey) => void;
  generatedReportId: string;
}) {
  const [preview, setPreview] = useState<Report | null>(null);
  const isGeneratedReport = activeReport.id === generatedReportId;

  return (
    <PageFrame
      eyebrow="Report center"
      title="报告中心"
      description="管理行为识别、超声波预测、多模态融合、药物影响辅助评估与实验数据复盘报告。"
      demoStep="reports"
      onNavigate={onNavigate}
      action={
        <Button
          icon={FileText}
          onClick={() => onSelectExperiment(activeReport.experimentId, "analysis")}
        >
          重新生成
        </Button>
      }
    >
      {isGeneratedReport ? (
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50/80 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                已同步最新分析结果
              </p>
              <p className="mt-1 text-sm leading-6 text-blue-700">
                该报告来自当前主演示路径，可继续打印、下载或回到实验详情复核。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                打印/导出 PDF
              </Button>
              <DownloadButton onClick={() => downloadReport(activeReport, experiments)}>
                下载报告
              </DownloadButton>
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]">
        <Panel>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-ink">报告列表</h3>
              <p className="text-sm text-slate-500">共 {reports.length} 份分析报告</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {reportTypes.slice(0, 3).map((type) => (
                <Pill key={type}>{type}</Pill>
              ))}
            </div>
          </div>
          <ResponsiveTable>
            <thead>
              <tr>
                {["报告编号", "报告名称", "实验编号", "生成时间", "行为结论", "报告状态", "操作"].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className={cn(
                    activeReport.id === report.id && "bg-blue-50/60",
                  )}
                >
                  <td>{report.id}</td>
                  <td className="min-w-[220px] font-semibold text-ink">{report.name}</td>
                  <td>{report.experimentId}</td>
                  <td>{report.generatedAt}</td>
                  <td className="min-w-[230px]">{report.conclusion}</td>
                  <td><StatusBadge status={report.status} pulse={report.status === "生成中"} /></td>
                  <td>
                    <div className="flex min-w-[220px] flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => {
                          onSelectReport(report.id);
                          setPreview(report);
                        }}
                      >
                        预览
                      </Button>
                      <DownloadButton onClick={() => downloadReport(report, experiments)}>
                        下载
                      </DownloadButton>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={PanelRightOpen}
                        onClick={() => onSelectExperiment(report.experimentId, "experiments")}
                      >
                        实验详情
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </Panel>
        <ReportDocument
          report={activeReport}
          experiments={experiments}
          onDownload={() => downloadReport(activeReport, experiments)}
          onPrint={() => window.print()}
          onOpenExperiment={() => onSelectExperiment(activeReport.experimentId, "experiments")}
          onRegenerate={() => {
            onSelectExperiment(activeReport.experimentId);
            onNavigate("analysis");
          }}
        />
      </div>

      <Modal
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        title={preview?.name ?? "报告预览"}
        description={preview?.id}
        width="max-w-5xl"
      >
        {preview ? (
          <ReportDocument
            report={preview}
            experiments={experiments}
            embedded
            onDownload={() => downloadReport(preview, experiments)}
            onPrint={() => window.print()}
            onOpenExperiment={() => onSelectExperiment(preview.experimentId, "experiments")}
            onRegenerate={() => {
              onSelectExperiment(preview.experimentId);
              onNavigate("analysis");
            }}
          />
        ) : null}
      </Modal>
    </PageFrame>
  );
}

function PilotPage({
  leads,
  onCreateLead,
  onNavigate,
}: {
  leads: PilotLead[];
  onCreateLead: (draft: Parameters<typeof createPilotLead>[0]) => PilotLead;
  onNavigate: (page: PageKey) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<PilotLead | null>(null);
  const [needsLocal, setNeedsLocal] = useState(false);
  const [form, setForm] = useState({
    company: "",
    contact: "",
    phone: "",
    industry: "医学院实验室",
    department: "",
    scale: "10-50 组实验",
    dataType: "普通视频 + 超声波",
    need: "小鼠行为分析试点",
    note: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <PageFrame
      eyebrow="Pilot partnership"
      title="合作试点申请"
      description="面向实验室、药企临床前研究中心、神经科学团队、动物行为学平台和 CRO 机构，支持数据接入、试点分析、本地化部署与定制模型合作。"
      demoStep="pilot"
      onNavigate={onNavigate}
      action={
        <Button icon={Download} onClick={() => onNavigate("reports")}>
          获取样例报告
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Panel className="bg-ink text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
              Suitable teams
            </p>
            <h3 className="mt-3 text-2xl font-semibold">合作对象</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {pilotTargets.map((target) => (
                <div
                  key={target}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold text-white/90"
                >
                  {target}
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-xl font-semibold text-ink">合作方式</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pilotMethods.map((method) => (
                <div
                  key={method.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    <method.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{method.title}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-ink">试点线索跟进</h3>
                <p className="mt-1 text-sm text-slate-500">
                  申请会进入运营视角，方便跟进试点状态和下一步动作。
                </p>
              </div>
              <Pill>{leads.length} 条线索</Pill>
            </div>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "rounded-2xl border p-4",
                    submittedLead?.id === lead.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {lead.company}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.id} · {lead.industry} · {lead.createdAt}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge status={lead.status} />
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          lead.priority === "高"
                            ? "bg-rose-50 text-rose-700"
                            : lead.priority === "中"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {lead.priority}优先级
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    下一步：{lead.nextAction}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span>联系人：{lead.contact} / {lead.phone}</span>
                    <span>需求：{lead.need}</span>
                    <span>规模：{lead.scale}</span>
                    <span>数据：{lead.dataType}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-ink">申请表单</h3>
              <p className="mt-1 text-sm text-slate-500">提交后项目团队将在 1 个工作日内联系。</p>
            </div>
            <Pill>预约演示 / 咨询定制部署</Pill>
          </div>

          {submitted ? (
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-8 text-center">
              <BadgeCheck className="mx-auto h-12 w-12 text-emerald-600" />
              <h4 className="mt-4 text-2xl font-semibold text-ink">
                已收到您的试点申请
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {submittedLead
                  ? `线索 ${submittedLead.id} 已进入跟进列表，下一步：${submittedLead.nextAction}。`
                  : "项目团队将在 1 个工作日内与您联系。"}
              </p>
              <Button className="mt-6" variant="secondary" onClick={() => setSubmitted(false)}>
                继续填写
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const lead = onCreateLead({
                  ...form,
                  needsLocal,
                });
                setSubmittedLead(lead);
                setSubmitted(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="单位名称" value={form.company} onChange={(value) => update("company", value)} required />
                <Field label="联系人" value={form.contact} onChange={(value) => update("contact", value)} required />
                <Field label="联系方式" value={form.phone} onChange={(value) => update("phone", value)} required />
                <SelectShell
                  label="所属行业"
                  value={form.industry}
                  onChange={(value) => update("industry", value)}
                  options={pilotTargets}
                />
                <Field label="所属实验室或部门" value={form.department} onChange={(value) => update("department", value)} />
                <SelectShell
                  label="预计实验规模"
                  value={form.scale}
                  onChange={(value) => update("scale", value)}
                  options={["10 组以内", "10-50 组实验", "50-200 组实验", "200 组以上"]}
                />
                <SelectShell
                  label="数据类型"
                  value={form.dataType}
                  onChange={(value) => update("dataType", value)}
                  options={[
                    "普通视频",
                    "红外视频",
                    "超声波",
                    "普通视频 + 超声波",
                    "普通视频 + 红外视频 + 超声波",
                  ]}
                />
                <SelectShell
                  label="合作需求"
                  value={form.need}
                  onChange={(value) => update("need", value)}
                  options={pilotMethods.map((item) => item.title)}
                />
              </div>
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-ink">是否需要本地部署</span>
                  <span className="text-xs text-slate-500">适用于数据安全、内网实验平台等场景</span>
                </span>
                <button
                  type="button"
                  onClick={() => setNeedsLocal((value) => !value)}
                  className={cn(
                    "relative h-7 w-12 rounded-full transition",
                    needsLocal ? "bg-blue-600" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                      needsLocal ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                  备注说明
                </span>
                <textarea
                  value={form.note}
                  onChange={(event) => update("note", event.target.value)}
                  rows={4}
                  placeholder="可填写实验场景、数据规模、模型定制或部署要求"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" icon={Send} className="flex-1">
                  提交申请
                </Button>
                <Button type="button" variant="outline" icon={MessageSquareText}>
                  预约演示
                </Button>
              </div>
            </form>
          )}
        </Panel>
      </div>
    </PageFrame>
  );
}

function ChartPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {children}
    </Panel>
  );
}

function ExperimentTable({
  experiments: rows,
  onView,
  onAnalyze,
  onReport,
  onFocus,
  compact,
}: {
  experiments: Experiment[];
  onView: (id: string) => void;
  onAnalyze: (id: string) => void;
  onReport: (id: string) => void;
  onFocus?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <ResponsiveTable>
      <thead>
        <tr>
          {[
            "实验编号",
            "实验标签",
            "实验类型",
            "小鼠编号",
            "小鼠性别",
            "注射药物",
            "药物浓度",
            "数据类型",
            compact ? "状态" : "最近分析时间",
            "操作",
          ].map((head) => (
            <th key={head}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={item.id}>
            <td className="min-w-[116px] font-semibold text-ink">{item.id}</td>
            <td className="min-w-[150px]">{item.label}</td>
            <td>{item.type}</td>
            <td>{item.mouseId}</td>
            <td>{item.sex}</td>
            <td className="min-w-[130px]">{item.drug}</td>
            <td>{item.concentration}</td>
            <td className="min-w-[160px]">{item.dataType}</td>
            <td>
              {compact ? (
                <StatusBadge status={item.status} pulse={item.status === "分析中"} />
              ) : (
                item.lastAnalysis
              )}
            </td>
            <td>
              <div className="flex min-w-[260px] flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={Eye} onClick={() => onView(item.id)}>
                  查看详情
                </Button>
                <Button size="sm" variant="outline" icon={Play} onClick={() => onAnalyze(item.id)}>
                  发起分析
                </Button>
                <Button size="sm" variant="outline" icon={FileText} onClick={() => onReport(item.id)}>
                  生成报告
                </Button>
                {onFocus ? (
                  <button
                    onClick={() => onFocus(item.id)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full border transition",
                      item.focus
                        ? "border-amber-200 bg-amber-50 text-amber-500"
                        : "border-slate-200 bg-white text-slate-400 hover:text-amber-500",
                    )}
                    title="加入重点关注"
                  >
                    <Star className="h-4 w-4" fill={item.focus ? "currentColor" : "none"} />
                  </button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </ResponsiveTable>
  );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        {children}
      </table>
    </div>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function ReportDocument({
  report,
  experiments,
  embedded,
  onDownload,
  onPrint,
  onOpenExperiment,
  onRegenerate,
}: {
  report: Report;
  experiments: Experiment[];
  embedded?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
  onOpenExperiment?: () => void;
  onRegenerate?: () => void;
}) {
  const experiment =
    experiments.find((item) => item.id === report.experimentId) ?? experiments[0];

  return (
    <Panel
      className={cn(
        "report-document bg-white",
        embedded ? "shadow-none ring-1 ring-slate-100" : "min-h-[720px]",
      )}
    >
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              智鼠云析 · Analysis report
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight text-ink">
              {report.name}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              报告编号 {report.id} · 生成时间 {report.generatedAt}
            </p>
          </div>
          <StatusBadge status={report.status} pulse={report.status === "生成中"} />
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-200 py-5 sm:grid-cols-3">
        {[
          ["报告完整度", `${report.score}%`],
          ["复核状态", report.status === "待复核" ? "建议复核" : "可用于交流"],
          ["导出版本", "PDF / HTML"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 border-b border-slate-200 py-6 md:grid-cols-4">
        {[
          ["实验编号", report.experimentId],
          ["实验类型", experiment.type],
          ["数据类型", experiment.dataType],
          ["行为结论", report.conclusion],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 py-6 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h4 className="text-lg font-semibold text-ink">多模态融合结论</h4>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            视频行为识别结果显示，{experiment.mouseId} 在当前实验条件下的静止片段持续时间增加，行走轨迹覆盖面积下降；超声波分析显示叫声密度与平均功率同步下降。融合模型综合判断药物干预后行为活跃度下降，融合置信度为 93%。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reportSummary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <item.icon className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 text-base font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-semibold text-ink">AI 分析说明</h4>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>· 行为时间轴由目标检测、轨迹跟踪与行为分类模型共同生成。</li>
            <li>· 超声波片段经过时序分割、频率统计与行为预测模型处理。</li>
            <li>· 药物影响等级依据行为活跃度、声学密度与实验信息表综合评估。</li>
          </ul>
          <div className="mt-5 rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">辅助建议</p>
            <p className="mt-2 text-sm leading-6 text-ink">
              建议对 00:06:03-00:06:47 的追逐片段进行人工复核，并在相同剂量下补充 2 组重复实验。
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
        <MiniStat label="行为识别结果" value="静止增强，追逐下降" />
        <MiniStat label="超声波分析结果" value="叫声密度下降 18%" />
        <MiniStat label="关键影响因素" value="剂量、静止时长、频谱功率" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" icon={Printer} onClick={onPrint}>
          打印/导出 PDF
        </Button>
        <DownloadButton onClick={onDownload}>下载报告</DownloadButton>
        <Button variant="outline" size="sm" icon={RefreshCcw} onClick={onRegenerate}>
          重新生成
        </Button>
        <Button variant="outline" size="sm" icon={PanelRightOpen} onClick={onOpenExperiment}>
          查看实验详情
        </Button>
      </div>
    </Panel>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400"
      />
    </label>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  return (
    <footer className="no-print border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white">
              <MousePointer2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">智鼠云析</p>
              <p className="text-sm text-slate-500">多模态小鼠行为智能分析与药物助研系统</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" icon={Microscope} onClick={() => onNavigate("pilot")}>
            科研合作
          </Button>
          <Button variant="ghost" size="sm" icon={ClipboardList} onClick={() => onNavigate("reports")}>
            样例报告
          </Button>
          <Button variant="ghost" size="sm" icon={Network} onClick={() => onNavigate("analysis")}>
            多模态分析
          </Button>
        </div>
      </div>
    </footer>
  );
}
