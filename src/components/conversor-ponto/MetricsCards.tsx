import React from "react";
import { Clock, Users, Calendar as CalendarIcon } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    total: number;
    employees: number;
    dateRange: string;
  };
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
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
  );
};