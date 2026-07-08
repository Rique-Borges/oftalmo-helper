"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Stethoscope, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ExameRelacionado = {
  exames: {
    id: string;
    nome: string;
  };
};

type Medico = {
  id: string;
  nome: string;
  especialidade_principal: string;
  especialidades_secundarias: string[];
  medico_exames: ExameRelacionado[];
};

export default function CorpoClinicoPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicos() {
      try {
        const { data, error } = await supabase
          .from("medicos")
          .select(`
            id,
            nome,
            especialidade_principal,
            especialidades_secundarias,
            medico_exames (
              exames ( id, nome )
            )
          `)
          .order("nome");

        if (error) throw error;
        setMedicos(data as any as Medico[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMedicos();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Corpo Clínico
        </h1>
        <p className="text-slate-500 mt-1">Consulte os médicos especialistas e os procedimentos que realizam.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-600 gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Erro ao carregar dados: {error}</p>
        </div>
      ) : medicos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">Nenhum médico cadastrado no sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicos.map((medico) => (
            <Card key={medico.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-xl text-slate-800">{medico.nome}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-blue-600 hover:bg-blue-700">{medico.especialidade_principal}</Badge>
                  {medico.especialidades_secundarias?.map((esp, idx) => (
                    <Badge key={idx} variant="secondary">{esp}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-slate-400" />
                  Exames e Procedimentos Realizados:
                </h4>
                {medico.medico_exames && medico.medico_exames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medico.medico_exames.map((rel, idx) => {
                      const exame = rel.exames;
                      if (!exame) return null;
                      return (
                        <Link key={idx} href={`/exames?id=${exame.id}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors">
                            {exame.nome}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhum exame vinculado a este médico.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}