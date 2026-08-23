export const monthsBr = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const daysOfWeekBr = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export function formatCPFOrPIS(id: string): string {
  const clean = id.trim();
  let target = clean;
  if (clean.length === 12 && ["0", "8", "9"].includes(clean[0])) {
    target = clean.substring(1);
  }
  
  if (target.length === 11) {
    return target.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return target;
}

export function parseHHMMToMinutes(val: string): number {
  if (!val) return 0;
  const parts = val.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const isNegative = totalMinutes < 0;
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return `${isNegative ? "-" : ""}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}