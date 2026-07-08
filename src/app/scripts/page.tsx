"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ScriptItem = {
  id: string;
  title: string;
  content: string;
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("@oftalmo-helper:scripts");
    if (saved) {
      setScripts(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage
  const saveToStorage = (newScripts: ScriptItem[]) => {
    setScripts(newScripts);
    localStorage.setItem("@oftalmo-helper:scripts", JSON.stringify(newScripts));
  };

  const handleOpenModal = (script?: ScriptItem) => {
    if (script) {
      setEditingId(script.id);
      setTitle(script.title);
      setContent(script.content);
    } else {
      setEditingId(null);
      setTitle("");
      setContent("");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Preencha título e conteúdo!");
      return;
    }

    if (editingId) {
      const updated = scripts.map((s) =>
        s.id === editingId ? { ...s, title, content } : s
      );
      saveToStorage(updated);
      toast.success("Script atualizado com sucesso!");
    } else {
      const newScript = { id: crypto.randomUUID(), title, content };
      saveToStorage([...scripts, newScript]);
      toast.success("Script criado com sucesso!");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este script?")) {
      const updated = scripts.filter((s) => s.id !== id);
      saveToStorage(updated);
      toast.info("Script removido.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Scripts de Atendimento
          </h1>
          <p className="text-slate-500 mt-1">Gerencie seus roteiros para ligações e atendimento ao cliente.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Script
        </Button>
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">Nenhum script criado ainda.</p>
          <Button variant="link" onClick={() => handleOpenModal()} className="text-blue-600">
            Crie seu primeiro script
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <Card key={script.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-800 line-clamp-1">{script.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-6">
                  {script.content}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-slate-50 flex justify-between rounded-b-lg">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(script.content)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(script)} className="h-8 w-8 text-slate-500">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(script.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Script" : "Novo Script"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Título</label>
              <Input
                placeholder="Ex: Saudação Padrão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Conteúdo do Script</label>
              <Textarea
                placeholder="Digite o texto do roteiro..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Salvar Script</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}