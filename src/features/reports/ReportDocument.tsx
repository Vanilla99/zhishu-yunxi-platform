import { PanelRightOpen, Printer, RefreshCcw } from "lucide-react";
import { reportSummary, type Experiment, type Report } from "../../data/platformData";
import { cn } from "../../lib/utils";
import { MiniStat } from "../../components/data-display";
import { Button, DownloadButton, Panel, StatusBadge } from "../../components/ui";

export function ReportDocument({
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
            <p className="text-xs font-bold uppercase text-blue-600">
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
