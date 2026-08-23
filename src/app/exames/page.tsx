import { Suspense } from "react";
import { Stethoscope, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ExameCard, type Exame } from "@/components/exame-card";

// Cache do Next.js de 60 segundos
export const revalidate = 60;

async function getExames(): Promise<Exame[]> {
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

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as Exame[]) || [];
}

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ExamesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const highlightId = resolvedParams?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Exames e Procedimentos
        </h1>
        <p className="text-slate-500 mt-1">
          Consulte informações cruciais para o agendamento e médicos vinculados.
        </p>
      </div>

      <Suspense fallback={<ExamesSkeleton />}>
        <ExamesList highlightId={highlightId} />
      </Suspense>
    </div>
  );
}

async function ExamesList({ highlightId }: { highlightId?: string }) {
  let exames: Exame[] = [];

  try {
    exames = await getExames();
  } catch (err: any) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-600 gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>Erro ao carregar dados: {err.message || "Erro de conexão"}</p>
      </div>
    );
  }

  if (exames.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500">Nenhum exame cadastrado no sistema.</p>
      </div>
    );
  }

  return (
    /* Layout Masonry puro via Tailwind (CSS columns) sem duplicação de DOM */
    <div className="columns-1 xl:columns-2 gap-6 [column-fill:_balance]">
      {exames.map((exame) => (
        <ExameCard
          key={exame.id}
          exame={exame}
          isHighlighted={highlightId === exame.id}
        />
      ))}
    </div>
  );
}

function ExamesSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-xl" />
      ))}
    </div>
  );
}