"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stethoscope, AlertCircle, Users, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type MedicoRelacionado = {
  medicos: {
    id: string;
    nome: string;
  };
};

type Exame = {
  id: string;
  nome: string;
  especialidade_relacionada: string;
  resumo: string;
  necessita_acompanhante: boolean;
  necessita_laudo: boolean;
  medico_exames: MedicoRelacionado[];
};

export default function ExamesPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id"); // Usado para focar num exame se vier de link externo
  
  const [exames, setExames] = useState<Exame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExames() {
      try {
        const { data, error } = await supabase
          .from("exames")
          .select(`
            id,
            nome,
            especialidade_relacionada,
            resumo,
            necessita_acompanhante,
            necessita_laudo,
            medico_exames (
              medicos ( id, nome )
            )
          `)
          .order("nome");

        if (error) throw error;
        setExames(data as any as Exame[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExames();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Exames e Procedimentos
        </h1>
        <p className="text-slate-500 mt-1">Consulte informações técnicas, regras de agendamento e médicos vinculados.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-600 gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Erro ao carregar dados: {error}</p>
        </div>
      ) : exames.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">Nenhum exame cadastrado no sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exames.map((exame) => (
            <Card 
              key={exame.id} 
              id={exame.id}
              className={`overflow-hidden transition-all duration-500 ${highlightId === exame.id ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
            >
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl text-slate-800">{exame.nome}</CardTitle>
                    <CardDescription className="mt-1 font-medium text-blue-600">{exame.especialidade_relacionada}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Resumo / Orientações:</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap">
                    {exame.resumo || "Nenhuma orientação específica cadastrada."}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {exame.necessita_acompanhante ? (
                      <><AlertCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-slate-700">Requer Acompanhante</span></>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-slate-500">Sem Acompanhante</span></>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {exame.necessita_laudo ? (
                      <><AlertCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-slate-700">Requer Pedido/Laudo</span></>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-slate-500">Sem Laudo</span></>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    Médicos que realizam:
                  </h4>
                  {exame.medico_exames && exame.medico_exames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exame.medico_exames.map((rel, idx) => {
                        const medico = rel.medicos;
                        if (!medico) return null;
                        return (
                          <Link key={idx} href={`/corpoclinico`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 transition-colors">
                              {medico.nome}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Nenhum médico vinculado a este exame.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}