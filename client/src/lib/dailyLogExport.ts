import { jsPDF } from "jspdf";

export type ExportableDailyLog = { createdAt: Date | string; glucose: string | number | null; systolicPressure: number | null; diastolicPressure: number | null; steps: number | null; sleepHours: string | number | null; waterMl: number | null; movementMinutes: number | null };

const csvCell = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const formatDate = (value: Date | string) => new Date(value).toLocaleString();

export function buildDailyLogsCsv(logs: ExportableDailyLog[]) {
  const header = ["Date", "Glucose (mg/dL)", "Blood pressure", "Steps", "Sleep (hours)", "Water (mL)", "Movement (minutes)"];
  const rows = logs.map(log => [formatDate(log.createdAt), log.glucose, log.systolicPressure !== null && log.diastolicPressure !== null ? `${log.systolicPressure}/${log.diastolicPressure}` : null, log.steps, log.sleepHours, log.waterMl, log.movementMinutes].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\n");
}

export function downloadDailyLogsCsv(logs: ExportableDailyLog[]) {
  const blob = new Blob([buildDailyLogsCsv(logs)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "diasense-daily-health-logs.csv"; anchor.click(); URL.revokeObjectURL(url);
}

export function downloadDailyLogsPdf(name: string, logs: ExportableDailyLog[]) {
  const pdf = new jsPDF();
  pdf.setFillColor(7, 9, 13); pdf.rect(0, 0, 210, 297, "F");
  pdf.setTextColor(34, 211, 238); pdf.setFontSize(11); pdf.text("DIASENSE AI · PRIVATE DAILY HEALTH LOG", 20, 22);
  pdf.setTextColor(248, 250, 252); pdf.setFontSize(22); pdf.text("Daily Health Check-in Export", 20, 39);
  pdf.setTextColor(148, 163, 184); pdf.setFontSize(10); pdf.text(`Account: ${name || "Account holder"}`, 20, 53); pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 61);
  let y = 78;
  if (!logs.length) { pdf.text("No daily health logs have been recorded yet.", 20, y); }
  logs.forEach((log, index) => {
    const values = [`Glucose: ${log.glucose ?? "—"} mg/dL`, `BP: ${log.systolicPressure !== null && log.diastolicPressure !== null ? `${log.systolicPressure}/${log.diastolicPressure}` : "—"}`, `Steps: ${log.steps ?? "—"}`, `Sleep: ${log.sleepHours ?? "—"} h`, `Water: ${log.waterMl ?? "—"} mL`, `Movement: ${log.movementMinutes ?? "—"} min`];
    if (y > 260) { pdf.addPage(); pdf.setFillColor(7, 9, 13); pdf.rect(0, 0, 210, 297, "F"); y = 24; }
    pdf.setTextColor(34, 211, 238); pdf.setFontSize(10); pdf.text(`${index + 1}. ${formatDate(log.createdAt)}`, 20, y);
    pdf.setTextColor(226, 232, 240); pdf.setFontSize(9); pdf.text(values.join("   |   "), 20, y + 9); y += 21;
  });
  if (y > 270) { pdf.addPage(); y = 24; }
  pdf.setTextColor(245, 158, 11); pdf.setFontSize(9); pdf.text("SELF-TRACKING NOTICE", 20, y + 8); pdf.setTextColor(148, 163, 184); pdf.text("This export is informational and does not provide medical diagnosis or treatment advice.", 20, y + 16);
  pdf.save("diasense-daily-health-logs.pdf");
}
