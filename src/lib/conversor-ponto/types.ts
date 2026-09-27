export interface Punch {
  nsr: string;
  rawId: string;
  cleanId: string;
  name: string;
  timestamp: string;
  dateObj: Date;
  formattedDate: string;
}

export interface EmployeeRow {
  rawId: string;
  cleanId: string;
  name: string;
  totalPunches: number;
}

export interface Holiday {
  id: string;
  dateStr: string; // yyyy-mm-dd
  description: string;
}

export interface MedicalCertificate {
  id: string;
  dateStr: string;
  rawId: string;
  reason: string;
  type: "full" | "hours"; // "full" = Atestado dia todo | "hours" = Declaração de horas
  hours?: string;         // Ex: "02:00"
  minutes?: number;       // Ex: 120
}

export type SortField = "name" | "cleanId" | "dateObj";
export type SortOrder = "asc" | "desc";
export type EmployeeCategory = "comercial" | "call_center" | "estagiario" | "custom";