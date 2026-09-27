import { Punch } from "./types";
import { formatCPFOrPIS, formatMinutesToHHMM } from "./utils";

export function exportPunchesToCsv(
  punches: Punch[],
  exportEmployee: string,
  startDateStr: string,
  endDateStr: string,
  employeeMap: Map<string, string>
): { success: boolean; error?: string } {
  const start = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
  const end = endDateStr ? new Date(endDateStr + "T23:59:59") : null;

  const filtered = punches.filter(p => {
    const matchesEmployee = exportEmployee === "all" || p.rawId === exportEmployee;
    const matchesStart = !start || p.dateObj >= start;
    const matchesEnd = !end || p.dateObj <= end;
    return matchesEmployee && matchesStart && matchesEnd;
  });

  if (filtered.length === 0) {
    return { success: false, error: "Nenhuma marcação encontrada no período e filtros informados." };
  }

  const headers = ["Nome", "Identificação (CPF/PIS)", "Data e Hora"];
  const rows = filtered.map(p => [p.name, p.cleanId, p.formattedDate]);

  const csvContent =
    "\uFEFF" +
    [headers.join(";"), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))].join("\n");

  downloadBlob(csvContent, buildFileName(exportEmployee, startDateStr, endDateStr, employeeMap));
  return { success: true };
}

export function exportCalculatedReportCsv(
  calcEmployee: string,
  employeeMap: Map<string, string>,
  calcStartDate: string,
  calcEndDate: string,
  report: any
) {
  const employeeName = employeeMap.get(calcEmployee) || "Colaborador";
  const employeeCPF = formatCPFOrPIS(calcEmployee);

  const headers = [
    "Data",
    "Dia da Semana",
    "Marcacoes de Ponto",
    "Ocorrencia/Abono",
    "Horas Abonadas (HH:MM)",
    "Trabalhado (HH:MM)",
    "Carga Esperada (HH:MM)",
    "Hora Extra (HH:MM)",
    "Pendente/Falta (HH:MM)"
  ];

  const rows = report.days.map((d: any) => {
    let ocorrencia = "Normal";
    if (d.isHoliday) ocorrencia = `Feriado: ${d.holidayDesc}`;
    else if (d.isCertificate) {
      ocorrencia = d.certType === "hours" 
        ? `Declaracao (${formatMinutesToHHMM(d.excusedMinutes)}): ${d.certReason}` 
        : `Atestado (Dia Todo): ${d.certReason}`;
    }

    return [
      d.dateStr,
      d.dayName,
      d.punchesList || "Sem batida",
      ocorrencia,
      d.excusedMinutes > 0 ? formatMinutesToHHMM(d.excusedMinutes) : "00:00",
      formatMinutesToHHMM(d.workedMinutes),
      formatMinutesToHHMM(d.expectedMinutes),
      formatMinutesToHHMM(d.overtimeMinutes),
      formatMinutesToHHMM(d.pendingMinutes)
    ];
  });

  const s = report.summary;
  const summaryRows = [
    [],
    ["RESUMO DO FECHAMENTO DO COLABORADOR"],
    ["Nome", employeeName],
    ["CPF/PIS", employeeCPF],
    ["Periodo", `${calcStartDate} ate ${calcEndDate}`],
    ["Total Horas Trabalhadas", formatMinutesToHHMM(s.totalWorked)],
    ["Total Horas Abonadas", formatMinutesToHHMM(s.totalExcused || 0)],
    ["Total Carga Esperada", formatMinutesToHHMM(s.totalExpected)],
    ["Total Horas Extras", formatMinutesToHHMM(s.totalOvertime)],
    ["Total Horas Pendentes", formatMinutesToHHMM(s.totalPending)],
    ["Saldo Final", formatMinutesToHHMM(s.finalBalance)]
  ];

  const csvContent =
    "\uFEFF" +
    [
      headers.join(";"),
      ...rows.map((row: string[]) => row.map(val => `"${val.replace(/"/g, '""')}"`).join(";")),
      ...summaryRows.map((row: string[]) => row.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

  const cleanName = employeeName.toLowerCase().replace(/\s+/g, "_");
  downloadBlob(csvContent, `fechamento_${cleanName}_${calcStartDate}_a_${calcEndDate}.csv`);
}

function downloadBlob(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function buildFileName(exportEmployee: string, start: string, end: string, employeeMap: Map<string, string>): string {
  let fileNameStr = "fechamento_ponto";
  if (exportEmployee !== "all") {
    const nameClean = (employeeMap.get(exportEmployee) || "colaborador")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    fileNameStr += `_${nameClean}`;
  }
  if (start && end) {
    fileNameStr += `_de_${start}_a_${end}`;
  }
  return `${fileNameStr}.csv`;
}