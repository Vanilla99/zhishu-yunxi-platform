import {
  Activity,
  AudioWaveform,
  BarChart3,
  BrainCircuit,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  LineChart,
  Microscope,
  MousePointer2,
  Network,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Video,
} from "lucide-react";

export type PageKey =
  | "home"
  | "dashboard"
  | "experiments"
  | "analysis"
  | "reports"
  | "pilot";

export type Experiment = {
  id: string;
  label: string;
  type: string;
  mouseId: string;
  sex: "雄性" | "雌性";
  drug: string;
  dose: string;
  concentration: string;
  dataType: string;
  behavior: string;
  lastAnalysis: string;
  status: "已完成" | "分析中" | "待分析" | "需复核";
  reportReady: boolean;
  focus: boolean;
  duration: string;
  confidence: number;
  keyFinding: string;
};

export type Report = {
  id: string;
  name: string;
  experimentId: string;
  type: string;
  generatedAt: string;
  conclusion: string;
  status: "可下载" | "生成中" | "待复核";
  score: number;
};

export const navItems: Array<{ key: PageKey; label: string }> = [
  { key: "home", label: "产品首页" },
  { key: "dashboard", label: "数据驾驶舱" },
  { key: "experiments", label: "实验样例管理" },
  { key: "analysis", label: "智能分析中心" },
  { key: "reports", label: "报告中心" },
  { key: "pilot", label: "合作试点" },
];

export const painPoints = [
  {
    title: "人工观察效率低",
    text: "长时程视频复核依赖经验，行为标注成本高，难以稳定复现。",
    icon: TimerReset,
  },
  {
    title: "细微行为难识别",
    text: "嗅探、追逐、静止等短时行为容易被遮挡、姿态变化和帧间噪声干扰。",
    icon: ScanSearch,
  },
  {
    title: "单一视频受环境影响",
    text: "普通视频在低照度、反光和遮挡场景下精度下降，需要红外与声学信号补强。",
    icon: Video,
  },
  {
    title: "药物实验缺少量化分析",
    text: "行为频次、持续时长、超声波活跃度和剂量关系需要统一量化口径。",
    icon: FlaskConical,
  },
];

export const capabilities = [
  { title: "小鼠目标检测", icon: MousePointer2, value: "98.2%" },
  { title: "运动轨迹跟踪", icon: Radar, value: "42k" },
  { title: "普通视频行为识别", icon: Video, value: "8 类" },
  { title: "红外视频行为识别", icon: ScanSearch, value: "夜间" },
  { title: "超声波行为预测", icon: AudioWaveform, value: "USV" },
  { title: "多模态融合分析", icon: Network, value: "3 模态" },
  { title: "药物影响评估", icon: HeartPulse, value: "分级" },
  { title: "智能报告生成", icon: FileText, value: "PDF" },
];

export const scenarios = [
  "医学院实验室",
  "药企临床前研究中心",
  "神经科学研究团队",
  "动物行为学实验室",
  "CRO 药物研发服务机构",
  "高校科研教学平台",
];

export const dashboardMetrics = [
  {
    label: "累计实验记录",
    value: "1,284",
    delta: "+18.6%",
    icon: DatabaseZap,
    tone: "blue",
  },
  {
    label: "视频样例总时长",
    value: "642h",
    delta: "+42h",
    icon: Video,
    tone: "cyan",
  },
  {
    label: "超声波样本数量",
    value: "86,420",
    delta: "+9.4%",
    icon: AudioWaveform,
    tone: "violet",
  },
  {
    label: "已完成分析任务",
    value: "936",
    delta: "+126",
    icon: BrainCircuit,
    tone: "green",
  },
  {
    label: "已生成报告数量",
    value: "318",
    delta: "+32",
    icon: ClipboardCheck,
    tone: "amber",
  },
  {
    label: "平均分析耗时",
    value: "08m 42s",
    delta: "-21%",
    icon: Gauge,
    tone: "slate",
  },
];

export const behaviorDistribution = [
  { name: "行走", value: 34, fill: "#2563eb" },
  { name: "静止", value: 24, fill: "#14b8a6" },
  { name: "嗅探", value: 18, fill: "#8b5cf6" },
  { name: "追逐", value: 14, fill: "#06b6d4" },
  { name: "交配", value: 10, fill: "#f59e0b" },
];

export const ultrasoundTrend = [
  { time: "09:00", active: 18, density: 32 },
  { time: "09:10", active: 26, density: 41 },
  { time: "09:20", active: 31, density: 48 },
  { time: "09:30", active: 24, density: 36 },
  { time: "09:40", active: 42, density: 62 },
  { time: "09:50", active: 53, density: 74 },
  { time: "10:00", active: 45, density: 67 },
];

