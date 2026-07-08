"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy as CopyIcon, Scissors } from "lucide-react";
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

type SnippetItem = {
  id: string;
  title: string;
  content: string;
};

export default function CopiaColaPage() {
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("@oftalmo-helper:copiacola");
    if (saved) {
      setSnippets(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage
  const saveToStorage = (newSnippets: SnippetItem[]) => {
    setSnippets(newSnippets);
    localStorage.setItem("@oftalmo-helper:copiacola", JSON.stringify(newSnippets));
  };

  const handleOpenModal = (snippet?: SnippetItem) => {
    if (snippet) {
      setEditingId(snippet.id);
      setTitle(snippet.title);
      setContent(snippet.content);
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
      const updated = snippets.map((s) =>
        s.id === editingId ? { ...s, title, content } : s
      );
      saveToStorage(updated);
      toast.success("Texto rápido atualizado com sucesso!");
    } else {
      const newSnippet = { id: crypto.randomUUID(), title, content };
      saveToStorage([...snippets, newSnippet]);
      toast.success("Texto rápido criado com sucesso!");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este texto?")) {
      const updated = snippets.filter((s) => s.id !== id);
      saveToStorage(updated);
      toast.info("Texto rápido removido.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Texto copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Scissors className="h-8 w-8 text-blue-600" />
            Copia/Cola
          </h1>
          <p className="text-slate-500 mt-1">Armazene pequenos textos de uso frequente para copiar rapidamente.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Texto
        </Button>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">Nenhum texto armazenado ainda.</p>
          <Button variant="link" onClick={() => handleOpenModal()} className="text-blue-600">
            Crie seu primeiro texto rápido
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {snippets.map((snippet) => (
            <Card key={snippet.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-800 line-clamp-1">{snippet.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4 bg-slate-50 p-2 rounded border border-slate-100">
                  {snippet.content}
                </p>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="secondary" size="sm" onClick={() => handleCopy(snippet.content)} className="flex-1 mr-2 text-slate-700">
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(snippet)} className="h-8 w-8 text-slate-500">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(snippet.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Texto" : "Novo Texto Rápido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Identificação (Título)</label>
              <Input
                placeholder="Ex: Endereço da Clínica"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Texto para Copiar</label>
              <Textarea
                placeholder="Cole ou digite o texto aqui..."
                className="min-h-[100px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}