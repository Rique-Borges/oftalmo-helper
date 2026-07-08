"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stethoscope, AlertCircle, Users, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

function ExameCard({ exame, isHighlighted }: { exame: Exame, isHighlighted: boolean }) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <Card 
      id={exame.id}
      className={`overflow-hidden flex flex-col transition-all duration-500 ${isHighlighted ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
    >
      <CardHeader className="bg-slate-50 border-b pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl text-slate-800">{exame.nome}</CardTitle>
            <CardDescription className="mt-1 font-medium text-blue-600">{exame.especialidade_relacionada}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex flex-col flex-1">
        {/* INFORMAÇÕES CRUCIAIS PARA O AGENDAMENTO */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 text-sm flex-1">
              {exame.necessita_acompanhante ? (
                <><AlertCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-slate-700">Requer Acompanhante</span></>
              ) : (
                <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-slate-500">Sem Acompanhante</span></>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              {exame.necessita_laudo ? (
                <><AlertCircle className="h-4 w-4 text-orange-500" /><span className="font-medium text-slate-700">Necessita solicitar laudo</span></>
              ) : (
                <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-slate-500">Não necessita solicitar laudo</span></>
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
                    <Link key={idx} href={`/corpoclinico`}>
                      <Badge variant="outline" className="cursor-pointer bg-white hover:bg-slate-100 transition-colors">
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
        </div>

        {/* DROPDOWN DE DESCRIÇÃO DO PROCEDIMENTO */}
        <div className="mt-auto pt-4">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center text-slate-600 bg-slate-50 hover:bg-slate-100 border border-transparent"
            onClick={() => setShowDesc(!showDesc)}
          >
            {showDesc ? "Ocultar Descrição" : "Ver Descrição do Procedimento"}
            {showDesc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showDesc && (
            <div className="mt-3 p-4 bg-blue-50/50 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-1">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {exame.resumo || "Nenhuma descrição ou orientação específica cadastrada."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExamesContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  
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

  // DIVIDINDO O ARRAY PARA COLUNAS INDEPENDENTES
  const examesColunaEsquerda = exames.filter((_, index) => index % 2 === 0);
  const examesColunaDireita = exames.filter((_, index) => index % 2 !== 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Exames e Procedimentos
        </h1>
        <p className="text-slate-500 mt-1">Consulte informações cruciais para o agendamento e médicos vinculados.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        <>
          {/* VIEW DESKTOP (Telas Grandes): Colunas independentes (esquerda e direita) */}
          <div className="hidden xl:grid grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
              {examesColunaEsquerda.map((exame) => (
                <ExameCard key={exame.id} exame={exame} isHighlighted={highlightId === exame.id} />
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {examesColunaDireita.map((exame) => (
                <ExameCard key={exame.id} exame={exame} isHighlighted={highlightId === exame.id} />
              ))}
            </div>
          </div>

          {/* VIEW MOBILE / TABLET (Telas Menores): Coluna única para não quebrar a ordem */}
          <div className="grid xl:hidden grid-cols-1 gap-6 items-start">
            {exames.map((exame) => (
              <ExameCard key={exame.id} exame={exame} isHighlighted={highlightId === exame.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExamesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-20 text-slate-500">
        <Stethoscope className="h-8 w-8 animate-pulse text-blue-500 mr-2" />
        <p>Carregando exames...</p>
      </div>
    }>
      <ExamesContent />
    </Suspense>
  );
}