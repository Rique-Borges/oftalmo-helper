"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Topbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const router = useRouter();

  // Efeito de Transição de Opacidade no Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Verificar sessão admin salva
  useEffect(() => {
    const adminSession = sessionStorage.getItem("oftalmo_admin");
    if (adminSession === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleAdminLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("oftalmo_admin", "true");
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setPassword("");
      toast.success("Acesso Liberado", {
        description: "Você agora tem privilégios de administrador.",
      });
      router.push("/admin"); // Redireciona para o painel logo ao logar
    } else {
      toast.error("Acesso Negado", {
        description: "Senha incorreta. Tente novamente.",
      });
      setPassword("");
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("oftalmo_admin");
    setIsAdmin(false);
    toast.info("Logout Efetuado", {
      description: "Privilégios de administrador removidos.",
    });
    router.push("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-64 z-30 h-16 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-full px-8">
          <form onSubmit={handleSearch} className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Busca Global (Exames, Médicos...)"
              className="pl-10 bg-white/90 border-slate-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                  <Settings className="h-4 w-4 mr-2" />
                  Painel Admin
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAdminLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsAdminModalOpen(true)} className="text-slate-400 hover:text-slate-600">
                <Shield className="h-4 w-4 mr-2" />
                Acesso Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Autenticação Administrativa</DialogTitle>
            <DialogDescription>
              Insira a senha de administrador para gerenciar o Corpo Clínico e Exames.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              type="password"
              placeholder="Senha do sistema"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdminLogin} className="bg-blue-600 hover:bg-blue-700">Entrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}