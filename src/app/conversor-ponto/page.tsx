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
  ArrowDown,
  X,
  AlertCircle,
  Settings,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Coffee
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
  const [activeTab, setActiveTab] = useState<"batidas" | "colaboradores" | "calculo">("batidas");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Map<string, string>>(new Map());
  const [fileName, setFileName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Modal de Exportação Básica
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportEmployee, setExportEmployee] = useState<string>("all");
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");
  const [exportError, setExportError] = useState<string>("");

  // Estados do Combobox Pesquisável (Seleção de Colaborador na Exportação Básica)
  const [isComboOpen, setIsComboOpen] = useState<boolean>(false);
  const [comboSearch, setComboSearch] = useState<string>("");

  // Estados do Painel de Cálculo (Aba 3)
  const [calcEmployee, setCalcEmployee] = useState<string>("");
  const [calcStartDate, setCalcStartDate] = useState<string>("");
  const [calcEndDate, setCalcEndDate] = useState<string>("");
  const [isCalcComboOpen, setIsCalcComboOpen] = useState<boolean>(false);
  const [calcComboSearch, setCalcComboSearch] = useState<string>("");

  // Variável de Intervalo de Almoço/Descanso Padrão (em minutos)
  const [expectedInterval, setExpectedInterval] = useState<number>(15);

  // Escala de Trabalho Padrão (Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sab: 6, Dom: 0)
  // Armazenado como string "HH:MM"
  const [schedule, setSchedule] = useState<Record<number, string>>({
    1: "08:00", // Segunda
    2: "08:00", // Terça
    3: "08:00", // Quarta
    4: "08:00", // Quinta
    5: "08:00", // Sexta
    6: "00:00", // Sábado
    0: "00:00"  // Domingo
  });

  // Estados de Ordenação
  const [sortField, setSortField] = useState<SortField>("dateObj");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Estados do Calendário Principal
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const monthsBr = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const daysOfWeekBr = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

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

  // Conversores de Tempo auxiliares
  const parseHHMMToMinutes = (val: string): number => {
    if (!val) return 0;
    const parts = val.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const formatMinutesToHHMM = (totalMinutes: number): string => {
    const isNegative = totalMinutes < 0;
    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${isNegative ? "-" : ""}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
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

      // Define os intervalos de data iniciais com base no conteúdo lido
      if (tempPunches.length > 0) {
        const dates = tempPunches.map(p => p.dateObj.getTime());
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));

        const formatDateForInput = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const minDateFormatted = formatDateForInput(minD);
        const maxDateFormatted = formatDateForInput(maxD);

        setExportStartDate(minDateFormatted);
        setExportEndDate(maxDateFormatted);

        // Preenche o formulário da aba de cálculos também
        setCalcStartDate(minDateFormatted);
        setCalcEndDate(maxDateFormatted);

        const newestDate = tempPunches[0].dateObj;
        setCurrentYear(newestDate.getFullYear());
        setCurrentMonth(newestDate.getMonth());

        // Pré-seleciona o primeiro funcionário disponível para cálculo
        const firstEmployeeId = tempEmployees.keys().next().value;
        if (firstEmployeeId) {
          setCalcEmployee(firstEmployeeId);
        }
      }
    };
  };

  // Processamento e agrupamento de colaboradores únicos
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

  // Filtro básico de busca de colaboradores
  const filteredCollaborators = useMemo(() => {
    return collaboratorsList.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.cleanId.includes(searchTerm)
    );
  }, [collaboratorsList, searchTerm]);

  // Filtro de colaboradores para o Combobox da exportação básica
  const filteredComboEmployees = useMemo(() => {
    return collaboratorsList.filter(emp => 
      emp.name.toLowerCase().includes(comboSearch.toLowerCase()) ||
      emp.cleanId.includes(comboSearch)
    );
  }, [collaboratorsList, comboSearch]);

  // Filtro de colaboradores para o Combobox da aba de Cálculos
  const filteredCalcComboEmployees = useMemo(() => {
    return collaboratorsList.filter(emp => 
      emp.name.toLowerCase().includes(calcComboSearch.toLowerCase()) ||
      emp.cleanId.includes(calcComboSearch)
    );
  }, [collaboratorsList, calcComboSearch]);

  // Filtro básico de busca de batidas
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

  // Ordenação dinâmica das batidas na visualização
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

  // Paginação
  const itemsPerPage = 15;
  const totalPages = Math.ceil(sortedPunches.length / itemsPerPage);
  const paginatedPunches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPunches.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPunches, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="ml-1 text-slate-400 inline" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp size={14} className="ml-1 text-indigo-600 inline" /> 
      : <ArrowDown size={14} className="ml-1 text-indigo-600 inline" />;
  };

  // Métricas gerais
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

  // Copiar tabela de batidas da aba de Histórico
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

  // Exportar o CSV básico da modal
  const handleConfirmExport = () => {
    setExportError("");
    
    const start = exportStartDate ? new Date(exportStartDate + "T00:00:00") : null;
    const end = exportEndDate ? new Date(exportEndDate + "T23:59:59") : null;

    const filteredToExport = punches.filter(p => {
      const matchesEmployee = exportEmployee === "all" || p.rawId === exportEmployee;
      const matchesStart = !start || p.dateObj >= start;
      const matchesEnd = !end || p.dateObj <= end;
      return matchesEmployee && matchesStart && matchesEnd;
    });

    if (filteredToExport.length === 0) {
      setExportError("Nenhuma marcação encontrada no período e filtros informados.");
      return;
    }

    const headers = ["Nome", "Identificação (CPF/PIS)", "Data e Hora"];
    const rows = filteredToExport.map(p => [
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
    
    let fileNameStr = "fechamento_ponto";
    if (exportEmployee !== "all") {
      const nameClean = (employeeMap.get(exportEmployee) || "colaborador")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      fileNameStr += `_${nameClean}`;
    }
    if (exportStartDate && exportEndDate) {
      fileNameStr += `_de_${exportStartDate}_a_${exportEndDate}`;
    }

    link.setAttribute("download", `${fileNameStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportModalOpen(false);
  };

  // ====================================================================
  // ENGINE DE CÁLCULO DE HORAS (COM LÓGICA DE ALMOÇO FLEXÍVEL CLT/INTERNA)
  // ====================================================================

  // Gera lista contínua de datas no range selecionado
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

  // Estrutura calculada diária para o colaborador selecionado aplicando a regra de intervalo flexível
  const calcEmployeeReport = useMemo(() => {
    if (!calcEmployee || calcDatesRange.length === 0) return { days: [], summary: { totalWorked: 0, totalExpected: 0, totalOvertime: 0, totalPending: 0, finalBalance: 0 } };

    const employeePunches = punches.filter(p => p.rawId === calcEmployee);

    let totalWorked = 0;
    let totalExpected = 0;
    let totalOvertime = 0;
    let totalPending = 0;

    const calculatedDays = calcDatesRange.map(dateStr => {
      const currentDateObj = new Date(dateStr + "T00:00:00");
      const dayOfWeek = currentDateObj.getDay();

      // Busca batidas ordenadas cronologicamente
      const dayPunches = employeePunches
        .filter(p => p.dateObj.toLocaleDateString("sv-SE") === dateStr)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      // Carga Esperada do dia da semana
      const expectedLoadStr = schedule[dayOfWeek] || "00:00";
      const expectedMinutes = parseHHMMToMinutes(expectedLoadStr);

      // Agrupamento para cálculo
      const isOddPunches = dayPunches.length % 2 !== 0;
      const loops = isOddPunches ? dayPunches.length - 1 : dayPunches.length;

      // 1. Calcula o Tempo Ativo Trabalhado (Soma dos turnos ativos)
      let activeWorkingMinutes = 0;
      for (let i = 0; i < loops; i += 2) {
        const t1 = dayPunches[i].dateObj.getTime();
        const t2 = dayPunches[i+1].dateObj.getTime();
        activeWorkingMinutes += Math.round((t2 - t1) / 60000);
      }

      // 2. Calcula o Intervalo de Almoço Realizado (Soma das lacunas entre os turnos)
      let breakTakenMinutes = 0;
      for (let i = 1; i < loops - 1; i += 2) {
        const t1 = dayPunches[i].dateObj.getTime();
        const t2 = dayPunches[i+1].dateObj.getTime();
        breakTakenMinutes += Math.round((t2 - t1) / 60000);
      }

      // 3. Aplica as regras de limite do Intervalo Permitido (Variável de Intervalo + Regra dos 15m/1h)
      let allowedBreak = expectedInterval;
      let isSpecialRuleApplied = false;

      // REGRA: "Se o colaborador trabalha de forma ativa 7h ou mais no dia, ele ganha o direito a 1h (60 min) de intervalo pago."
      if (activeWorkingMinutes >= 420) { // 7h * 60m = 420m
        allowedBreak = 60;
        isSpecialRuleApplied = true;
      }

      // 4. Tratamento do Excesso de Almoço: Se superou o limite permitido, desconta apenas o excesso.
      // Se estiver no limite, o intervalo é totalmente integrado às horas pagas (não descontado).
      let breakDeductedMinutes = 0;
      if (breakTakenMinutes > allowedBreak) {
        breakDeductedMinutes = breakTakenMinutes - allowedBreak;
      }

      // Horas Trabalhadas Líquidas do Dia (Horas Ativas + Intervalo Integrado/Pago dentro do limite)
      const finalWorkedMinutes = activeWorkingMinutes + Math.min(breakTakenMinutes, allowedBreak);

      // 5. Diferença em relação à escala esperada
      let overtimeMinutes = 0;
      let pendingMinutes = 0;

      if (finalWorkedMinutes > expectedMinutes) {
        overtimeMinutes = finalWorkedMinutes - expectedMinutes;
      } else if (finalWorkedMinutes < expectedMinutes) {
        pendingMinutes = expectedMinutes - finalWorkedMinutes;
      }

      // Somatórios do Período
      totalWorked += finalWorkedMinutes;
      totalExpected += expectedMinutes;
      totalOvertime += overtimeMinutes;
      totalPending += pendingMinutes;

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
        activeWorkingMinutes,
        breakTakenMinutes,
        allowedBreak,
        breakDeductedMinutes,
        isSpecialRuleApplied,
        finalWorkedMinutes,
        expectedMinutes,
        overtimeMinutes,
        pendingMinutes
      };
    });

    const finalBalance = totalOvertime - totalPending;

    return {
      days: calculatedDays,
      summary: {
        totalWorked,
        totalExpected,
        totalOvertime,
        totalPending,
        finalBalance
      }
    };
  }, [calcEmployee, calcDatesRange, punches, schedule, expectedInterval]);

  // Exportar o fechamento de horas diárias estruturado com detalhes de intervalo gozado e descontado
  const handleExportCalculatedCSV = () => {
    if (!calcEmployee || calcEmployeeReport.days.length === 0) return;

    const employeeName = employeeMap.get(calcEmployee) || "Colaborador";
    const employeeCPF = formatCPFOrPIS(calcEmployee);

    const headers = [
      "Data", "Dia da Semana", "Batidas", "Trabalho Ativo", "Intervalo Gozado (min)", 
      "Intervalo Permitido (min)", "Excesso Descontado (min)", "Total Trabalhado Pago (HH:MM)", 
      "Carga Esperada (HH:MM)", "Hora Extra (HH:MM)", "Pendente/Falta (HH:MM)", "Regra Especial 1h", "Incompleto"
    ];

    const rows = calcEmployeeReport.days.map(d => [
      d.dateStr,
      d.dayName,
      d.punchesList || "Falta/Sem batida",
      formatMinutesToHHMM(d.activeWorkingMinutes),
      d.breakTakenMinutes,
      d.allowedBreak,
      d.breakDeductedMinutes,
      formatMinutesToHHMM(d.finalWorkedMinutes),
      formatMinutesToHHMM(d.expectedMinutes),
      formatMinutesToHHMM(d.overtimeMinutes),
      formatMinutesToHHMM(d.pendingMinutes),
      d.isSpecialRuleApplied ? "Sim (7h+ Trabalho)" : "Nao",
      d.isOddPunches ? "Sim (Batida Impar)" : "Nao"
    ]);

    const s = calcEmployeeReport.summary;
    const summaryRows = [
      [],
      ["RESUMO DO FECHAMENTO DO COLABORADOR"],
      ["Nome", employeeName],
      ["CPF/PIS", employeeCPF],
      ["Periodo", `${calcStartDate} ate ${calcEndDate}`],
      ["Intervalo Padrao Configurado (min)", expectedInterval],
      ["Total Horas Trabalhadas (Com intervalos integrados)", formatMinutesToHHMM(s.totalWorked)],
      ["Total Carga Esperada", formatMinutesToHHMM(s.totalExpected)],
      ["Total Horas Extras (+)", formatMinutesToHHMM(s.totalOvertime)],
      ["Total Horas Pendentes (-)", formatMinutesToHHMM(s.totalPending)],
      ["Saldo Final", formatMinutesToHHMM(s.finalBalance)]
    ];

    const csvContent = 
      "\uFEFF" + 
      [
        headers.join(";"), 
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";")),
        ...summaryRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const employeeFileName = employeeName.toLowerCase().replace(/\s+/g, "_");
    link.setAttribute("download", `fechamento_${employeeFileName}_${calcStartDate}_a_${calcEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-800 relative">
      
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
                setCalcEmployee("");
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

      {/* Cards de Métricas Gerais do Arquivo */}
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
          <div className="flex flex-wrap border-b border-slate-200">
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
          </div>

          {activeTab === "batidas" && (
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
                        onClick={() => {
                          setExportError("");
                          setComboSearch("");
                          setIsExportModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
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
          )}

          {activeTab === "colaboradores" && (
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

          {activeTab === "calculo" && (
            /* VIEW 3: CÁLCULO & FECHAMENTO DE HORAS COM GESTÃO DE INTERVALO */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Esquerda: Configurador de Escalas, Intervalo e Filtros */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Seleção de Período e Colaborador */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h3 className="font-bold text-slate-950 flex items-center gap-2">
                    <User size={18} className="text-indigo-600" /> Filtros de Fechamento
                  </h3>

                  {/* Seletor Combobox Pesquisável */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Selecione o Colaborador
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setIsCalcComboOpen(!isCalcComboOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <span className="truncate">
                        {calcEmployee 
                          ? (employeeMap.get(calcEmployee) || "Selecionar...") 
                          : "Selecione um colaborador..."}
                      </span>
                      <ArrowUpDown size={14} className="opacity-50 shrink-0 ml-2" />
                    </button>

                    {isCalcComboOpen && (
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsCalcComboOpen(false)} />
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
                            className="w-full text-sm outline-none border-none bg-transparent placeholder:text-slate-400 text-slate-900 p-0 focus:ring-0"
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

                  {/* Range de Data */}
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

                {/* 2. Variável do Intervalo e Escala Semanal */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-950 flex items-center gap-2">
                      <Settings size={18} className="text-indigo-600" /> Escala & Intervalo
                    </h3>
                  </div>

                  {/* Entrada da Variável de Intervalo Padrão */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Coffee size={14} className="text-indigo-500" /> Intervalo de Almoço Padrão
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={expectedInterval}
                        onChange={(e) => setExpectedInterval(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full h-9 text-sm border border-slate-200 rounded px-2.5 font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500">minutos</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1">
                      Intervalos gozados até este limite não são descontados. Excessos serão deduzidos automaticamente.
                    </p>
                  </div>
                  
                  {/* Carga Esperada Diária */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Carga Diária por Dia da Semana (HH:MM)
                    </span>
                    <div className="space-y-2 divide-y divide-slate-100">
                      {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => (
                        <div key={dayNum} className="flex items-center justify-between pt-2 first:pt-0">
                          <span className="text-xs font-semibold text-slate-700">
                            {dayNum === 0 ? "Domingo" : dayNum === 6 ? "Sábado" : `${daysOfWeekBr[dayNum].split("-")[0]}`}
                          </span>
                          <input
                            type="text"
                            placeholder="00:00"
                            value={schedule[dayNum]}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9:]/g, "");
                              setSchedule(prev => ({ ...prev, [dayNum]: val }));
                            }}
                            className="w-20 text-center h-8 text-xs border border-slate-200 rounded font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Direita: Tabela Diária Detalhada e Painel de Horas Calculadas */}
              <div className="lg:col-span-8 space-y-6">
                
                {calcEmployee ? (
                  <>
                    {/* Cards de Horas Fechadas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Trabalhadas Líquidas</p>
                        <h3 className="text-lg font-extrabold text-slate-900 font-mono mt-1">
                          {formatMinutesToHHMM(calcEmployeeReport.summary.totalWorked)}
                        </h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Esperadas (Escala)</p>
                        <h3 className="text-lg font-extrabold text-slate-900 font-mono mt-1">
                          {formatMinutesToHHMM(calcEmployeeReport.summary.totalExpected)}
                        </h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Extras (+)</p>
                          <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-extrabold text-emerald-600 font-mono mt-1">
                          {formatMinutesToHHMM(calcEmployeeReport.summary.totalOvertime)}
                        </h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Faltas/Pendentes (-)</p>
                          <TrendingDown size={14} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-extrabold text-red-600 font-mono mt-1">
                          {formatMinutesToHHMM(calcEmployeeReport.summary.totalPending)}
                        </h3>
                      </div>
                    </div>

                    {/* Alerta de Saldo Final */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      calcEmployeeReport.summary.finalBalance >= 0 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
                        : "bg-red-50 border-red-100 text-red-900"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span className="text-xs font-semibold">
                          Saldo Líquido Geral (Com tratamento de intervalos):
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-lg">
                        {formatMinutesToHHMM(calcEmployeeReport.summary.finalBalance)}
                      </span>
                    </div>

                    {/* Tabela do Espelho Diário Detalhado */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/55">
                        <div>
                          <h4 className="font-bold text-slate-900">
                            Espelho de Ponto Individual: <span className="text-indigo-600">{employeeMap.get(calcEmployee)}</span>
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cálculo diário aplicando as regras de intervalos ({expectedInterval} min padrão / 1h para jornadas de 7h+).
                          </p>
                        </div>
                        <button
                          onClick={handleExportCalculatedCSV}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                        >
                          <FileSpreadsheet size={14} /> Exportar Fechamento (CSV)
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase select-none">
                              <th className="py-3 px-4">Data</th>
                              <th className="py-3 px-4">Batidas do Dia</th>
                              <th className="py-3 px-4 text-center">Intervalo</th>
                              <th className="py-3 px-4 text-center">Trabalhado Pago</th>
                              <th className="py-3 px-4 text-center">Carga Esperada</th>
                              <th className="py-3 px-4 text-right">Saldo do Dia</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {calcEmployeeReport.days.map((day) => (
                              <tr key={day.dateStr} className="hover:bg-slate-50/40 transition">
                                <td className="py-3 px-4 font-medium text-slate-900">
                                  {day.formattedDate}
                                  <span className="block text-[10px] text-slate-400 font-normal">{day.dayName}</span>
                                </td>
                                <td className="py-3 px-4">
                                  {day.punchesList ? (
                                    <span className="font-mono text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                                      {day.punchesList}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Falta / Sem batida</span>
                                  )}
                                  {day.isOddPunches && (
                                    <span className="inline-block ml-2 text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold animate-pulse">
                                      Batida Incompleta
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {day.breakTakenMinutes > 0 ? (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="font-medium text-slate-700 font-mono">
                                        {day.breakTakenMinutes} min
                                      </span>
                                      {day.breakDeductedMinutes > 0 ? (
                                        <span className="text-[10px] text-red-500 font-bold" title={`Intervalo excedeu o limite de ${day.allowedBreak} min`}>
                                          Desconto: -{day.breakDeductedMinutes} min
                                        </span>
                                      ) : (
                                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1 py-0.2 rounded" title="Intervalo integrado e pago">
                                          Pago {day.isSpecialRuleApplied ? "(Regra 1h)" : ""}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                                  {day.finalWorkedMinutes > 0 ? formatMinutesToHHMM(day.finalWorkedMinutes) : "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-slate-500">
                                  {day.expectedMinutes > 0 ? formatMinutesToHHMM(day.expectedMinutes) : "-"}
                                </td>
                                <td className="py-3 px-4 text-right font-mono">
                                  {day.overtimeMinutes > 0 && (
                                    <span className="text-emerald-600 font-bold">+{formatMinutesToHHMM(day.overtimeMinutes)}</span>
                                  )}
                                  {day.pendingMinutes > 0 && (
                                    <span className="text-red-500">-{formatMinutesToHHMM(day.pendingMinutes)}</span>
                                  )}
                                  {day.overtimeMinutes === 0 && day.pendingMinutes === 0 && (
                                    <span className="text-slate-400">-</span>
                                  )}
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
                    <p className="text-xs text-slate-400 mt-1">Utilize o painel de filtros lateral para iniciar.</p>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL DE EXPORTAÇÃO BÁSICA (ESTILO SHADCN UI) */}
      {/* ======================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-200" 
            onClick={() => {
              setIsExportModalOpen(false);
              setIsComboOpen(false);
            }}
          />
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Exportar Histórico de Batidas</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Feche o histórico bruto de ponto no range definido.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsExportModalOpen(false);
                  setIsComboOpen(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 my-2">
              
              <div className="space-y-2 relative">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Colaborador
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsComboOpen(!isComboOpen)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <span className="truncate">
                    {exportEmployee === "all" 
                      ? "Todos os Colaboradores" 
                      : (employeeMap.get(exportEmployee) || "Selecionar colaborador...")}
                  </span>
                  <ArrowUpDown size={14} className="opacity-50 shrink-0 ml-2" />
                </button>

                {isComboOpen && (
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsComboOpen(false)} />
                )}

                {isComboOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md flex flex-col">
                    
                    <div className="flex items-center border-b border-slate-100 px-3 py-2">
                      <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Pesquisar colaborador..."
                        value={comboSearch}
                        onChange={(e) => setComboSearch(e.target.value)}
                        className="w-full text-sm outline-none border-none bg-transparent placeholder:text-slate-400 text-slate-900 p-0 focus:ring-0"
                        autoFocus
                      />
                    </div>

                    <div className="overflow-y-auto max-h-44 py-1 divide-y divide-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          setExportEmployee("all");
                          setIsComboOpen(false);
                          setComboSearch("");
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 transition truncate font-medium ${
                          exportEmployee === "all" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                        }`}
                      >
                        Todos os Colaboradores
                      </button>
                      
                      {filteredComboEmployees.map(emp => (
                        <button
                          key={emp.rawId}
                          type="button"
                          onClick={() => {
                            setExportEmployee(emp.rawId);
                            setIsComboOpen(false);
                            setComboSearch("");
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 transition truncate flex flex-col gap-0.5 ${
                            exportEmployee === emp.rawId ? "bg-indigo-50/50 text-indigo-700 font-semibold" : "text-slate-700"
                          }`}
                        >
                          <span className="truncate">{emp.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">CPF/PIS: {emp.cleanId}</span>
                        </button>
                      ))}

                      {filteredComboEmployees.length === 0 && (
                        <div className="text-xs text-slate-400 py-4 text-center">
                          Nenhum colaborador encontrado.
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    De (Início)
                  </label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Até (Fim)
                  </label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              {exportError && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}

            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsExportModalOpen(false);
                  setIsComboOpen(false);
                }}
                className="h-10 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExport}
                className="h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md transition shadow-sm flex items-center gap-1.5"
              >
                <FileSpreadsheet size={14} /> Exportar CSV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}