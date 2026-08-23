"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type MedicoRelacionado = {
  medicos: {
    id: string;
    nome: string;
  } | null;
};

export type Exame = {
  id: string;
  nome: string;
  especialidade_relacionada: string;
  resumo: string | null;
  necessita_acompanhante: boolean;
  necessita_laudo: boolean;
  medico_exames: MedicoRelacionado[];
};

export function ExameCard({
  exame,
  isHighlighted,
}: {
  exame: Exame;
  isHighlighted: boolean;
}) {
  const [showDesc, setShowDesc] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Faz scroll automático suave caso venha com o parâmetro ?id= no link
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  return (
    <Card
      ref={cardRef}
      id={exame.id}
      className={`break-inside-avoid mb-6 overflow-hidden flex flex-col transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-blue-500 shadow-lg bg-blue-50/20" : "shadow-sm hover:shadow-md"
      }`}
    >
      <CardHeader className="bg-slate-50 border-b pb-4">
        <div>
          <CardTitle className="text-xl text-slate-800">{exame.nome}</CardTitle>
          <CardDescription className="mt-1 font-medium text-blue-600">
            {exame.especialidade_relacionada}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col flex-1">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 text-sm flex-1">
              {exame.necessita_acompanhante ? (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <span className="font-medium text-slate-700">Requer Acompanhante</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-slate-500">Sem Acompanhante</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              {exame.necessita_laudo ? (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <span className="font-medium text-slate-700">Necessita solicitar laudo</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-slate-500">Não necessita laudo</span>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              Médicos que realizam:
            </h4>
            {exame.medico_exames && exame.medico_exames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {exame.medico_exames.map((rel, idx) => {
                  const medico = rel.medicos;
                  if (!medico) return null;
                  return (
                    <Link key={idx} href="/corpoclinico" prefetch={false}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer bg-white hover:bg-slate-100 transition-colors"
                      >
                        {medico.nome}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Nenhum médico vinculado a este exame.
              </p>
            )}
          </div>
        </div>

        {/* Dropdown com CSS otimizado */}
        <div className="mt-4 pt-2">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/50"
            onClick={() => setShowDesc(!showDesc)}
          >
            <span>{showDesc ? "Ocultar Descrição" : "Ver Descrição do Procedimento"}</span>
            {showDesc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showDesc && (
            <div className="mt-3 p-4 bg-blue-50/50 rounded-md border border-blue-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {exame.resumo || "Nenhuma descrição ou orientação específica cadastrada."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}