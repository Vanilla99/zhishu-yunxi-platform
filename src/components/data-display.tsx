import { Eye, FileText, Play, Star, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type Experiment } from "../data/platformData";
import { cn } from "../lib/utils";
import { Button, Panel, StatusBadge } from "./ui";

export function ChartPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
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

export function ExperimentTable({
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

export function ResponsiveTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function InfoGrid({ items }: { items: Array<[string, string]> }) {
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

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
