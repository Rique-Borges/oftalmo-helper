"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Copy, Users, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Scripts de Atendimento", href: "/scripts", icon: FileText },
  { name: "Copia/Cola", href: "/copiacola", icon: Copy },
  { name: "Corpo Clínico", href: "/corpoclinico", icon: Users },
  { name: "Exames/Procedimentos", href: "/exames", icon: Stethoscope },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r bg-white flex flex-col shadow-sm">
      <div className="flex h-16 items-center border-b px-6">
        {/* TWEAK 1: Logo agora é um link que redireciona para a home */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-75 transition-opacity">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          <span>OftalmoHelper <span className="textc-xs text-muted-foreground">v911</span></span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 mb-1",
                  isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800" : "text-slate-600"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-slate-50">
        <p className="text-xs text-center text-slate-400">
          © 2026 Henrique Business, com muito amor
        </p>
      </div>
    </aside>
  );
}