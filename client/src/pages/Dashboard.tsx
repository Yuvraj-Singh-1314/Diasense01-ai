import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BarChart3, Bell, ClipboardPlus, FileText, HeartPulse, Lightbulb, LogOut, Menu, Moon, Plus, Settings, ShieldCheck, Sun, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import TrendChart from "@/components/TrendChart";
import { greetingForHour, latestSignalCopy, signalDateLabel } from "@/lib/dashboardPresentation";

const nav = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/assessment", label: "New assessment", icon: Plus },
  { href: "/daily-log", label: "Daily check-in", icon: ClipboardPlus },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/insights", label: "Health insights", icon: Lightbulb },
  { href: "/assistant", label: "AI health assistant", icon: HeartPulse },
];

const categoryTone = (category?: string | null) => category === "High risk" ? "text-rose-300" : category === "Moderate risk" ? "text-amber-300" : "text-emerald-300";
const categoryDot = (category?: string | null) => category === "High risk" ? "bg-rose-300" : category === "Moderate risk" ? "bg-amber-300" : "bg-emerald-300";

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div><span className="mono text-[9px] text-slate-500">{label}</span><b className={`mt-1 block text-xl ${accent ? "text-fuchsia-200" : "text-white"}`}>{value}</b></div>;
}

function AuthState({ title, detail }: { title: string; detail?: string }) {
  return <div className="app-shell grid min-h-screen place-items-center p-6"><div className="panel bracket max-w-md p-8 text-center"><div className="eyebrow">Authentication required</div><h1 className="mt-4 text-3xl font-bold text-white">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{detail ?? "Please sign in to access your private health workspace."}</p><Link href="/auth" className="btn-primary mt-7 inline-flex px-5 py-3 no-underline">Open secure sign in</Link></div></div>;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, error } = useAuth();
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => navigate("/") });
  const summary = trpc.dashboard.summary.useQuery(undefined, { enabled: Boolean(user), refetchOnWindowFocus: true });
  const dailyReminders = trpc.dailyReminders.status.useQuery(undefined, { enabled: Boolean(user), refetchOnWindowFocus: true });
  const markDailyReminderSeen = trpc.dailyReminders.markSeen.useMutation({ onSuccess: () => dailyReminders.refetch() });
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = window.setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) return <AuthState title="We couldn’t verify your session." />;
  if (loading) return <div className="app-shell grid min-h-screen place-items-center"><div className="eyebrow">Loading secure workspace</div></div>;
  if (!user) return <AuthState title="Sign in to continue." detail="Your assessments and reports are private to your account." />;

  const latest = summary.data?.latest ?? null;
  const history = summary.data?.history ?? [];
  const displayDate = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const snapshotDate = latest ? signalDateLabel(latest.createdAt, { month: "short", day: "2-digit", year: "numeric" }).toUpperCase() : null;

  return <div className="app-shell"><div className="flex min-h-screen">
    <aside className="hidden w-64 shrink-0 border-r border-slate-800/70 bg-slate-950/40 p-5 md:flex md:flex-col">
      <Link href="/" className="mb-12 flex items-center gap-3 text-white no-underline"><span className="grid h-9 w-9 place-items-center border border-cyan-300/50 bg-cyan-300/10 text-cyan-200"><Activity size={17}/></span><b>DiaSense <span className="text-cyan-300">AI</span></b></Link>
      <div className="eyebrow mb-3">Workspace</div>
      <nav className="space-y-1">{nav.map(item => <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm no-underline ${item.href === "/dashboard" ? "bg-cyan-300/10 text-cyan-200" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}><item.icon size={17}/>{item.label}</Link>)}</nav>
      <div className="eyebrow mb-3 mt-10">Account</div>
      <div className="space-y-1 text-sm text-slate-400"><Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-3 no-underline hover:bg-slate-800/60 hover:text-white"><UserRound size={17}/>Profile</Link><Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-3 no-underline hover:bg-slate-800/60 hover:text-white"><Settings size={17}/>Settings</Link></div>
      <div className="mt-auto pt-20"><div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"><div className="flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck size={15}/> Data protected</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Your information is private to your account.</p></div><button onClick={() => logout.mutate()} disabled={logout.isPending} className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-white"><LogOut size={17}/>{logout.isPending ? "Signing out…" : "Sign out"}</button></div>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="flex items-center justify-between border-b border-slate-800/70 px-5 py-4 sm:px-10"><div className="flex items-center gap-3"><Menu className="text-slate-500 md:hidden" size={20}/><span className="mono text-xs text-slate-500">WORKSPACE · LIVE OVERVIEW</span></div><button onClick={toggleTheme} aria-label="Toggle app theme" className="btn-ghost grid h-9 w-9 place-items-center rounded-full">{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}</button></header>
      <div className="container-wide py-10">
        {dailyReminders.data?.notice && <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 p-4"><div className="flex items-start gap-3"><Bell className="mt-0.5 text-fuchsia-200" size={17}/><div><div className="mono text-[9px] text-fuchsia-200">DAILY CHECK-IN REMINDER</div><p className="mt-1 text-sm text-fuchsia-50">{dailyReminders.data.notice.message}</p></div></div><div className="flex gap-3"><Link href="/daily-log" className="text-xs font-semibold text-cyan-300 no-underline">Open daily log</Link><button onClick={() => markDailyReminderSeen.mutate({ noticeId: dailyReminders.data!.notice!.id })} disabled={markDailyReminderSeen.isPending} className="text-xs text-slate-300 hover:text-white">Mark as seen</button></div></div>}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="eyebrow">{displayDate}</div><h1 className="mt-3 text-4xl font-bold tracking-tight text-white">{greetingForHour(hour)}, {user.name ?? "there"}.</h1><p className="mt-2 max-w-xl text-slate-400">{latestSignalCopy(latest)}</p></div><Link href="/assessment" className="btn-primary inline-flex items-center justify-center px-4 py-3 text-sm no-underline"><Plus size={16} className="mr-2"/> New assessment</Link></div>
        {summary.isError && <div className="mb-5 rounded-lg border border-rose-300/20 bg-rose-300/5 p-4 text-sm text-rose-100">We could not refresh your health data right now. Please refresh and try again.</div>}
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <section className="panel bracket p-6 sm:p-8"><div className="flex flex-col justify-between gap-8 sm:flex-row"><div><div className="mono text-[10px] text-slate-500">{snapshotDate ? `LATEST RISK SNAPSHOT · ${snapshotDate}` : "LATEST RISK SNAPSHOT"}</div><div className="mt-5 flex items-end gap-3"><span className="text-7xl font-extrabold tracking-[-.08em] text-white">{latest ? latest.riskPercentage : "—"}</span><span className="pb-3 text-xl text-slate-500">{latest ? "%" : ""}</span></div><div className={`mt-2 flex items-center gap-2 text-sm ${categoryTone(latest?.category)}`}><span className={`h-2 w-2 rounded-full ${categoryDot(latest?.category)}`}/>{latest ? `${latest.category} · Latest completed assessment` : "No assessment yet"}</div></div><div className="grid h-36 w-36 place-items-center rounded-full" style={{ background: latest ? `conic-gradient(#22d3ee 0 ${latest.riskPercentage}%, #1e293b ${latest.riskPercentage}% 100%)` : "conic-gradient(#1e293b 0 100%)" }}><div className="grid h-28 w-28 place-items-center rounded-full bg-slate-950 text-center"><ShieldCheck className="text-cyan-300" size={22}/><span className="mono text-[9px] text-slate-500">CONFIDENCE</span><b className="text-white">{latest ? `${latest.confidence}%` : "—"}</b></div></div></div><div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-800 pt-5"><Metric label="HEALTH SCORE" value={latest ? `${latest.healthScore}/100` : "—"} accent/><Metric label="BMI" value={latest ? latest.bmi.toFixed(1) : "—"}/><Metric label="ASSESSMENTS" value={String(history.length).padStart(2, "0")}/></div></section>
          <section className="panel p-6"><div className="mono text-[10px] text-slate-500">CURRENT DATA</div><div className="mt-8 grid h-12 w-12 place-items-center rounded-lg bg-cyan-300/10 text-cyan-300"><HeartPulse size={21}/></div><h2 className="mt-5 text-lg font-semibold text-white">{latest ? `${latest.category} signal` : "Start your first assessment"}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{latest ? `Latest activity level: ${latest.activity}. Your dashboard refreshes whenever a new assessment is completed.` : "Complete your assessment to see a personal risk snapshot, score, BMI, and trend."}</p><Link href="/assessment" className="mt-6 inline-block text-xs font-semibold text-cyan-300 no-underline hover:text-cyan-100">{latest ? "Update your data →" : "Run an assessment →"}</Link></section>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <section className="panel p-6"><div className="flex items-center justify-between"><div><div className="eyebrow">Signal history</div><h2 className="mt-2 text-xl font-semibold text-white">Risk trend</h2></div><span className="mono text-[10px] text-slate-500">{history.length ? `${history.length} RECENT ASSESSMENTS` : "AWAITING DATA"}</span></div><div className="mt-8 h-44"><TrendChart points={history}/></div></section>
          <section className="panel p-6"><div className="eyebrow">Recent activity</div><h2 className="mt-2 text-xl font-semibold text-white">Assessment history</h2><div className="mt-6 space-y-4">{history.length ? history.slice(0, 3).map(signal => <div key={signal.id} className="flex items-center justify-between border-b border-slate-800 pb-3"><div><div className="mono text-[10px] text-slate-500">{signalDateLabel(signal.createdAt)}</div><div className={`mt-1 text-sm ${categoryTone(signal.category)}`}>{signal.category}</div></div><span className="font-semibold text-cyan-300">{signal.riskPercentage}%</span></div>) : <p className="text-sm leading-6 text-slate-500">No completed assessments yet.</p>}</div><Link href="/reports" className="mt-5 inline-block text-xs font-semibold text-cyan-300 no-underline">View all reports →</Link></section>
        </div>
      </div>
    </main>
  </div></div>;
}
