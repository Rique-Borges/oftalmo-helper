import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";

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
            
            {/* O padding superior de 24 (pt-24) compensa a altura fixa da Topbar (h-16 = 4rem) */}
            <main className="flex-1 p-8 pt-24 min-h-[200vh]"> 
              {children}
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}