"use client";

import React, { useState, useMemo, useRef } from "react";
import { Upload, Clock, Users, Settings, RefreshCw, CheckCircle } from "lucide-react";

import { Punch, EmployeeRow, SortField, SortOrder } from "@/lib/conversor-ponto/types";
import { parseAfdText } from "@/lib/conversor-ponto/afd-parser";
import { exportPunchesToCsv } from "@/lib/conversor-ponto/export-csv";
import { formatCPFOrPIS } from "@/lib/conversor-ponto/utils";

import { MetricsCards } from "@/components/conversor-ponto/MetricsCards";
import { PunchHistoryTab } from "@/components/conversor-ponto/PunchHistoryTab";
import { CollaboratorsTab } from "@/components/conversor-ponto/CollaboratorsTab";
import { CalculationTab } from "@/components/conversor-ponto/CalculationTab";
import { ExportCsvModal } from "@/components/conversor-ponto/ExportCsvModal";

export default function AfdConverterPage() {
  const [activeTab, setActiveTab] = useState<"batidas" | "colaboradores" | "calculo">("calculo");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Map<string, string>>(new Map());
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Filtros e Paginação
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>("dateObj");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Estados de Navegação no Calendário (Julho/2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6);

  // Estados de Fechamento / Cálculo
  const [calcEmployee, setCalcEmployee] = useState<string>("all");
  const [calcStartDate, setCalcStartDate] = useState<string>("2026-07-01");
  const [calcEndDate, setCalcEndDate] = useState<string>("2026-07-31");

  // Modal de Exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.readAsText(file, "ISO-8859-1");
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseAfdText(text);

      setPunches(parsed.punches);
      setEmployeeMap(parsed.employeeMap);
      setCurrentPage(1);

      const firstEmployeeId = parsed.employeeMap.keys().next().value;
      if (firstEmployeeId) {
        setCalcEmployee(firstEmployeeId);
      }
    };
  };

  const collaboratorsList = useMemo<EmployeeRow[]>(() => {
    const countsMap = new Map<string, number>();
    punches.forEach(p => countsMap.set(p.rawId, (countsMap.get(p.rawId) || 0) + 1));

    const list: EmployeeRow[] = [];
    employeeMap.forEach((name, rawId) => {
      list.push({
        rawId,
        cleanId: formatCPFOrPIS(rawId),
        name,
        totalPunches: countsMap.get(rawId) || 0
      });
    });

    countsMap.forEach((count, rawId) => {
      if (!employeeMap.has(rawId)) {
        list.push({
          rawId,
          cleanId: formatCPFOrPIS(rawId),
          name: "Colaborador Não Cadastrado",
          totalPunches: count
        });
      }
    });

    return list;
  }, [punches, employeeMap]);

  const metrics = useMemo(() => {
    if (punches.length === 0) return { total: 0, employees: 0, dateRange: "-" };
    const uniqueEmployees = new Set(punches.map(p => p.rawId)).size;
    const dates = punches.map(p => p.dateObj.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return {
      total: punches.length,
      employees: uniqueEmployees,
      dateRange: `${formatter.format(minDate)} até ${formatter.format(maxDate)}`
    };
  }, [punches]);

  const punchesCountByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    punches.forEach(p => {
      const dateStr = p.dateObj.toLocaleDateString("sv-SE");
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return counts;
  }, [punches]);

  const clearFilters = () => {
    setSelectedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-800 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-950 flex items-center gap-2">
            <Clock className="text-indigo-600" /> Conversor de Ponto (Portaria 671)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gere relatórios simplificados e envie tabelas limpas ao setor financeiro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm shadow-sm"
          >
            <Upload size={16} /> Carregar Arquivo AFD (.txt)
          </button>
          {punches.length > 0 && (
            <button
              onClick={() => {
                setPunches([]);
                setEmployeeMap(new Map());
                setFileName("");
                setSelectedDate(null);
                setCalcEmployee("all");
              }}
              title="Limpar Arquivo"
              className="p-2 border border-slate-200 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md p-2 w-fit">
          <CheckCircle size={14} /> Arquivo importado: <strong>{fileName}</strong>
        </div>
      )}

      {punches.length > 0 && <MetricsCards metrics={metrics} />}

      {punches.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-16 px-4 bg-slate-50/55">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-950">Nenhum arquivo processado</h2>
          <p className="text-slate-500 text-sm max-w-md text-center mt-2">
            Importe o arquivo AFD exportado pelo seu sistema ControlID para iniciar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navegação de Abas */}
          <div className="flex flex-wrap border-b border-slate-200">
            <button
              onClick={() => { setActiveTab("calculo"); clearFilters(); }}
              className={`py-3 px-6 text-sm font-semibold transition border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === "calculo"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Settings size={16} /> Cálculo & Fechamento de Horas
            </button>
            <button
              onClick={() => { setActiveTab("batidas"); clearFilters(); }}
              className={`py-3 px-6 text-sm font-semibold transition border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === "batidas"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={16} /> Histórico de Batidas
            </button>
            <button
              onClick={() => { setActiveTab("colaboradores"); clearFilters(); }}
              className={`py-3 px-6 text-sm font-semibold transition border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === "colaboradores"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users size={16} /> Colaboradores ({collaboratorsList.length})
            </button>
          </div>

          {activeTab === "batidas" && (
            <PunchHistoryTab
              punches={punches}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sortField={sortField}
              setSortField={setSortField}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              punchesCountByDay={punchesCountByDay}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onClearFilters={clearFilters}
            />
          )}

          {activeTab === "colaboradores" && (
            <CollaboratorsTab
              collaboratorsList={collaboratorsList}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === "calculo" && (
            <CalculationTab
              punches={punches}
              employeeMap={employeeMap}
              collaboratorsList={collaboratorsList}
              calcEmployee={calcEmployee}
              setCalcEmployee={setCalcEmployee}
              calcStartDate={calcStartDate}
              setCalcStartDate={setCalcStartDate}
              calcEndDate={calcEndDate}
              setCalcEndDate={setCalcEndDate}
            />
          )}
        </div>
      )}

      {/* Modal de Exportação */}
      <ExportCsvModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        collaboratorsList={collaboratorsList}
        employeeMap={employeeMap}
        onConfirmExport={(emp, start, end) => {
          const res = exportPunchesToCsv(punches, emp, start, end, employeeMap);
          return res.error;
        }}
      />
    </div>
  );
}