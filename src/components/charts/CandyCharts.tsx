import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CANDY_COLORS, ChartPoint } from "../../core/chartData";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, subtitle, children, className = "" }: ChartCardProps) {
  return (
    <article className={`candy-chart-card ${className}`}>
      <header className="candy-chart-head">
        <h4 className="candy-chart-title">{title}</h4>
        {subtitle && <p className="candy-chart-sub">{subtitle}</p>}
      </header>
      <div className="candy-chart-body">{children}</div>
    </article>
  );
}

export function ChartGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const colClass = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1 lg:grid-cols-2";
  return <div className={`mb-4 grid gap-4 ${colClass}`}>{children}</div>;
}

const tooltipStyle = {
  background: "rgba(42, 16, 24, 0.96)",
  border: "1px solid rgba(251, 113, 133, 0.45)",
  borderRadius: "12px",
  color: "#ffe4e6",
  boxShadow: "0 0 24px rgba(244, 63, 94, 0.35)",
};

function fmtCurrency(v: number) {
  return `₱${v.toLocaleString()}`;
}

export function CandyPie({ data, donut = true }: { data: ChartPoint[]; donut?: boolean }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={donut ? 52 : 0} outerRadius={88} paddingAngle={3} stroke="rgba(18,3,8,0.8)" strokeWidth={2}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.fill ?? CANDY_COLORS[i % CANDY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: "#fecdd3", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CandyBar({ data, layout = "horizontal", currency = false }: { data: ChartPoint[]; layout?: "horizontal" | "vertical"; currency?: boolean }) {
  if (data.length === 0) return <EmptyChart />;
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: vertical ? 8 : -8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(251,113,133,0.12)" strokeDasharray="4 4" />
        {vertical ? (
          <>
            <XAxis type="number" tick={{ fill: "#fda4af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={currency ? fmtCurrency : undefined} />
            <YAxis type="category" dataKey="name" width={72} tick={{ fill: "#fecdd3", fontSize: 11 }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fill: "#fda4af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#fecdd3", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={currency ? fmtCurrency : undefined} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} formatter={currency ? (v) => fmtCurrency(Number(v ?? 0)) : undefined} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={42}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.fill ?? CANDY_COLORS[i % CANDY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CandyDualBar({
  data,
  keys,
}: {
  data: Array<Record<string, string | number>>;
  keys: [string, string];
}) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(251,113,133,0.12)" strokeDasharray="4 4" />
        <XAxis dataKey="name" tick={{ fill: "#fda4af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#fecdd3", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: "#fecdd3", fontSize: 12 }} />
        <Bar dataKey={keys[0]} fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar dataKey={keys[1]} fill="#34d399" radius={[6, 6, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CandyLine({ data, currency = false }: { data: ChartPoint[]; currency?: boolean }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="rgba(251,113,133,0.12)" strokeDasharray="4 4" />
        <XAxis dataKey="name" tick={{ fill: "#fda4af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#fecdd3", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={currency ? fmtCurrency : undefined} />
        <Tooltip contentStyle={tooltipStyle} formatter={currency ? (v) => fmtCurrency(Number(v ?? 0)) : undefined} />
        <Line type="monotone" dataKey="value" stroke="#fb7185" strokeWidth={3} dot={{ r: 5, fill: "#f43f5e", stroke: "#ffe4e6", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#dc2626" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CandyArea({ data, currency = false }: { data: ChartPoint[]; currency?: boolean }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="candyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(251,113,133,0.12)" strokeDasharray="4 4" />
        <XAxis dataKey="name" tick={{ fill: "#fda4af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#fecdd3", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={currency ? fmtCurrency : undefined} />
        <Tooltip contentStyle={tooltipStyle} formatter={currency ? (v) => fmtCurrency(Number(v ?? 0)) : undefined} />
        <Area type="monotone" dataKey="value" stroke="#fb7185" strokeWidth={2.5} fill="url(#candyArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CandyRadial({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="18%" outerRadius="92%" barSize={14} data={data} startAngle={180} endAngle={0}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={{ fill: "#fda4af", fontSize: 10 }} />
        <RadialBar background={{ fill: "rgba(251,113,133,0.12)" }} dataKey="value" cornerRadius={8}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.fill ?? CANDY_COLORS[i % CANDY_COLORS.length]} />
          ))}
        </RadialBar>
        <Legend wrapperStyle={{ color: "#fecdd3", fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v ?? 0)}%`} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-rose-400/30 bg-rose-950/20 text-sm text-rose-200/60">
      No chart data yet — add records to see visuals ✨
    </div>
  );
}
