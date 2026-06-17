import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  CircleDot,
  Download,
  ExternalLink,
  Inbox,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: LucideIcon;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-full text-center font-semibold leading-5 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "min-h-9 px-3 py-1.5 text-sm",
        size === "md" && "min-h-11 px-5 py-2 text-sm",
        size === "lg" && "min-h-12 px-6 py-2.5 text-base",
        variant === "primary" &&
          "bg-ink text-white shadow-glow hover:-translate-y-0.5 hover:bg-slate-900",
        variant === "secondary" &&
          "bg-white/85 text-ink shadow-sm ring-1 ring-slate-200 hover:bg-white hover:shadow-panel",
        variant === "ghost" &&
          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-ink",
        variant === "dark" &&
          "bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:bg-blue-50",
        variant === "outline" &&
          "border border-slate-200 bg-transparent text-slate-700 hover:border-blue-200 hover:bg-blue-50",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
  tight = false,
}: {
  children: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[1.75rem] border border-white/70 bg-white/82 shadow-panel backdrop-blur-xl",
        tight ? "p-4" : "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase text-blue-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  status,
  pulse,
}: {
  status: string;
  pulse?: boolean;
}) {
  const tone =
    status.includes("完成") || status.includes("可下载") || status.includes("确认")
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status.includes("中") || status.includes("生成")
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : status.includes("复核")
          ? "bg-amber-50 text-amber-700 ring-amber-200"
          : "bg-slate-50 text-slate-600 ring-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone,
      )}
    >
      {pulse ? <CircleDot className="h-3 w-3 animate-pulse" /> : null}
      {status}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <Panel tight className="group overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-blue-600">{delta}</p>
        </div>
        <div
          className={cn(
            "rounded-2xl p-3 text-white shadow-sm transition group-hover:scale-105",
            tone === "cyan" && "bg-cyan-500",
            tone === "violet" && "bg-violet-500",
            tone === "green" && "bg-emerald-500",
            tone === "amber" && "bg-amber-500",
            tone === "slate" && "bg-slate-700",
            tone === "blue" && "bg-blue-600",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Panel>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
        <Icon className="h-5 w-5" />
      </span>
      <h4 className="mt-4 text-base font-semibold text-ink">{title}</h4>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function EmptyVideoFrame({ mode = "video" }: { mode?: "video" | "infra" }) {
  return (
    <div
      className={cn(
        "relative min-h-[260px] overflow-hidden rounded-[1.5rem] border border-white/70 bg-slate-950",
        mode === "infra" && "bg-indigo-950",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(94,234,212,0.32),transparent_30%),radial-gradient(circle_at_70%_58%,rgba(72,101,255,0.35),transparent_34%)]" />
      <div className="absolute left-[19%] top-[42%] h-16 w-28 rounded-[999px] border-2 border-cyan-300/90 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.35)]" />
      <div className="absolute left-[28%] top-[37%] h-4 w-4 rounded-full border border-cyan-200 bg-cyan-200/70" />
      <div className="absolute left-[22%] top-[50%] h-1.5 w-44 rotate-12 rounded-full bg-gradient-to-r from-cyan-200 via-blue-400 to-transparent" />
      <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/20">
        {mode === "infra" ? "红外视图" : "检测视图"} · 94% 置信度
      </div>
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            className="h-1.5 rounded-full bg-cyan-200/60"
            style={{ opacity: 0.25 + index * 0.055 }}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export function Spectrogram() {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.18),rgba(15,23,42,0)),radial-gradient(circle_at_72%_30%,rgba(139,92,246,0.35),transparent_28%)]" />
      <div className="relative flex h-44 items-end gap-1">
        {Array.from({ length: 56 }).map((_, index) => {
          const height =
            22 +
            Math.abs(Math.sin(index / 2.3)) * 72 +
            Math.abs(Math.cos(index / 7)) * 20;
          return (
            <span
              key={index}
              className="flex-1 rounded-t-full bg-gradient-to-t from-blue-500 via-cyan-300 to-violet-300"
              style={{ height: `${height}%`, opacity: 0.35 + (index % 8) * 0.07 }}
            />
          );
        })}
      </div>
      <div className="relative mt-3 flex justify-between text-xs text-cyan-100/80">
        <span>20 kHz</span>
        <span>55 kHz</span>
        <span>90 kHz</span>
      </div>
    </div>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "max-w-3xl",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_40px_120px_rgba(15,23,42,0.22)] outline-none",
            width,
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold text-ink">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProgressLine({ value }: { value: number }) {
  return (
    <Progress.Root className="relative h-2.5 overflow-hidden rounded-full bg-slate-100" value={value}>
      <Progress.Indicator
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-violet-500 transition-transform duration-500"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </Progress.Root>
  );
}

export function MotionBlock({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

export function ActionLink({ children }: { children: ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
      {children}
      <ExternalLink className="h-3.5 w-3.5" />
    </button>
  );
}

export function LoadingButtonLabel({ loading, children }: { loading?: boolean; children: ReactNode }) {
  return (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {children}
    </>
  );
}

export function DownloadButton({
  children,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="outline" size="sm" icon={Download} {...props}>
      {children}
    </Button>
  );
}

export function SelectShell({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-blue-200 focus:border-blue-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-slate-400" />
    </label>
  );
}
