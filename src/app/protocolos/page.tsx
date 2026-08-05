"use client";

import { ClipboardList, AlertTriangle, Info, Eye, CheckSquare, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProtocolosPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-rose-600" />
          Protocolos Callcenter
        </h1>
        <p className="text-slate-500 mt-2">
          (Agendamentos e Especificações) — O protocolo é um conjunto de regras, normas ou procedimentos que orientam como algo deve ser feito.
        </p>
      </div>

      {/* ALERTA CRUCIAL (Topo) */}
      <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3 shadow-sm">
        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-amber-800 font-bold text-lg">ATENÇÃO MÁXIMA</h3>
          <p className="text-amber-700 font-medium">
            SEMPRE conferir junto ao pedido médico quais são os exames solicitados!!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* SEÇÃO 1: PROTOCOLOS POR PATOLOGIA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Eye className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-semibold text-slate-800">Protocolos para Agendamento</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Card Catarata */}
            <Card className=" border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-blue-700">CATARATA</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-lg p-3">BIOMETRIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">TOPOGRAFIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">MICROSCOPIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">OCT DE RETINA</Badge>
              </CardContent>
            </Card>

            {/* Card Glaucoma */}
            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-emerald-700">GLAUCOMA</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-lg p-3">CAMPO VISUAL</Badge>
                <Badge variant="secondary" className="text-lg p-3">PAQUIMETRIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">RETINOGRAFIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">OCT DE NERVO</Badge>
              </CardContent>
            </Card>

            {/* Card Retina */}
            <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-rose-700">RETINA</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-lg p-3">OCT RETINA</Badge>
                <Badge variant="secondary" className="text-lg p-3">RETINOGRAFIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">MAPEAMENTO</Badge>
              </CardContent>
            </Card>

            {/* Card Córnea */}
            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="text-2xl text-purple-700">CÓRNEA</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-lg p-3">TOPOGRAFIA</Badge>
                <Badge variant="secondary" className="text-lg p-3">PAQUIMETRIA</Badge>
                <Badge variant="outline" className="text-lg p-3 bg-purple-50 border-purple-200 text-purple-700 italic">
                  OCT CÓRNEA (Se solicitado)
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex items-start gap-3 text-blue-800 text-sm leading-relaxed">
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
            <p>
              <strong>Caso falte exames:</strong> Tirar dúvida do motivo. Incluir no agendamento ou anotar nas observações.
            </p>
          </div>
        </section>

        {/* SEÇÃO 2: ESPECIFICAÇÕES PARA OBSERVAÇÕES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <CheckSquare className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-semibold text-slate-800">Especificações (Observações)</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Exames que DEVEM ser detalhados no agendamento:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <div className="font-bold text-slate-800 text-xl mb-2">CAMPO VISUAL:</div>
                <div className="text-slate-700 bg-white p-2 px-4 rounded border border-slate-200 flex items-center gap-2 text-lg">
                  <span className="font-semibold text-rose-600">24-2</span> OU <span className="font-semibold text-rose-600">10-2</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 text-lg">
                <div className="font-bold text-slate-800 text-xl mb-2">OCT (Área do Olho):</div>
                <div className="space-y-2 text-slate-700 bg-white p-2 px-4 rounded border border-slate-200">
                  <p>• <span className="font-medium text-blue-700">RETINA / MÁCULA</span></p>
                  <p>• <span className="font-medium text-blue-700">NERVO / DISCO / GLAUCOMA</span></p>
                  <p>• <span className="font-medium text-blue-700">CÓRNEA</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 text-lg">
                <div className="font-bold text-slate-800 text-xl mb-2">RETINOGRAFIA:</div>
                <div className="text-slate-700 bg-white p-2 px-4 rounded border border-slate-200">
                  Informar se é <span className="font-medium text-rose-600 italic">COM AUTOFLUORESCÊNCIA</span>.
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 text-red-800 shadow-sm mt-8">
        <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
        <p className="font-medium">
          Sempre conferir junto ao pedido médico quais são os exames solicitados. <strong>NÃO FAZER NA INCERTEZA</strong> pois pode prejudicar a Empresa / Paciente / Médico.
        </p>
      </div>
        </section>
      </div>

      {/* ALERTA FINAL */}
      
    </div>
  );
}