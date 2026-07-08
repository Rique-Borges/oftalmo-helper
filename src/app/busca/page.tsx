"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Users, Stethoscope, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// 1. Isolamos a lógica que usa o hook em um subcomponente
function BuscaContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [medicosResult, setMedicosResult] = useState<any[]>([]);
  const [examesResult, setExamesResult] = useState<any[]>([]);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setMedicosResult([]);
        setExamesResult([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      const { data: medicos } = await supabase
        .from("medicos")
        .select("id, nome, especialidade_principal")
        .or(`nome.ilike.%${query}%,especialidade_principal.ilike.%${query}%`)
        .limit(10);

      const { data: exames } = await supabase
        .from("exames")
        .select("id, nome, resumo")
        .or(`nome.ilike.%${query}%,resumo.ilike.%${query}%,especialidade_relacionada.ilike.%${query}%`)
        .limit(10);

      setMedicosResult(medicos || []);
      setExamesResult(exames || []);
      setIsLoading(false);
    }

    performSearch();
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-20">
        <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-700">Digite algo para buscar</h2>
        <p className="text-slate-500">Utilize a barra no topo da página para pesquisar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Search className="h-8 w-8 text-blue-600" />
          Resultados da Busca
        </h1>
        <p className="text-slate-500 mt-1">
          Mostrando resultados para: <span className="font-semibold text-slate-800">"{query}"</span>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Corpo Clínico ({medicosResult.length})
            </h2>
            {medicosResult.length === 0 ? (
              <p className="text-slate-500 italic">Nenhum médico encontrado.</p>
            ) : (
              <div className="grid gap-3">
                {medicosResult.map((m) => (
                  <Card key={m.id} className="hover:border-blue-300 transition-colors">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{m.nome}</CardTitle>
                          <p className="text-sm text-slate-500">{m.especialidade_principal}</p>
                        </div>
                        <Link href={`/corpoclinico`}>
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            Ver Detalhes <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-slate-500" />
              Exames / Procedimentos ({examesResult.length})
            </h2>
            {examesResult.length === 0 ? (
              <p className="text-slate-500 italic">Nenhum exame encontrado.</p>
            ) : (
              <div className="grid gap-3">
                {examesResult.map((e) => (
                  <Card key={e.id} className="hover:border-blue-300 transition-colors">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{e.nome}</CardTitle>
                          <p className="text-sm text-slate-500 line-clamp-1 max-w-lg mt-1">{e.resumo}</p>
                        </div>
                        <Link href={`/exames?id=${e.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            Ver Regras <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// 2. Exportamos a página envelopada no Suspense Boundary
export default function BuscaGlobalPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-4">
        <Search className="h-8 w-8 animate-pulse text-blue-500" />
        <p>Carregando busca...</p>
      </div>
    }>
      <BuscaContent />
    </Suspense>
  );
}