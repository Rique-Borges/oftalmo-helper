import React, { useMemo } from "react";
import { Search } from "lucide-react";
import { EmployeeRow } from "@/lib/conversor-ponto/types";

interface CollaboratorsTabProps {
  collaboratorsList: EmployeeRow[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const CollaboratorsTab: React.FC<CollaboratorsTabProps> = ({
  collaboratorsList,
  searchTerm,
  setSearchTerm
}) => {
  const filtered = useMemo(() => {
    return collaboratorsList.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cleanId.includes(searchTerm)
    );
  }, [collaboratorsList, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por Nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {filtered.length} de {collaboratorsList.length} colaboradores listados
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
            Nenhum colaborador corresponde à busca.
          </div>
        ) : (
          filtered.map((colab) => (
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
  );
};