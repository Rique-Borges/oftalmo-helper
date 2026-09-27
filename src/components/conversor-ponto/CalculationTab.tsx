import React, { useState, useMemo } from "react";
import { 
  User, 
  ArrowUpDown, 
  Search, 
  CalendarDays, 
  Plus, 
  Trash2, 
  FileText, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet,
  CheckSquare
} from "lucide-react";
import { EmployeeRow, Holiday, MedicalCertificate, EmployeeCategory, Punch } from "@/lib/conversor-ponto/types";
import { parseHHMMToMinutes, formatMinutesToHHMM, daysOfWeekBr } from "@/lib/conversor-ponto/utils";
import { exportCalculatedReportCsv } from "@/lib/conversor-ponto/export-csv";

interface CalculationTabProps {
  punches: Punch[];
  employeeMap: Map<string, string>;
  collaboratorsList: EmployeeRow[];
  calcEmployee: string;
  setCalcEmployee: (id: string) => void;
  calcStartDate: string;
  setCalcStartDate: (d: string) => void;
  calcEndDate: string;
  setCalcEndDate: (d: string) => void;
}

export const CalculationTab: React.FC<CalculationTabProps> = ({
  punches,
  employeeMap,
  collaboratorsList,
  calcEmployee,
  setCalcEmployee,
  calcStartDate,
  setCalcStartDate,
  calcEndDate,
  setCalcEndDate
}) => {
  const [isCalcComboOpen, setIsCalcComboOpen] = useState(false);
  const [calcComboSearch, setCalcComboSearch] = useState("");
  const [employeeCategory, setEmployeeCategory] = useState<EmployeeCategory>("comercial");
  
  const [schedule, setSchedule] = useState<Record<number, string>>({
    1: "08:00", 2: "08:00", 3: "08:00", 4: "08:00", 5: "08:00", 6: "04:00", 0: "00:00"
  });

  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: "1", dateStr: "2026-07-09", description: "Revolução Constitucionalista (Exemplo)" }
  ]);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("2026-07-01");
  const [newHolidayDesc, setNewHolidayDesc] = useState("");

  // Formulário de Atestados / Declarações
  const [newCertDate, setNewCertDate] = useState("2026-07-01");
  const [newCertEmployee, setNewCertEmployee] = useState("all");
  const [newCertType, setNewCertType] = useState<"full" | "hours">("full");
  const [newCertHours, setNewCertHours] = useState("02:00");
  const [newCertReason, setNewCertReason] = useState("");

  const handleCategoryChange = (category: EmployeeCategory) => {
    setEmployeeCategory(category);
    if (category === "comercial") {
      setSchedule({ 1: "08:00", 2: "08:00", 3: "08:00", 4: "08:00", 5: "08:00", 6: "04:00", 0: "00:00" });
    } else if (category === "call_center") {
      setSchedule({ 1: "06:00", 2: "06:00", 3: "06:00", 4: "06:00", 5: "06:00", 6: "06:00", 0: "00:00" });
    } else if (category === "estagiario") {
      setSchedule({ 1: "06:00", 2: "06:00", 3: "06:00", 4: "06:00", 5: "06:00", 6: "00:00", 0: "00:00" });
    }
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayDesc.trim()) return;
    if (holidays.some(h => h.dateStr === newHolidayDate)) {
      alert("Já existe um feriado cadastrado para esta data.");
      return;
    }
    setHolidays(prev => [...prev, { id: Date.now().toString(), dateStr: newHolidayDate, description: newHolidayDesc.trim() }]);
    setNewHolidayDesc("");
  };

  const handleAddCertificate = () => {
    if (!newCertDate || (!calcEmployee && newCertEmployee === "all")) return;
    const certMinutes = newCertType === "hours" ? parseHHMMToMinutes(newCertHours) : 0;

    setCertificates(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        dateStr: newCertDate,
        rawId: newCertEmployee === "all" ? (calcEmployee !== "all" ? calcEmployee : "all") : newCertEmployee,
        type: newCertType,
        hours: newCertType === "hours" ? newCertHours : undefined,
        minutes: certMinutes,
        reason: newCertReason.trim() || (newCertType === "full" ? "Atestado Médico (Dia Todo)" : `Declaração de ${newCertHours}h`)
      }
    ]);
    setNewCertReason("");
  };

  const calcDatesRange = useMemo<string[]>(() => {
    if (!calcStartDate || !calcEndDate) return [];
    const dates: string[] = [];
    const start = new Date(calcStartDate + "T00:00:00");
    const end = new Date(calcEndDate + "T00:00:00");
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toLocaleDateString("sv-SE"));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [calcStartDate, calcEndDate]);

  const calcEmployeeReport = useMemo(() => {
    if (!calcEmployee || calcEmployee === "all" || calcDatesRange.length === 0) {
      return { days: [], summary: { totalWorked: 0, totalExpected: 0, totalOvertime: 0, totalPending: 0, totalExcused: 0, finalBalance: 0 } };
    }

    const employeePunches = punches.filter(p => p.rawId === calcEmployee);
    let totalWorked = 0, totalExpected = 0, totalOvertime = 0, totalPending = 0, totalExcused = 0;

    const calculatedDays = calcDatesRange.map(dateStr => {
      const currentDateObj = new Date(dateStr + "T00:00:00");
      const dayOfWeek = currentDateObj.getDay();

      const dayPunches = employeePunches
        .filter(p => p.dateObj.toLocaleDateString("sv-SE") === dateStr)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      const holidayInfo = holidays.find(h => h.dateStr === dateStr);
      const certInfo = certificates.find(c => c.dateStr === dateStr && (c.rawId === "all" || c.rawId === calcEmployee));

      let expectedLoadStr = schedule[dayOfWeek] || "00:00";
      let expectedMinutes = parseHHMMToMinutes(expectedLoadStr);
      const isHoliday = !!holidayInfo;
      const isCertificate = !!certInfo;
      const isFullDayCert = isCertificate && certInfo.type === "full";

      let excusedMinutes = 0;
      if (isFullDayCert) {
        excusedMinutes = expectedMinutes;
        expectedMinutes = 0;
      } else if (isCertificate && certInfo.type === "hours") {
        excusedMinutes = certInfo.minutes || 0;
      }

      if (isHoliday) {
        expectedMinutes = 0;
      }

      let workedMinutes = 0;
      const isOddPunches = dayPunches.length % 2 !== 0;
      const loops = isOddPunches ? dayPunches.length - 1 : dayPunches.length;

      for (let i = 0; i < loops; i += 2) {
        const t1 = dayPunches[i].dateObj.getTime();
        const t2 = dayPunches[i + 1].dateObj.getTime();
        workedMinutes += Math.round((t2 - t1) / 60000);
      }

      let overtimeMinutes = 0;
      let pendingMinutes = 0;

      if (!isHoliday && !isFullDayCert) {
        // Horas trabalhadas + horas abonadas pela declaração
        const effectiveCoveredMinutes = workedMinutes + excusedMinutes;
        if (effectiveCoveredMinutes > expectedMinutes) {
          overtimeMinutes = effectiveCoveredMinutes - expectedMinutes;
        } else if (effectiveCoveredMinutes < expectedMinutes) {
          pendingMinutes = expectedMinutes - effectiveCoveredMinutes;
        }
      } else {
        if (workedMinutes > 0) overtimeMinutes = workedMinutes;
      }

      totalWorked += workedMinutes;
      totalExpected += expectedMinutes;
      totalOvertime += overtimeMinutes;
      totalPending += pendingMinutes;
      totalExcused += excusedMinutes;

      const punchesListText = dayPunches.map(p => {
        const h = String(p.dateObj.getHours()).padStart(2, "0");
        const m = String(p.dateObj.getMinutes()).padStart(2, "0");
        return `${h}:${m}`;
      }).join(" | ");

      return {
        dateStr,
        formattedDate: currentDateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        dayName: daysOfWeekBr[dayOfWeek],
        punchesList: punchesListText,
        isOddPunches,
        isHoliday,
        holidayDesc: holidayInfo?.description,
        isCertificate,
        certType: certInfo?.type,
        certReason: certInfo?.reason,
        excusedMinutes,
        workedMinutes,
        expectedMinutes,
        overtimeMinutes,
        pendingMinutes
      };
    });

    const finalBalance = totalOvertime - totalPending;
    return {
      days: calculatedDays,
      summary: { totalWorked, totalExpected, totalOvertime, totalPending, totalExcused, finalBalance }
    };
  }, [calcEmployee, calcDatesRange, punches, schedule, holidays, certificates]);

  const filteredCalcComboEmployees = useMemo(() => {
    return collaboratorsList.filter(emp =>
      emp.name.toLowerCase().includes(calcComboSearch.toLowerCase()) || emp.cleanId.includes(calcComboSearch)
    );
  }, [collaboratorsList, calcComboSearch]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Coluna Esquerda: Filtros e Configurações */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-950 flex items-center gap-2">
            <User size={18} className="text-indigo-600" /> Filtros de Fechamento
          </h3>

          <div className="space-y-1.5 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Selecione o Colaborador</label>
            <button
              type="button"
              onClick={() => setIsCalcComboOpen(!isCalcComboOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            >
              <span className="truncate">
                {calcEmployee && calcEmployee !== "all"
                  ? employeeMap.get(calcEmployee) || "Selecionar..."
                  : "Selecione um colaborador..."}
              </span>
              <ArrowUpDown size={14} className="opacity-50 shrink-0 ml-2" />
            </button>

            {isCalcComboOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsCalcComboOpen(false)} />
            )}

            {isCalcComboOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md flex flex-col">
                <div className="flex items-center border-b border-slate-100 px-3 py-2">
                  <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar nome..."
                    value={calcComboSearch}
                    onChange={(e) => setCalcComboSearch(e.target.value)}
                    className="w-full text-sm outline-none border-none bg-transparent text-slate-900 focus:ring-0"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-40 py-1 divide-y divide-slate-50">
                  {filteredCalcComboEmployees.map(emp => (
                    <button
                      key={emp.rawId}
                      type="button"
                      onClick={() => {
                        setCalcEmployee(emp.rawId);
                        setIsCalcComboOpen(false);
                        setCalcComboSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 transition flex flex-col gap-0.5 ${
                        calcEmployee === emp.rawId ? "bg-indigo-50/50 text-indigo-700 font-semibold" : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">CPF/PIS: {emp.cleanId}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Início</label>
              <input
                type="date"
                value={calcStartDate}
                onChange={(e) => setCalcStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fim</label>
              <input
                type="date"
                value={calcEndDate}
                onChange={(e) => setCalcEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Feriados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-950 flex items-center gap-2">
            <CalendarDays size={18} className="text-amber-600" /> Feriados Cadastrados
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
              />
              <input
                type="text"
                placeholder="Nome..."
                value={newHolidayDesc}
                onChange={(e) => setNewHolidayDesc(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
              />
            </div>
            <button
              onClick={handleAddHoliday}
              className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Adicionar Feriado
            </button>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-slate-100">
            {holidays.map(h => (
              <div key={h.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{new Date(h.dateStr + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  <span className="block text-[11px] text-slate-500">{h.description}</span>
                </div>
                <button onClick={() => setHolidays(prev => prev.filter(item => item.id !== h.id))} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Atestados & Declaração de Horas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-950 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Atestados & Declarações
          </h3>

          <div className="space-y-2.5">
            {/* Seletor de Tipo */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setNewCertType("full")}
                className={`py-1.5 rounded-md transition ${newCertType === "full" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                🏥 Atestado (Dia)
              </button>
              <button
                type="button"
                onClick={() => setNewCertType("hours")}
                className={`py-1.5 rounded-md transition ${newCertType === "hours" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                ⏱️ Declaração (Horas)
              </button>
            </div>

            <div className={`grid ${newCertType === "hours" ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase">Data</label>
                <input
                  type="date"
                  value={newCertDate}
                  onChange={(e) => setNewCertDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                />
              </div>
              {newCertType === "hours" && (
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Horas a Abonar</label>
                  <input
                    type="text"
                    placeholder="02:00"
                    value={newCertHours}
                    onChange={(e) => setNewCertHours(e.target.value.replace(/[^0-9:]/g, ""))}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-mono text-center font-bold text-slate-800"
                  />
                </div>
              )}
            </div>

            <select
              value={newCertEmployee}
              onChange={(e) => setNewCertEmployee(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
            >
              <option value="all">👥 Para o Colaborador Selecionado</option>
              {collaboratorsList.map(emp => (
                <option key={emp.rawId} value={emp.rawId}>{emp.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder={newCertType === "full" ? "Motivo (Ex: Repouso Médico)..." : "Motivo (Ex: Consulta Médica, Exame)..."}
              value={newCertReason}
              onChange={(e) => setNewCertReason(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
            />

            <button
              onClick={handleAddCertificate}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Registrar {newCertType === "full" ? "Atestado" : "Declaração"}
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto divide-y divide-slate-100">
            {certificates.map(c => (
              <div key={c.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{new Date(c.dateStr + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      c.type === "hours" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {c.type === "hours" ? `⏱️ Declaração (${c.hours}h)` : "🏥 Atestado (Integral)"}
                    </span>
                  </div>
                  <span className="block text-[11px] text-indigo-600 font-medium">{c.rawId === "all" ? "Geral" : employeeMap.get(c.rawId)}</span>
                  <span className="block text-[10px] text-slate-500">{c.reason}</span>
                </div>
                <button onClick={() => setCertificates(prev => prev.filter(item => item.id !== c.id))} className="text-slate-400 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Escala */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-950 flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600" /> Categoria do Regime
          </h3>
          <select
            value={employeeCategory}
            onChange={(e) => handleCategoryChange(e.target.value as EmployeeCategory)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="comercial">💼 Horário Comercial (8h Seg-Sex / 4h Sáb)</option>
            <option value="call_center">🎧 Call Center (6h Seg-Sex / 6h Sáb)</option>
            <option value="estagiario">🎓 Estagiário (6h Seg-Sex)</option>
            <option value="custom">⚙️ Personalizado</option>
          </select>
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => (
              <div key={dayNum} className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{daysOfWeekBr[dayNum].split("-")[0]}</span>
                <input
                  type="text"
                  value={schedule[dayNum]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9:]/g, "");
                    setSchedule(prev => ({ ...prev, [dayNum]: val }));
                    setEmployeeCategory("custom");
                  }}
                  className="w-16 text-center h-8 text-xs border border-slate-200 rounded font-mono text-slate-900"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna Direita: Espelho & Resumo */}
      <div className="lg:col-span-8 space-y-6">
        {calcEmployee && calcEmployee !== "all" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Trabalhadas</p>
                <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">
                  {formatMinutesToHHMM(calcEmployeeReport.summary.totalWorked)}
                </h3>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Abonadas</p>
                <h3 className="text-base font-extrabold text-indigo-600 font-mono mt-1">
                  {formatMinutesToHHMM(calcEmployeeReport.summary.totalExcused)}
                </h3>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Esperadas</p>
                <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">
                  {formatMinutesToHHMM(calcEmployeeReport.summary.totalExpected)}
                </h3>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Extras (+)</p>
                  <TrendingUp size={13} className="text-emerald-500" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-600 font-mono mt-1">
                  {formatMinutesToHHMM(calcEmployeeReport.summary.totalOvertime)}
                </h3>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Faltas (-)</p>
                  <TrendingDown size={13} className="text-red-500" />
                </div>
                <h3 className="text-base font-extrabold text-red-600 font-mono mt-1">
                  {formatMinutesToHHMM(calcEmployeeReport.summary.totalPending)}
                </h3>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              calcEmployeeReport.summary.finalBalance >= 0 
                ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
                : "bg-red-50 border-red-100 text-red-900"
            }`}>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="text-xs font-semibold">Saldo Geral no Período Selecionado:</span>
              </div>
              <span className="font-mono font-extrabold text-lg">
                {formatMinutesToHHMM(calcEmployeeReport.summary.finalBalance)}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/55">
                <div>
                  <h4 className="font-bold text-slate-900">
                    Espelho: <span className="text-indigo-600">{employeeMap.get(calcEmployee)}</span>
                  </h4>
                </div>
                <button
                  onClick={() => exportCalculatedReportCsv(calcEmployee, employeeMap, calcStartDate, calcEndDate, calcEmployeeReport)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                >
                  <FileSpreadsheet size={14} /> Exportar Fechamento (CSV)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Marcações</th>
                      <th className="py-3 px-3">Ocorrência</th>
                      <th className="py-3 px-3 text-center">Abonado</th>
                      <th className="py-3 px-3 text-center">Trabalhado</th>
                      <th className="py-3 px-3 text-center">Esperado</th>
                      <th className="py-3 px-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {calcEmployeeReport.days.map((day: any) => (
                      <tr key={day.dateStr} className="hover:bg-slate-50/40 transition">
                        <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                          {day.formattedDate}
                          <span className="block text-[10px] text-slate-400 font-normal">{day.dayName}</span>
                        </td>
                        <td className="py-3 px-3">
                          {day.punchesList ? (
                            <span className="font-mono text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                              {day.punchesList}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Sem batida</span>
                          )}
                          {day.isOddPunches && (
                            <span className="inline-block ml-2 text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                              Incompleta
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {day.isHoliday && <span className="text-amber-800 font-bold">🌴 Feriado</span>}
                          {day.isCertificate && (
                            <span className={`font-bold ${day.certType === "hours" ? "text-blue-700" : "text-emerald-700"}`}>
                              {day.certType === "hours" ? `⏱️ ${day.certReason}` : `🏥 ${day.certReason}`}
                            </span>
                          )}
                          {!day.isHoliday && !day.isCertificate && <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-indigo-600 font-semibold">
                          {day.excusedMinutes > 0 ? formatMinutesToHHMM(day.excusedMinutes) : "-"}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{day.workedMinutes > 0 ? formatMinutesToHHMM(day.workedMinutes) : "-"}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{day.expectedMinutes > 0 ? formatMinutesToHHMM(day.expectedMinutes) : "-"}</td>
                        <td className="py-3 px-3 text-right font-mono">
                          {day.overtimeMinutes > 0 && <span className="text-emerald-600 font-bold">+{formatMinutesToHHMM(day.overtimeMinutes)}</span>}
                          {day.pendingMinutes > 0 && <span className="text-red-500">-{formatMinutesToHHMM(day.pendingMinutes)}</span>}
                          {day.overtimeMinutes === 0 && day.pendingMinutes === 0 && <span className="text-slate-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-white rounded-2xl py-16 px-4">
            <CalendarDays size={32} className="text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-600">Nenhum colaborador selecionado para cálculo.</p>
          </div>
        )}
      </div>
    </div>
  );
};