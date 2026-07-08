"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Plus, Edit2, Trash2, Link as LinkIcon, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Estados de Dados
  const [medicos, setMedicos] = useState<any[]>([]);
  const [exames, setExames] = useState<any[]>([]);
  const [vinculos, setVinculos] = useState<any[]>([]);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"medico" | "exame" | "vinculo" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Formulário - Médicos
  const [nomeMedico, setNomeMedico] = useState("");
  const [espPrincipal, setEspPrincipal] = useState("");
  const [espSec, setEspSec] = useState("");

  // Formulário - Exames
  const [nomeExame, setNomeExame] = useState("");
  const [espRel, setEspRel] = useState("");
  const [resumo, setResumo] = useState("");
  const [reqAcomp, setReqAcomp] = useState(false);
  const [reqLaudo, setReqLaudo] = useState(false);

  // Formulário - Vínculos
  const [vinculoMedico, setVinculoMedico] = useState("");
  const [vinculoExame, setVinculoExame] = useState("");

  // Validação de Sessão
  useEffect(() => {
    const adminSession = sessionStorage.getItem("oftalmo_admin");
    if (adminSession !== "true") {
      router.push("/");
      toast.error("Acesso restrito. Faça login como admin.");
    } else {
      setIsAuthorized(true);
      fetchData();
    }
  }, [router]);

  // Carregamento Global (Buscamos tudo em paralelo para o painel)
  const fetchData = async () => {
    try {
      const [mRes, eRes, vRes] = await Promise.all([
        supabase.from("medicos").select("*").order("nome"),
        supabase.from("exames").select("*").order("nome"),
        supabase.from("medico_exames").select(`
          id, 
          medico_id, 
          exame_id, 
          medicos (nome), 
          exames (nome)
        `)
      ]);
      setMedicos(mRes.data || []);
      setExames(eRes.data || []);
      setVinculos(vRes.data || []);
    } catch (error) {
      toast.error("Erro ao carregar banco de dados.");
    }
  };

  if (!isAuthorized) return null;

  // Abertura de Modais e Preenchimento para Edição
  const openDialog = (type: "medico" | "exame" | "vinculo", item?: any) => {
    setDialogType(type);
    setEditId(item ? item.id : null);

    if (type === "medico") {
      setNomeMedico(item?.nome || "");
      setEspPrincipal(item?.especialidade_principal || "");
      setEspSec(item?.especialidades_secundarias?.join(", ") || "");
    } else if (type === "exame") {
      setNomeExame(item?.nome || "");
      setEspRel(item?.especialidade_relacionada || "");
      setResumo(item?.resumo || "");
      setReqAcomp(item?.necessita_acompanhante || false);
      setReqLaudo(item?.necessita_laudo || false);
    } else if (type === "vinculo") {
      setVinculoMedico("");
      setVinculoExame("");
    }

    setIsModalOpen(true);
  };

  // Salvar (Insert / Update)
  const handleSave = async () => {
    try {
      if (dialogType === "medico") {
        if (!nomeMedico || !espPrincipal) return toast.error("Preencha nome e especialidade!");
        const espArray = espSec.split(",").map(s => s.trim()).filter(Boolean);
        const payload = { nome: nomeMedico, especialidade_principal: espPrincipal, especialidades_secundarias: espArray };
        
        if (editId) await supabase.from("medicos").update(payload).eq("id", editId);
        else await supabase.from("medicos").insert(payload);

      } else if (dialogType === "exame") {
        if (!nomeExame || !espRel) return toast.error("Preencha nome e especialidade relacionada!");
        const payload = { nome: nomeExame, especialidade_relacionada: espRel, resumo, necessita_acompanhante: reqAcomp, necessita_laudo: reqLaudo };
        
        if (editId) await supabase.from("exames").update(payload).eq("id", editId);
        else await supabase.from("exames").insert(payload);

      } else if (dialogType === "vinculo") {
        if (!vinculoMedico || !vinculoExame) return toast.error("Selecione Médico e Exame!");
        const { error } = await supabase.from("medico_exames").insert({ medico_id: vinculoMedico, exame_id: vinculoExame });
        if (error && error.code === '23505') { // Restrição UNIQUE que colocamos no SQL da Fase 1
          return toast.error("Este vínculo já existe!");
        }
      }

      toast.success("Salvo com sucesso!");
      setIsModalOpen(false);
      fetchData(); // Atualiza tabelas
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  // Excluir
  const handleDelete = async (table: "medicos" | "exames" | "medico_exames", id: string) => {
    if (!confirm("Tem certeza que deseja excluir? Isso pode apagar vínculos (Cascata).")) return;
    try {
      await supabase.from(table).delete().eq("id", id);
      toast.success("Registro apagado.");
      fetchData();
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-600" />
          Painel Administrativo
        </h1>
        <p className="text-slate-500 mt-1">Gerencie os registros do banco de dados (Supabase).</p>
      </div>

      <Tabs defaultValue="medicos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="medicos">Corpo Clínico</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="vinculos">Vínculos (Pivot)</TabsTrigger>
        </TabsList>

        {/* ABA: MÉDICOS */}
        <TabsContent value="medicos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cadastro de Médicos</CardTitle>
                <CardDescription>Adicione ou edite membros do corpo clínico.</CardDescription>
              </div>
              <Button onClick={() => openDialog("medico")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Novo Médico
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade Principal</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicos.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.nome}</TableCell>
                      <TableCell>{m.especialidade_principal}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog("medico", m)}>
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("medicos", m.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: EXAMES */}
        <TabsContent value="exames">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cadastro de Exames</CardTitle>
                <CardDescription>Adicione ou edite os procedimentos realizados na clínica.</CardDescription>
              </div>
              <Button onClick={() => openDialog("exame")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Novo Exame
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Especialidade Relac.</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exames.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell>{e.especialidade_relacionada}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog("exame", e)}>
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("exames", e.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: VÍNCULOS */}
        <TabsContent value="vinculos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vínculos (Médico <LinkIcon className="inline h-4 w-4 mx-1"/> Exame)</CardTitle>
                <CardDescription>Defina quais médicos realizam quais exames para integrá-los no sistema.</CardDescription>
              </div>
              <Button onClick={() => openDialog("vinculo")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" /> Vincular
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médico</TableHead>
                    <TableHead>Exame / Procedimento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vinculos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.medicos?.nome || "Desconhecido"}</TableCell>
                      <TableCell>{v.exames?.nome || "Desconhecido"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete("medico_exames", v.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL GLOBAL DE EDIÇÃO/CRIAÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Editar " : "Adicionar "}
              {dialogType === "medico" ? "Médico" : dialogType === "exame" ? "Exame" : "Vínculo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            {/* Campos Dinâmicos: MEDICO */}
            {dialogType === "medico" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Médico</label>
                  <Input placeholder="Ex: Dr. Roberto Silva" value={nomeMedico} onChange={e => setNomeMedico(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialidade Principal</label>
                  <Input placeholder="Ex: Oftalmologia Geral" value={espPrincipal} onChange={e => setEspPrincipal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialidades Secundárias (Separe por vírgula)</label>
                  <Input placeholder="Ex: Glaucoma, Catarata" value={espSec} onChange={e => setEspSec(e.target.value)} />
                </div>
              </>
            )}

            {/* Campos Dinâmicos: EXAME */}
            {dialogType === "exame" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Exame</label>
                  <Input placeholder="Ex: Mapeamento de Retina" value={nomeExame} onChange={e => setNomeExame(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialidade Relacionada</label>
                  <Input placeholder="Ex: Retina" value={espRel} onChange={e => setEspRel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resumo / Restrições (Opcional)</label>
                  <Textarea className="h-24" placeholder="Descreva preparo, jejum, etc." value={resumo} onChange={e => setResumo(e.target.value)} />
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reqAcomp" checked={reqAcomp} onCheckedChange={(checked) => setReqAcomp(checked === true)} />
                    <label htmlFor="reqAcomp" className="text-sm font-medium leading-none cursor-pointer">Necessita de Acompanhante?</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reqLaudo" checked={reqLaudo} onCheckedChange={(checked) => setReqLaudo(checked === true)} />
                    <label htmlFor="reqLaudo" className="text-sm font-medium leading-none cursor-pointer">Necessita de Pedido/Laudo Médico?</label>
                  </div>
                </div>
              </>
            )}

            {/* Campos Dinâmicos: VÍNCULO */}
            {dialogType === "vinculo" && (
              <>
                <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 flex gap-2 items-center">
                  <ShieldAlert className="h-4 w-4" />
                  Selecione um médico e um exame para interligá-los no sistema.
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione o Médico</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={vinculoMedico} 
                    onChange={e => setVinculoMedico(e.target.value)}
                  >
                    <option value="" disabled>Escolha um médico...</option>
                    {medicos.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione o Exame</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={vinculoExame} 
                    onChange={e => setVinculoExame(e.target.value)}
                  >
                    <option value="" disabled>Escolha um exame...</option>
                    {exames.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Salvar Dados</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}