"use client";

import React, { useState, useMemo, useRef } from "react";
import { 
  Upload, 
  Calendar as CalendarIcon, 
  User, 
  FileSpreadsheet, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Users, 
  Clock,
  ClipboardCheck,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// Interfaces de Tipo
interface Punch {
  nsr: string;
  rawId: string;
  cleanId: string;
  name: string;
  timestamp: string;
  dateObj: Date;
  formattedDate: string; // Formato: dd/mm/aaaa hh:mm
}

interface EmployeeRow {
  rawId: string;
  cleanId: string;
  name: string;
  totalPunches: number;
}

type SortField = "name" | "cleanId" | "dateObj";
type SortOrder = "asc" | "desc";

export default function AfdConverter() {
  const [activeTab, setActiveTab] = useState<"batidas" | "colaboradores">("batidas");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Map<string, string>>(new Map());
  const [fileName, setFileName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Ordenação
  const [sortField, setSortField] = useState<SortField>("dateObj");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Estados do Calendário
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const monthsBr = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Helper para formatar CPF/PIS
  const formatCPFOrPIS = (id: string): string => {
    const clean = id.trim();
    let target = clean;
    if (clean.length === 12 && ["0", "8", "9"].includes(clean[0])) {
      target = clean.substring(1);
    }
    
    if (target.length === 11) {
      return target.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return target;
  };

  // Parser do arquivo AFD Portaria 671
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.readAsText(file, "ISO-8859-1");
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);

      const tempEmployees = new Map<string, string>();
      const tempPunches: Punch[] = [];

      // Passo 1: Mapear colaboradores (Registro Tipo 5)
      for (const line of lines) {
        if (line.length < 50) continue;
        const tipo = line.substring(9, 10);
        
        if (tipo === "5") {
          const rawId = line.substring(35, 47).trim();
          const name = line.substring(47, 99).trim();
          if (rawId && name) {
            tempEmployees.set(rawId, name);
          }
        }
      }

      // Passo 2: Processar as batidas de ponto (Registro Tipo 3)
      for (const line of lines) {
        if (line.length < 45) continue;
        const tipo = line.substring(9, 10);

        if (tipo === "3") {
          const nsr = line.substring(0, 9).trim();
          const rawTimestamp = line.substring(10, 34).trim();
          const rawId = line.substring(34, 46).trim();

          if (!rawTimestamp || !rawId) continue;

          let name = tempEmployees.get(rawId) || "Colaborador Não Cadastrado";
          
          if (name === "Colaborador Não Cadastrado" && rawId.startsWith("0")) {
            const withoutZero = rawId.substring(1);
            for (const [empId, empName] of tempEmployees.entries()) {
              if (empId.endsWith(withoutZero)) {
                name = empName;
                break;
              }
            }
          }

          const dateObj = new Date(rawTimestamp);
          if (isNaN(dateObj.getTime())) continue;

          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          const yyyy = dateObj.getFullYear();
          const hh = String(dateObj.getHours()).padStart(2, '0');
          const min = String(dateObj.getMinutes()).padStart(2, '0');

          const formattedDate = `${dd}/${mm}/${yyyy} ${hh}:${min}`;

          tempPunches.push({
            nsr,
            rawId,
            cleanId: formatCPFOrPIS(rawId),
            name,
            timestamp: rawTimestamp,
            dateObj,
            formattedDate
          });
        }
      }

      setPunches(tempPunches);
      setEmployeeMap(tempEmployees);
      setCurrentPage(1);

      if (tempPunches.length > 0) {
        const newestDate = tempPunches[0].dateObj;
        setCurrentYear(newestDate.getFullYear());
        setCurrentMonth(newestDate.getMonth());
      }
    };
  };

  // Processamento e agrupamento de colaboradores únicos para o novo View
  const collaboratorsList = useMemo<EmployeeRow[]>(() => {
    const countsMap = new Map<string, number>();
    punches.forEach(p => {
      countsMap.set(p.rawId, (countsMap.get(p.rawId) || 0) + 1);
    });

    const list: EmployeeRow[] = [];
    employeeMap.forEach((name, rawId) => {
      list.push({
        rawId,
        cleanId: formatCPFOrPIS(rawId),
        name,
        totalPunches: countsMap.get(rawId) || 0
      });
    });

    // Caso existam colaboradores nas batidas que não foram mapeados no Tipo 5
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

  // Filtro básico compartilhado
  const filteredCollaborators = useMemo(() => {
    return collaboratorsList.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.cleanId.includes(searchTerm)
    );
  }, [collaboratorsList, searchTerm]);

  // Processamento e filtros das Batidas de Ponto
  const filteredPunches = useMemo(() => {
    return punches.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.cleanId.includes(searchTerm);

      let matchesDate = true;
      if (selectedDate) {
        const localDateStr = p.dateObj.toLocaleDateString("sv-SE");
        matchesDate = localDateStr === selectedDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [punches, searchTerm, selectedDate]);

  // Ordenação dinâmica do histórico de batidas
  const sortedPunches = useMemo(() => {
    const sorted = [...filteredPunches];
    sorted.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "dateObj") {
        valA = a.dateObj.getTime();
        valB = b.dateObj.getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPunches, sortField, sortOrder]);

  // Paginação das batidas
  const itemsPerPage = 15;
  const totalPages = Math.ceil(sortedPunches.length / itemsPerPage);
  const paginatedPunches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPunches.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPunches, currentPage]);

  // Gatilho para alteração de colunas ordenáveis
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Ícone auxiliar de ordenação
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="ml-1 text-slate-400 inline" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp size={14} className="ml-1 text-indigo-600 inline" /> 
      : <ArrowDown size={14} className="ml-1 text-indigo-600 inline" />;
  };

  // Métricas gerais das batidas carregadas
  const metrics = useMemo(() => {
    if (punches.length === 0) return { total: 0, employees: 0, dateRange: "-" };
    
    const uniqueEmployees = new Set(punches.map(p => p.rawId)).size;
    const dates = punches.map(p => p.dateObj.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const dateRange = `${formatter.format(minDate)} até ${formatter.format(maxDate)}`;

    return {
      total: punches.length,
      employees: uniqueEmployees,
      dateRange
    };
  }, [punches]);

  // Contagem para sinalizadores do calendário
  const punchesCountByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    punches.forEach(p => {
      const dateStr = p.dateObj.toLocaleDateString("sv-SE");
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return counts;
  }, [punches]);

  // Geração de Dias do Calendário
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push(day);
    }
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Exportar para Excel (CSV otimizado em Português) - Removida coluna financeira antiga
  const handleExportCSV = () => {
    if (sortedPunches.length === 0) return;

    const headers = ["Nome", "Identificação (CPF/PIS)", "Data e Hora"];
    const rows = sortedPunches.map(p => [
      p.name,
      p.cleanId,
      p.formattedDate
    ]);

    const csvContent = 
      "\uFEFF" + 
      [headers.join(";"), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `batidas_ponto_${currentYear}_${currentMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copiar tabela de batidas (Formatada para Ctrl+V no Excel) - Removida coluna financeira antiga
  const handleCopyToClipboard = () => {
    if (sortedPunches.length === 0) return;

    let textToCopy = "Nome\tIdentificação (CPF/PIS)\tData e Hora\n";
    sortedPunches.forEach(p => {
      textToCopy += `${p.name}\t${p.cleanId}\t${p.formattedDate}\n`;
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-800">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-950 flex items-center gap-2">
            <Clock className="text-indigo-600" /> Conversor de Ponto (Portaria 671)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gere relatórios simplificados e envie tabelas limpas ao setor financeiro.
          </p>
        </div>
        
        {/* Upload Zone */}
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

      {/* Cards de Métricas */}
      {punches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Batidas</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colaboradores no Arquivo</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.employees}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <CalendarIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Período de Registro</p>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{metrics.dateRange}</h3>
            </div>
          </div>
        </div>
      )}

      {punches.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-16 px-4 bg-slate-50/55">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-950">Nenhum arquivo processado</h2>
          <p className="text-slate-500 text-sm max-w-md text-center mt-2">
            Importe o arquivo AFD exportado pelo seu sistema ControlID para iniciar.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-5 rounded-lg transition text-sm"
          >
            Selecionar Arquivo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Seletor de Abas (Tabs) */}
          <div className="flex border-b border-slate-200">
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

          {activeTab === "batidas" ? (
            /* VIEW 1: HISTÓRICO DE BATIDAS */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Calendário e Busca Lateral */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Calendário */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-950 flex items-center gap-2">
                      <CalendarIcon size={16} className="text-indigo-600" /> Consultar por Dia
                    </h3>
                    <div className="flex items-center gap-1">
                      <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-slate-700 w-24 text-center">
                        {monthsBr[currentMonth]} {currentYear}
                      </span>
                      <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                    <div>Dom</div>
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={`empty-${idx}`} className="h-8" />;
                      
                      const monthStr = String(currentMonth + 1).padStart(2, "0");
                      const dayStr = String(day).padStart(2, "0");
                      const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;
                      
                      const count = punchesCountByDay[fullDateStr] || 0;
                      const isSelected = selectedDate === fullDateStr;

                      return (
                        <button
                          key={`day-${day}`}
                          onClick={() => setSelectedDate(isSelected ? null : fullDateStr)}
                          className={`h-9 rounded-lg flex flex-col items-center justify-center relative text-xs font-medium transition ${
                            isSelected 
                              ? "bg-indigo-600 text-white" 
                              : count > 0 
                                ? "bg-indigo-50 text-indigo-900 hover:bg-indigo-100" 
                                : "text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <span>{day}</span>
                          {count > 0 && (
                            <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-indigo-600"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        Dia selecionado: <strong>{new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}</strong>
                      </span>
                      <button 
                        onClick={() => setSelectedDate(null)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Limpar dia
                      </button>
                    </div>
                  )}
                </div>

                {/* Caixa de Busca */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Filtrar Colaborador</h4>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar nome ou CPF..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  {(searchTerm || selectedDate) && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-center py-2 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>

              </div>

              {/* Tabela de Batidas */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  
                  {/* Cabeçalho Superior de Ações */}
                  <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/55">
                    <div>
                      <h3 className="font-bold text-slate-900">Histórico de Batidas</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mostrando {sortedPunches.length} {sortedPunches.length === 1 ? "registro" : "registros"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleCopyToClipboard}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition"
                      >
                        {copied ? (
                          <>
                            <ClipboardCheck size={14} className="text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <User size={14} /> Copiar Tabela
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                      >
                        <FileSpreadsheet size={14} /> Exportar CSV
                      </button>
                    </div>
                  </div>

                  {/* Tabela Responsiva */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase select-none">
                          <th 
                            onClick={() => handleSort("name")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                          >
                            Nome do Colaborador {renderSortIcon("name")}
                          </th>
                          <th 
                            onClick={() => handleSort("cleanId")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                          >
                            Identificação {renderSortIcon("cleanId")}
                          </th>
                          <th 
                            onClick={() => handleSort("dateObj")}
                            className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                          >
                            Data e Hora {renderSortIcon("dateObj")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {paginatedPunches.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-400">
                              Nenhuma batida encontrada para os filtros aplicados.
                            </td>
                          </tr>
                        ) : (
                          paginatedPunches.map((punch) => (
                            <tr key={punch.nsr} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 px-4 font-semibold text-slate-900">{punch.name}</td>
                              <td className="py-3 px-4 font-mono text-xs text-slate-600">{punch.cleanId}</td>
                              <td className="py-3 px-4 font-medium text-slate-700">{punch.formattedDate}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Controle de Paginação */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Página <strong>{currentPage}</strong> de {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 text-slate-700"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 text-slate-700"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* VIEW 2: CADASTRO DE COLABORADORES ENCONTRADOS */
            <div className="space-y-4">
              
              {/* Barra de Busca Exclusiva para Colaboradores */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por Nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {filteredCollaborators.length} de {collaboratorsList.length} colaboradores listados
                </div>
              </div>

              {/* Grid de Colaboradores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollaborators.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                    Nenhum colaborador corresponde à busca.
                  </div>
                ) : (
                  filteredCollaborators.map((colab) => (
                    <div 
                      key={colab.rawId} 
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{colab.name}</h4>
                        <p className="text-xs font-mono text-slate-500">CPF/PIS: {colab.cleanId}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">Batidas encontradas:</span>
                        <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                          {colab.totalPunches} {colab.totalPunches === 1 ? "registro" : "registros"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}