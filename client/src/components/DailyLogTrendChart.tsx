import { Chart as ChartJS, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type DailyLogPoint = { createdAt: Date | string; steps: number | null; sleepHours: string | number | null; waterMl: number | null };
type Metric = { key: "steps" | "sleepHours" | "waterMl"; label: string; suffix: string; color: string; fill: string; value: (log: DailyLogPoint) => number | null };

const metrics: Metric[] = [
  { key: "steps", label: "Steps", suffix: "steps", color: "#22d3ee", fill: "rgba(34,211,238,.12)", value: log => log.steps },
  { key: "sleepHours", label: "Sleep", suffix: "h", color: "#c084fc", fill: "rgba(192,132,252,.12)", value: log => log.sleepHours === null ? null : Number(log.sleepHours) },
  { key: "waterMl", label: "Water", suffix: "mL", color: "#34d399", fill: "rgba(52,211,153,.12)", value: log => log.waterMl },
];

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const dayLabel = (date: Date) => new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);

export default function DailyLogTrendChart({ logs }: { logs: DailyLogPoint[] }) {
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); return date; });
  const latestByDay = new Map<string, DailyLogPoint>();
  logs.forEach(log => { const date = new Date(log.createdAt); const key = dayKey(date); if (!latestByDay.has(key)) latestByDay.set(key, log); });
  const labels = days.map(dayLabel);

  return <div className="grid gap-4 lg:grid-cols-3">{metrics.map(metric => {
    const values = days.map(day => { const value = latestByDay.get(dayKey(day)); return value ? metric.value(value) : null; });
    const available = values.filter((value): value is number => value !== null);
    return <section key={metric.key} className="rounded-xl border border-slate-800 bg-slate-950/30 p-4"><div className="flex items-baseline justify-between"><h3 className="text-sm font-semibold text-white">{metric.label}</h3><span className="mono text-[9px] text-slate-500">LAST 7 DAYS</span></div><div className="mt-4 h-36">{available.length ? <Line data={{ labels, datasets: [{ data: values, borderColor: metric.color, backgroundColor: metric.fill, fill: true, tension: .35, pointRadius: 3, spanGaps: true, pointBackgroundColor: metric.color }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { displayColors: false, callbacks: { label: context => `${context.parsed.y} ${metric.suffix}` } } }, scales: { x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 9 } } }, y: { grid: { color: "rgba(148,163,184,.1)" }, ticks: { color: "#64748b", font: { size: 9 }, callback: value => `${value}${metric.key === "waterMl" ? "" : ""}` }, beginAtZero: true } } }} /> : <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-800 px-5 text-center text-xs leading-5 text-slate-500">Add {metric.label.toLowerCase()} in a daily check-in to start this trend.</div>}</div></section>;
  })}</div>;
}
