type ChartDatum = Record<string, string | number>;

type SeriesConfig = {
  key: string;
  label: string;
  color: string;
  fill?: string;
};

type PieDatum = {
  name: string;
  value: number;
  fill: string;
};

const chartPadding = {
  top: 18,
  right: 18,
  bottom: 32,
  left: 42,
};

function numberValue(item: ChartDatum, key: string) {
  const value = item[key];
  return typeof value === "number" ? value : Number(value) || 0;
}

function labelValue(item: ChartDatum, key: string) {
  return String(item[key] ?? "");
}

function getChartBounds(height: number) {
  return {
    width: 620,
    height,
    plotWidth: 620 - chartPadding.left - chartPadding.right,
    plotHeight: height - chartPadding.top - chartPadding.bottom,
  };
}

function scalePoint(index: number, length: number, plotWidth: number) {
  if (length <= 1) return chartPadding.left + plotWidth / 2;
  return chartPadding.left + (index / (length - 1)) * plotWidth;
}

function scaleY(value: number, max: number, plotHeight: number) {
  return chartPadding.top + (1 - value / max) * plotHeight;
}

function linePath(data: ChartDatum[], key: string, max: number, plotWidth: number, plotHeight: number) {
  return data
    .map((item, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${scalePoint(index, data.length, plotWidth).toFixed(1)} ${scaleY(
        numberValue(item, key),
        max,
        plotHeight,
      ).toFixed(1)}`;
    })
    .join(" ");
}

function areaPath(data: ChartDatum[], key: string, max: number, plotWidth: number, plotHeight: number) {
  const line = linePath(data, key, max, plotWidth, plotHeight);
  const baseline = chartPadding.top + plotHeight;
  const endX = scalePoint(data.length - 1, data.length, plotWidth);
  const startX = scalePoint(0, data.length, plotWidth);
  return `${line} L ${endX.toFixed(1)} ${baseline} L ${startX.toFixed(1)} ${baseline} Z`;
}

function maxForSeries(data: ChartDatum[], series: SeriesConfig[]) {
  const max = data.reduce(
    (current, item) =>
      Math.max(current, ...series.map((entry) => numberValue(item, entry.key))),
    0,
  );
  return Math.max(max, 1);
}

function AxisLabels({ data, xKey, width, height }: { data: ChartDatum[]; xKey: string; width: number; height: number }) {
  const lastIndex = data.length - 1;
  const labelIndexes = Array.from(new Set([0, Math.floor(lastIndex / 2), lastIndex])).filter(
    (index) => index >= 0,
  );

  return (
    <>
      {labelIndexes.map((index) => (
        <text
          key={index}
          x={scalePoint(index, data.length, width - chartPadding.left - chartPadding.right)}
          y={height - 10}
          textAnchor="middle"
          className="fill-slate-400 text-[11px] font-semibold"
        >
          {labelValue(data[index], xKey)}
        </text>
      ))}
    </>
  );
}

function GridLines({ width, height }: { width: number; height: number }) {
  const { plotHeight } = getChartBounds(height);

  return (
    <>
      {[0, 0.33, 0.66, 1].map((offset) => {
        const y = chartPadding.top + plotHeight * offset;
        return (
          <line
            key={offset}
            x1={chartPadding.left}
            x2={width - chartPadding.right}
            y1={y}
            y2={y}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
        );
      })}
    </>
  );
}

export function DonutChart({ data }: { data: PieDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = data
    .map((item) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;
      return `${item.fill} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    })
    .join(", ");

  return (
    <div className="grid min-h-[280px] place-items-center">
      <div
        className="relative grid h-56 w-56 place-items-center rounded-full shadow-inner"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-sm">
          <div>
            <p className="text-3xl font-semibold text-ink">{total}%</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">行为分布</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AreaTrendChart({
  data,
  xKey,
  series,
  height = 300,
  compact = false,
}: {
  data: ChartDatum[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  compact?: boolean;
}) {
  const { width, plotWidth, plotHeight } = getChartBounds(height);
  const max = maxForSeries(data, series) * 1.12;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      <defs>
        {series.map((item) => (
          <linearGradient key={item.key} id={`area-${item.key}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={item.fill ?? item.color} stopOpacity={0.34} />
            <stop offset="95%" stopColor={item.fill ?? item.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {compact ? null : <GridLines width={width} height={height} />}
      {series.map((item) => (
        <path
          key={`${item.key}-area`}
          d={areaPath(data, item.key, max, plotWidth, plotHeight)}
          fill={`url(#area-${item.key})`}
        />
      ))}
      {series.map((item) => (
        <path
          key={`${item.key}-line`}
          d={linePath(data, item.key, max, plotWidth, plotHeight)}
          fill="none"
          stroke={item.color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
      ))}
      {compact ? null : <AxisLabels data={data} xKey={xKey} width={width} height={height} />}
    </svg>
  );
}

export function LineTrendChart({
  data,
  xKey,
  series,
  height = 300,
}: {
  data: ChartDatum[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
}) {
  const { width, plotWidth, plotHeight } = getChartBounds(height);
  const max = maxForSeries(data, series) * 1.12;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      <GridLines width={width} height={height} />
      {series.map((item) => (
        <g key={item.key}>
          <path
            d={linePath(data, item.key, max, plotWidth, plotHeight)}
            fill="none"
            stroke={item.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
          {data.map((datum, index) => (
            <circle
              key={`${item.key}-${labelValue(datum, xKey)}`}
              cx={scalePoint(index, data.length, plotWidth)}
              cy={scaleY(numberValue(datum, item.key), max, plotHeight)}
              r={4.5}
              fill="white"
              stroke={item.color}
              strokeWidth={2.5}
            />
          ))}
        </g>
      ))}
      <AxisLabels data={data} xKey={xKey} width={width} height={height} />
    </svg>
  );
}

export function GroupedBarChart({
  data,
  xKey,
  series,
  height = 300,
  xAxisLabel,
}: {
  data: ChartDatum[];
  xKey: string;
  series: SeriesConfig[];
  height?: number;
  xAxisLabel?: string;
}) {
  const { width, plotWidth, plotHeight } = getChartBounds(height);
  const max = maxForSeries(data, series) * 1.12;
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(34, (groupWidth - 18) / series.length);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      <GridLines width={width} height={height} />
      {data.map((datum, dataIndex) => {
        const groupStart = chartPadding.left + dataIndex * groupWidth;
        return (
          <g key={labelValue(datum, xKey)}>
            {series.map((item, seriesIndex) => {
              const value = numberValue(datum, item.key);
              const barHeight = (value / max) * plotHeight;
              const x =
                groupStart +
                groupWidth / 2 -
                (barWidth * series.length) / 2 +
                seriesIndex * barWidth;
              const y = chartPadding.top + plotHeight - barHeight;
              return (
                <rect
                  key={item.key}
                  x={x}
                  y={y}
                  width={barWidth - 2}
                  height={barHeight}
                  rx={8}
                  fill={item.color}
                />
              );
            })}
            <text
              x={groupStart + groupWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] font-semibold"
            >
              {labelValue(datum, xKey)}
            </text>
          </g>
        );
      })}
      {xAxisLabel ? (
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          className="fill-slate-400 text-[10px] font-semibold"
        >
          {xAxisLabel}
        </text>
      ) : null}
    </svg>
  );
}

export function ChartLegend({ series }: { series: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
      {series.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