export const concentrationRelation = [
  { concentration: "0", frequency: 22, activity: 58 },
  { concentration: "2", frequency: 31, activity: 64 },
  { concentration: "5", frequency: 47, activity: 72 },
  { concentration: "10", frequency: 39, activity: 61 },
  { concentration: "20", frequency: 28, activity: 48 },
];

export const dataTypeShare = [
  { name: "普通视频", value: 38, fill: "#3b82f6" },
  { name: "红外视频", value: 26, fill: "#0f766e" },
  { name: "超声波音频", value: 22, fill: "#7c3aed" },
  { name: "实验信息表", value: 14, fill: "#f97316" },
];

export const completionTrend = [
  { day: "周一", completed: 38, reports: 11 },
  { day: "周二", completed: 44, reports: 18 },
  { day: "周三", completed: 36, reports: 16 },
  { day: "周四", completed: 52, reports: 24 },
  { day: "周五", completed: 58, reports: 26 },
  { day: "周六", completed: 41, reports: 19 },
  { day: "周日", completed: 49, reports: 22 },
];

export const experiments: Experiment[] = [
  {
    id: "EXP-2406-018",
    label: "低剂量镇静反应",
    type: "药物影响评估",
    mouseId: "M-AX21",
    sex: "雄性",
    drug: "候选化合物 A",
    dose: "2.0 mg/kg",
    concentration: "5 μM",
    dataType: "普通视频 + 超声波",
    behavior: "静止 / 嗅探",
    lastAnalysis: "2026-06-16 09:42",
    status: "已完成",
    reportReady: true,
    focus: true,
    duration: "38m 12s",
    confidence: 94,
    keyFinding: "静止持续时长提升，超声波叫声密度下降。",
  },
  {
    id: "EXP-2406-021",
    label: "社交行为干预",
    type: "神经行为实验",
    mouseId: "M-BK08",
    sex: "雌性",
    drug: "多巴胺调节剂",
    dose: "1.5 mg/kg",
    concentration: "2 μM",
    dataType: "红外视频 + 超声波",
    behavior: "追逐 / 嗅探",
    lastAnalysis: "2026-06-16 10:16",
    status: "分析中",
    reportReady: false,
    focus: false,
    duration: "41m 05s",
    confidence: 88,
    keyFinding: "追逐行为峰值集中在注射后 18-24 分钟。",
  },
  {
    id: "EXP-2406-027",
    label: "昼夜节律观察",
    type: "行为识别",
    mouseId: "M-CN34",
    sex: "雄性",
    drug: "生理盐水",
    dose: "0 mg/kg",
    concentration: "0 μM",
    dataType: "红外视频",
    behavior: "行走 / 静止",
    lastAnalysis: "2026-06-15 21:08",
    status: "需复核",
    reportReady: true,
    focus: true,
    duration: "55m 46s",
    confidence: 81,
    keyFinding: "夜间行走轨迹活跃，但部分遮挡片段需人工复核。",
  },
  {
    id: "EXP-2406-031",
    label: "剂量梯度响应",
    type: "药物浓度实验",
    mouseId: "M-DP17",
    sex: "雌性",
    drug: "候选化合物 B",
    dose: "5.0 mg/kg",
    concentration: "10 μM",
    dataType: "普通视频 + 红外视频 + 超声波",
    behavior: "交配 / 追逐",
    lastAnalysis: "2026-06-16 11:25",
    status: "已完成",
    reportReady: true,
    focus: false,
    duration: "44m 29s",
    confidence: 92,
    keyFinding: "融合模型显示行为活跃度中度升高。",
  },
  {
    id: "EXP-2406-037",
    label: "教学平台样例",
    type: "多模态融合分析",
    mouseId: "M-EQ42",
    sex: "雄性",
    drug: "空白对照",
    dose: "0 mg/kg",
    concentration: "0 μM",
    dataType: "普通视频 + 实验信息表",
    behavior: "行走 / 嗅探",
    lastAnalysis: "未分析",
    status: "待分析",
    reportReady: false,
    focus: false,
    duration: "26m 17s",
    confidence: 0,
    keyFinding: "尚未发起智能分析。",
  },
];

export const analysisTasks = [
  "交配行为识别",
  "追逐行为识别",
  "嗅探行为识别",
  "静止行为识别",
  "行走行为识别",
  "超声波行为预测",
  "药物影响分析",
  "多模态融合分析",
];

export const analysisSteps = [
  "正在校验实验数据",
  "正在读取视频帧",
  "正在进行视频裁剪",
  "正在执行目标检测",
  "正在进行目标跟踪",
  "正在提取行为片段",
  "正在读取超声波数据",
  "正在进行超声波特征提取",
  "正在进行时序分割",
  "正在调用行为识别模型",
  "正在进行多模态融合",
  "正在生成分析结果",
];

