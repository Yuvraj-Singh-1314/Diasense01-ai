import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Check, Droplets, Moon, Salad, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { bmiStatus, riskTrendCopy, scoreTrendCopy } from "@/lib/insightsPresentation";

const routineActions = [
  { Icon: Salad, title: "Build a steadier plate", body: "Add fiber-forward foods to lunch and dinner." },
  { Icon: Droplets, title: "Keep hydration visible", body: "Place a water bottle where your routine already happens." },
  { Icon: Moon, title: "Protect your sleep window", body: "Aim for a consistent wind-down time on weekdays." },
];

function MetricCard({ label, icon, value, valueSuffix, status, statusClass, body, barWidth }: { label: string; icon: React.ReactNode; value: string; valueSuffix?: string; status: string; statusClass: string; body: string; barWidth?: number }) {
  return <div className="panel p-6"><div className="flex items-center justify-between"><span className="mono text-[10px] text-slate-500">{label}</span>{icon}</div><div className="mt-8 text-4xl font-bold text-white">{value}{valueSuffix && <span className="text-lg text-slate-500">{valueSuffix}</span>}</div><div className={`mt-2 text-sm ${statusClass}`}>{status}</div>{barWidth !== undefined && <div className="mt-5 h-2 bg-slate-800"><div className="h-full bg-cyan-300" style={{ width: `${barWidth}%` }}/></div>}<p className="mt-4 text-xs leading-5 text-slate-500">{body}</p></div>;
}

export default function Insights() {
  const { user, loading, error } = useAuth();
  const summary = trpc.dashboard.summary.useQuery(undefined, { enabled: Boolean(user), refetchOnWindowFocus: true });
  const [routine, setRoutine] = useState<string[]>([]);
  const routineKey = user ? `diasense-routine-${user.id}` : "";

  useEffect(() => { if (!routineKey) return; try { setRoutine(JSON.parse(localStorage.getItem(routineKey) ?? "[]")); } catch { setRoutine([]); } }, [routineKey]);
  const toggleRoutine = (title: string) => { const next = routine.includes(title) ? routine.filter(item => item !== title) : [...routine, title]; setRoutine(next); if (routineKey) localStorage.setItem(routineKey, JSON.stringify(next)); };

  if (loading) return <div className="app-shell grid min-h-screen place-items-center"><div className="eyebrow">Loading secure insights</div></div>;
  if (error || !user) return <div className="app-shell grid min-h-screen place-items-center p-6"><div className="panel p-8 text-center"><div className="eyebrow">Authentication required</div><h1 className="mt-4 text-2xl font-bold text-white">Sign in to view your insights.</h1><Link href="/auth" className="btn-primary mt-6 inline-flex px-5 py-3 no-underline">Open secure sign in</Link></div></div>;

  const history = summary.data?.history ?? [];
  const latest = summary.data?.latest ?? null;
  const bmi = latest ? bmiStatus(latest.bmi) : null;
  const risk = riskTrendCopy(history);
  const score = scoreTrendCopy(history);

  return <div className="app-shell"><div className="container-wide py-10"><Link href="/dashboard" className="text-sm text-slate-400 no-underline">← Back to overview</Link><div className="mt-10"><div className="eyebrow">Personalized intelligence</div><h1 className="mt-3 text-4xl font-bold text-white">Your health insights.</h1><p className="mt-2 text-slate-400">Your BMI, risk trend, and health score are calculated from your latest saved assessment data.</p></div>{summary.isError && <div className="mt-6 rounded-lg border border-rose-300/20 bg-rose-300/5 p-4 text-sm text-rose-100">We could not refresh your insights. Please try again.</div>}<div className="mt-10 grid gap-4 md:grid-cols-3">{latest && bmi ? <MetricCard label="BMI ANALYSIS" icon={<Activity size={18} className="text-cyan-300"/>} value={latest.bmi.toFixed(1)} status={bmi.label} statusClass={bmi.tone} barWidth={bmi.width} body={history.length > 1 ? "This uses your newest saved BMI and recent assessment history." : "This is based on your latest completed assessment."}/> : <MetricCard label="BMI ANALYSIS" icon={<Activity size={18} className="text-cyan-300"/>} value="—" status="No assessment yet" statusClass="text-slate-400" body="Complete an assessment to see your personal BMI signal."/>}<MetricCard label="RISK TREND" icon={<TrendingDown size={18} className="text-emerald-300"/>} value={risk.value} status={risk.label} statusClass={risk.value.startsWith("+") ? "text-amber-300" : "text-emerald-300"} body={risk.body}/><MetricCard label="HEALTH SCORE" icon={<ArrowUpRight size={18} className="text-fuchsia-300"/>} value={latest ? String(latest.healthScore) : "—"} valueSuffix={latest ? " of 100" : undefined} status={score.label} statusClass={score.value.startsWith("-") ? "text-amber-300" : "text-fuchsia-200"} body={score.body}/></div><section className="panel mt-5 p-6 sm:p-8"><div className="eyebrow">Recommended this week</div><h2 className="mt-3 text-2xl font-semibold text-white">Three practical levers.</h2><p className="mt-2 text-sm text-slate-400">{routine.length ? `${routine.length} action${routine.length === 1 ? "" : "s"} added to your routine.` : "Choose an action to add it to your routine."}</p><div className="mt-8 grid gap-4 md:grid-cols-3">{routineActions.map(({ Icon, title, body }) => { const isAdded = routine.includes(title); return <div key={title} className="rounded-lg border border-slate-800 bg-slate-950/40 p-5"><Icon size={19} className="text-cyan-300"/><h3 className="mt-6 font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{body}</p><button type="button" aria-pressed={isAdded} onClick={() => toggleRoutine(title)} className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold transition ${isAdded ? "text-emerald-300" : "text-cyan-300 hover:text-cyan-100"}`}>{isAdded ? <><Check size={14}/>Added to routine</> : "Add to routine →"}</button></div>; })}</div></section></div></div>;
}
