import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";
import { signalDateLabel } from "@/lib/dashboardPresentation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type TrendPoint = { riskPercentage: number; createdAt: Date | string };

export default function TrendChart({ points }: { points: TrendPoint[] }) {
  const chartPoints = [...points].reverse();
  if (!chartPoints.length) return <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-800 text-center"><p className="max-w-48 text-xs leading-5 text-slate-500">Your risk trend will appear here after your first completed assessment.</p></div>;
  return <Line data={{labels:chartPoints.map(point=>signalDateLabel(point.createdAt)),datasets:[{data:chartPoints.map(point=>point.riskPercentage),borderColor:"#22d3ee",backgroundColor:"rgba(34,211,238,.12)",fill:true,tension:.4,pointRadius:3,pointBackgroundColor:"#22d3ee"}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{displayColors:false,callbacks:{label:context=>`Risk signal: ${context.parsed.y}%`}}},scales:{x:{grid:{display:false},ticks:{color:"#64748b",font:{family:"DM Mono",size:9}}},y:{grid:{color:"rgba(148,163,184,.1)"},ticks:{color:"#64748b",font:{family:"DM Mono",size:9},callback:value=>`${value}%`},min:0,max:100}}}} />;
}