export const behaviorSegments = [
  {
    id: "B-001",
    type: "嗅探",
    start: "00:02:14",
    end: "00:02:39",
    duration: "25s",
    confidence: 96,
    review: "已确认",
  },
  {
    id: "B-002",
    type: "追逐",
    start: "00:06:03",
    end: "00:06:47",
    duration: "44s",
    confidence: 91,
    review: "待复核",
  },
  {
    id: "B-003",
    type: "静止",
    start: "00:12:28",
    end: "00:15:02",
    duration: "154s",
    confidence: 94,
    review: "已确认",
  },
  {
    id: "B-004",
    type: "行走",
    start: "00:18:12",
    end: "00:19:36",
    duration: "84s",
    confidence: 89,
    review: "已确认",
  },
];

export const ultrasoundSegments = [
  {
    id: "USV-018",
    start: "00:02:08",
    end: "00:02:34",
    calls: 42,
    frequency: "67.2 kHz",
    power: "-42 dB",
    behavior: "嗅探",
    confidence: 92,
  },
  {
    id: "USV-026",
    start: "00:06:12",
    end: "00:06:58",
    calls: 83,
    frequency: "71.5 kHz",
    power: "-38 dB",
    behavior: "追逐",
    confidence: 88,
  },
  {
    id: "USV-039",
    start: "00:14:01",
    end: "00:14:55",
    calls: 21,
    frequency: "58.6 kHz",
    power: "-47 dB",
    behavior: "静止",
    confidence: 86,
  },
];

export const waveformData = Array.from({ length: 36 }, (_, index) => ({
  t: index,
  amp: Math.round(
    34 +
      Math.sin(index / 1.8) * 18 +
      Math.cos(index / 3.2) * 10 +
      (index % 7) * 2,
  ),
  freq: Math.round(52 + Math.sin(index / 2.7) * 13 + (index % 5) * 2),
}));

export const reports: Report[] = [
  {
    id: "RPT-20260616-1042",
    name: "低剂量镇静反应多模态融合分析报告",
    experimentId: "EXP-2406-018",
    type: "多模态融合分析报告",
    generatedAt: "2026-06-16 10:42",
    conclusion: "候选化合物 A 对静止行为具有显著增强趋势",
    status: "可下载",
    score: 91,
  },
  {
    id: "RPT-20260616-1128",
    name: "剂量梯度响应药物影响辅助评估报告",
    experimentId: "EXP-2406-031",
    type: "药物影响辅助评估报告",
    generatedAt: "2026-06-16 11:28",
    conclusion: "中等浓度下行为活跃度与声学密度同步升高",
    status: "可下载",
    score: 88,
  },
  {
    id: "RPT-20260615-2135",
    name: "昼夜节律红外视频行为识别报告",
    experimentId: "EXP-2406-027",
    type: "小鼠行为识别报告",
    generatedAt: "2026-06-15 21:35",
    conclusion: "夜间行走轨迹显著增加，局部遮挡片段建议复核",
    status: "待复核",
    score: 78,
  },
  {
    id: "RPT-20260616-1204",
    name: "社交行为干预超声波行为预测报告",
    experimentId: "EXP-2406-021",
    type: "超声波行为预测报告",
    generatedAt: "2026-06-16 12:04",
    conclusion: "正在整合超声波片段与视频行为时间轴",
    status: "生成中",
    score: 64,
  },
  {
    id: "RPT-20260617-0930",
    name: "教学平台样例多模态融合分析报告",
    experimentId: "EXP-2406-037",
    type: "实验数据复盘报告",
    generatedAt: "2026-06-17 09:30",
    conclusion: "空白对照组行为轨迹稳定，适合作为教学复盘样例",
    status: "可下载",
    score: 86,
  },
];

export const reportTypes = [
  "小鼠行为识别报告",
  "超声波行为预测报告",
  "多模态融合分析报告",
  "药物影响辅助评估报告",
  "实验数据复盘报告",
];

export const pilotTargets = [
  "医学院实验室",
  "药企临床前研究中心",
  "神经科学研究团队",
  "动物行为学实验室",
  "CRO 机构",
  "高校科研教学单位",
];

export const pilotMethods = [
  { title: "实验数据接入", icon: DatabaseZap },
  { title: "小鼠行为分析试点", icon: Activity },
  { title: "药物实验数据复盘", icon: FlaskConical },
  { title: "本地化部署", icon: ShieldCheck },
  { title: "云端部署", icon: Sparkles },
  { title: "定制化模型开发", icon: BrainCircuit },
  { title: "科研合作", icon: Microscope },
];

export const dataTypes = [
  "普通视频",
  "红外视频",
  "超声波音频",
  "超声波数值文件",
  "实验信息表",
];

export const reportSummary = [
  { label: "行为活跃度评分", value: "82 / 100", icon: Activity },
  { label: "融合置信度", value: "93%", icon: Network },
  { label: "药物影响等级", value: "中度影响", icon: BarChart3 },
  { label: "关键影响因素", value: "静止时长、USV 密度", icon: LineChart },
];
