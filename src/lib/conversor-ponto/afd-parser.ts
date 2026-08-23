import { Punch } from "./types";
import { formatCPFOrPIS } from "./utils";

export function parseAfdText(text: string): { punches: Punch[]; employeeMap: Map<string, string> } {
  const lines = text.split(/\r?\n/);
  const tempEmployees = new Map<string, string>();
  const tempPunches: Punch[] = [];

  // 1. Mapear Funcionários (Tipo 5)
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

  // 2. Mapear Batidas (Tipo 3)
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

      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const min = String(dateObj.getMinutes()).padStart(2, "0");

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

  return { punches: tempPunches, employeeMap: tempEmployees };
}