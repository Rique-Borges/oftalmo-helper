import React, { useState, useMemo } from "react";
import { X, Search, ArrowUpDown, AlertCircle, FileSpreadsheet } from "lucide-react";
import { EmployeeRow } from "@/lib/conversor-ponto/types";

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboratorsList: EmployeeRow[];
  employeeMap: Map<string, string>;
  onConfirmExport: (employee: string, start: string, end: string) => string | undefined;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({
  isOpen,
  onClose,
  collaboratorsList,
  employeeMap,
  onConfirmExport
}) => {
  const [exportEmployee, setExportEmployee] = useState<string>("all");
  const [exportStartDate, setExportStartDate] = useState<string>("2026-07-01");
  const [exportEndDate, setExportEndDate] = useState<string>("2026-07-31");
  const [isComboOpen, setIsComboOpen] = useState<boolean>(false);
  const [comboSearch, setComboSearch] = useState<string>("");
  const [error, setError] = useState<string>("");

  const filteredEmployees = useMemo(() => {
    return collaboratorsList.filter(emp =>
      emp.name.toLowerCase().includes(comboSearch.toLowerCase()) || emp.cleanId.includes(comboSearch)
    );
  }, [collaboratorsList, comboSearch]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError("");
    const err = onConfirmExport(exportEmployee, exportStartDate, exportEndDate);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Exportar Histórico de Batidas</h3>
            <p className="text-xs text-slate-500 mt-1">Feche o histórico bruto de ponto no período desejado.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-900 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 my-2">
          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colaborador</label>
            <button
              type="button"
              onClick={() => setIsComboOpen(!isComboOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
            >
              <span className="truncate">
                {exportEmployee === "all" ? "Todos os Colaboradores" : employeeMap.get(exportEmployee) || "Selecionar..."}
              </span>
              <ArrowUpDown size={14} className="opacity-50 shrink-0 ml-2" />
            </button>

            {isComboOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsComboOpen(false)} />
            )}

            {isComboOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md flex flex-col">
                <div className="flex items-center border-b border-slate-100 px-3 py-2">
                  <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={comboSearch}
                    onChange={(e) => setComboSearch(e.target.value)}
                    className="w-full text-sm outline-none border-none bg-transparent text-slate-900 focus:ring-0"
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
                    className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 transition font-medium ${
                      exportEmployee === "all" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                    }`}
                  >
                    Todos os Colaboradores
                  </button>
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.rawId}
                      type="button"
                      onClick={() => {
                        setExportEmployee(emp.rawId);
                        setIsComboOpen(false);
                        setComboSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-50 transition flex flex-col gap-0.5 ${
                        exportEmployee === emp.rawId ? "bg-indigo-50/50 text-indigo-700 font-semibold" : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{emp.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">CPF/PIS: {emp.cleanId}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">De (Início)</label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Até (Fim)</label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="h-10 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 font-semibold text-xs">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md transition shadow-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} /> Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};