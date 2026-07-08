import Link from "next/link";
import { FileText, Copy, Users, Stethoscope, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Array com os atalhos e cores exclusivas para os ícones
const shortcuts = [
  { name: "Scripts de Atendimento", desc: "Roteiros para ligações e suporte.", href: "/scripts", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  { name: "Copia/Cola", desc: "Textos rápidos de uso frequente.", href: "/copiacola", icon: Copy, color: "text-amber-600", bg: "bg-amber-100" },
  { name: "Corpo Clínico", desc: "Lista de médicos e especialidades.", href: "/corpoclinico", icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
  { name: "Exames/Procedimentos", desc: "Regras, laudos e agendamentos.", href: "/exames", icon: Stethoscope, color: "text-purple-600", bg: "bg-purple-100" },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col space-y-12 mt-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-800">
          Bem-vindo ao <span className="text-blue-600">OftalmoHelper</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Acesse rapidamente os módulos abaixo para auxiliar no atendimento aos pacientes.
        </p>
      </div>

      {/* TWEAK 2: Grid com os 4 cards da Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group outline-none">
              <Card className="h-full hover:border-blue-300 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={`p-4 rounded-xl ${s.bg}`}>
                    <Icon className={`h-8 w-8 ${s.color}`} />
                  </div>
                  <div className="flex-1 space-y-1 mt-1">
                    <CardTitle className="text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                      {s.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {s.desc}
                    </CardDescription>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}