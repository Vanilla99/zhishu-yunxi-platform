import { experiments, type Experiment, type Report } from "../../data/platformData";

export function buildReportHtml(report: Report, experiment: Experiment) {
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

export function downloadReport(report: Report, experimentRows: Experiment[]) {
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
