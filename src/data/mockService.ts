import {
  analysisPipeline,
  type AnalysisJob,
  type Experiment,
  type ExperimentFile,
  type PilotLead,
  type Report,
} from "./platformData";

export type ExperimentDraft = {
  label: string;
  type: string;
  mouseId: string;
  sex: "雄性" | "雌性";
  drug: string;
  dose: string;
  concentration: string;
  dataType: string;
  behavior: string;
  owner: string;
};

export type PilotDraft = Omit<PilotLead, "id" | "priority" | "status" | "nextAction" | "createdAt">;

const pad = (value: number) => String(value).padStart(2, "0");

export function formatNow(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function createExperimentFromDraft(
  draft: ExperimentDraft,
  files: ExperimentFile[],
  existingCount: number,
): Experiment {
  const id = `EXP-2406-${pad(40 + existingCount)}`;

  return {
    id,
    label: draft.label || "新导入实验",
    type: draft.type,
    mouseId: draft.mouseId || `M-NEW${existingCount}`,
    sex: draft.sex,
    drug: draft.drug || "待填写",
    dose: draft.dose || "待填写",
    concentration: draft.concentration || "待填写",
    dataType: draft.dataType,
    behavior: draft.behavior,
    lastAnalysis: "未分析",
    status: "待分析",
    reportReady: false,
    focus: true,
    duration: "待校验",
    confidence: 0,
    keyFinding: "已完成样例导入，等待发起智能分析。",
    source: "本地导入",
    createdAt: formatNow(),
    owner: draft.owner || "演示用户",
    qualityScore: files.length >= 3 ? 86 : 72,
    files,
  };
}

export function inferExperimentFile(file: File, index: number): ExperimentFile {
  const lower = file.name.toLowerCase();
  const type = lower.endsWith(".wav")
    ? "超声波音频"
    : lower.endsWith(".xlsx") || lower.endsWith(".csv")
      ? "实验信息表"
      : lower.includes("infra") || lower.includes("ir")
        ? "红外视频"
        : "普通视频";

  return {
    id: `FILE-${Date.now()}-${index}`,
    name: file.name,
    size: `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`,
    type,
    status: "上传完成",
  };
}

export function createAnalysisJob(experiment: Experiment, tasks: string[]): AnalysisJob {
  return {
    id: `JOB-${Date.now()}`,
    experimentId: experiment.id,
    title: `${experiment.label} · ${tasks[0] ?? "智能分析"}`,
    tasks,
    status: "排队中",
    progress: 0,
    currentStage: analysisPipeline[0].key,
    createdAt: formatNow(),
    updatedAt: formatNow(),
  };
}

export function getStageProgress(stageIndex: number) {
  if (stageIndex < 0) return 0;
  const completed = analysisPipeline
    .slice(0, Math.min(stageIndex + 1, analysisPipeline.length))
    .reduce((sum, stage) => sum + stage.weight, 0);
  return Math.min(99, completed);
}

export function createReportFromJob(
  job: AnalysisJob,
  experiment: Experiment,
  existingReports: Report[],
): Report {
  const stamp = new Date();
  const id = `RPT-${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(
    stamp.getDate(),
  )}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}`;
  const duplicated = existingReports.some((report) => report.id === id);

  return {
    id: duplicated ? `${id}-${existingReports.length + 1}` : id,
    name: `${experiment.label}${job.tasks.includes("药物影响分析") ? "药物影响辅助评估" : "多模态融合分析"}报告`,
    experimentId: experiment.id,
    type: job.tasks.includes("超声波行为预测")
      ? "超声波行为预测报告"
      : "多模态融合分析报告",
    generatedAt: formatNow(stamp),
    conclusion:
      experiment.status === "需复核"
        ? "模型完成初步分析，遮挡片段建议进入人工复核"
        : `${experiment.drug} 条件下行为与声学特征完成融合评估`,
    status: "可下载",
    score: Math.max(84, experiment.confidence || 89),
    version: "v1.0",
    reviewer: "智能报告引擎",
    updatedAt: formatNow(stamp),
  };
}

export function createPilotLead(draft: PilotDraft, existingCount: number): PilotLead {
  const priority: PilotLead["priority"] =
    draft.needsLocal || draft.scale.includes("200") ? "高" : draft.scale.includes("50") ? "中" : "低";

  return {
    ...draft,
    id: `LEAD-2406-${pad(20 + existingCount)}`,
    priority,
    status: "新申请",
    nextAction: draft.needsLocal ? "确认本地部署边界与数据安全要求" : "发送样例报告并预约产品演示",
    createdAt: formatNow(),
  };
}
