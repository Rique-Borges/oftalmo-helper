import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

// MÁGICA: Força o Vercel a tratar a aplicação como Dinâmica (sem tentar gerar HTML estático no build)
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OftalmoHelper 2001 v911",
  description: "Sistema auxiliar para operadores de call center oftalmológico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          <Sidebar />
          
          <div className="flex-1 ml-64 flex flex-col relative">
            <Topbar />
            
            <main className="flex-1 p-8 pt-24 min-h-[200vh]"> 
              {/* Suspense Global para lidar com qualquer parâmetro de URL em qualquer página */}
              <Suspense fallback={<div className="p-10 text-center text-slate-500 animate-pulse font-medium">Carregando interface...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}