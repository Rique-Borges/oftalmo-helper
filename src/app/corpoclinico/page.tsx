import { Suspense } from "react";
import Link from "next/link";
import { Users, Stethoscope, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Tipagens
type ExameRelacionado = {
  exames: {
    id: string;
    nome: string;
  } | null;
};

type Medico = {
  id: string;
  nome: string;
  especialidade_principal: string;
  especialidades_secundarias: string[];
  medico_exames: ExameRelacionado[];
};

// Revalidação em background a cada 60 segundos (ISR - melhora brutal de velocidade)
export const revalidate = 60;

// Função de busca de dados no servidor
async function getMedicos(): Promise<Medico[]> {
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

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as Medico[]) || [];
}

export default function CorpoClinicoPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Corpo Clínico
        </h1>
        <p className="text-slate-500 mt-1">
          Consulte os médicos especialistas e os procedimentos que realizam.
        </p>
      </div>

      {/* Streaming com Suspense: renderiza o Skeleton instantaneamente caso necessário */}
      <Suspense fallback={<ListaSkeleton />}>
        <MedicosList />
      </Suspense>
    </div>
  );
}

// Componente assíncrono que busca e renderiza os médicos
async function MedicosList() {
  let medicos: Medico[] = [];

  try {
    medicos = await getMedicos();
  } catch (err: any) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center text-red-600 gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>Erro ao carregar dados: {err.message || "Erro desconhecido"}</p>
      </div>
    );
  }

  if (medicos.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500">Nenhum médico cadastrado no sistema.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {medicos.map((medico) => (
        <MedicoCard key={medico.id} medico={medico} />
      ))}
    </div>
  );
}

// Card individual separado para melhor organização e renderização
function MedicoCard({ medico }: { medico: Medico }) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-xl text-slate-800">{medico.nome}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className="bg-blue-600 hover:bg-blue-700">
            {medico.especialidade_principal}
          </Badge>
          {medico.especialidades_secundarias?.map((esp, idx) => (
            <Badge key={idx} variant="secondary">
              {esp}
            </Badge>
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
                <Link key={idx} href={`/exames?id=${exame.id}`} prefetch={false}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    {exame.nome}
                  </Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Nenhum exame vinculado a este médico.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton Fallback
function ListaSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}