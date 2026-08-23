import React, { useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ClipboardCheck, 
  User, 
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Punch, SortField, SortOrder } from "@/lib/conversor-ponto/types";
import { monthsBr } from "@/lib/conversor-ponto/utils";

interface PunchHistoryTabProps {
  punches: Punch[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  sortField: SortField;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  punchesCountByDay: Record<string, number>;
  onOpenExportModal: () => void;
  onClearFilters: () => void;
}

export const PunchHistoryTab: React.FC<PunchHistoryTabProps> = ({
  punches,
  selectedDate,
  setSelectedDate,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  currentYear,
  setCurrentYear,
  currentMonth,
  setCurrentMonth,
  punchesCountByDay,
  onOpenExportModal,
  onClearFilters
}) => {
  const [copied, setCopied] = React.useState(false);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= totalDays; day++) days.push(day);
    return days;
  }, [currentYear, currentMonth]);

  const filteredPunches = useMemo(() => {
    return punches.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.cleanId.includes(searchTerm);
      let matchesDate = true;
      if (selectedDate) {
        matchesDate = p.dateObj.toLocaleDateString("sv-SE") === selectedDate;
      }
      return matchesSearch && matchesDate;
    });
  }, [punches, searchTerm, selectedDate]);

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
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-indigo-600 inline" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-indigo-600 inline" />
    );
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Calendário e Filtro */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-950 flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-600" /> Consultar por Dia
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(y => y - 1);
                  } else {
                    setCurrentMonth(m => m - 1);
                  }
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-700 w-24 text-center">
                {monthsBr[currentMonth]} {currentYear}
              </span>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(y => y + 1);
                  } else {
                    setCurrentMonth(m => m + 1);
                  }
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
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
                Dia: <strong>{new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}</strong>
              </span>
              <button onClick={() => setSelectedDate(null)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                Limpar dia
              </button>
            </div>
          )}
        </div>

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
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(searchTerm || selectedDate) && (
            <button
              onClick={onClearFilters}
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
                {copied ? <><ClipboardCheck size={14} className="text-emerald-600" /> Copiado!</> : <><User size={14} /> Copiar Tabela</>}
              </button>
              <button
                onClick={onOpenExportModal}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-sm"
              >
                <FileSpreadsheet size={14} /> Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase select-none">
                  <th onClick={() => handleSort("name")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                    Nome {renderSortIcon("name")}
                  </th>
                  <th onClick={() => handleSort("cleanId")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                    Identificação {renderSortIcon("cleanId")}
                  </th>
                  <th onClick={() => handleSort("dateObj")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Página <strong>{currentPage}</strong> de {totalPages}</span>
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
  );
};