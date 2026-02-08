import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  FileText,
  StickyNote,
  CheckSquare,
  Upload,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";

const mockTimeline = [
  { date: "05/02/2026 14:32", desc: "Conclusos para decisão" },
  { date: "30/01/2026 10:15", desc: "Juntada de petição — Réu apresentou contestação" },
  { date: "15/01/2026 09:00", desc: "Despacho: intimem-se as partes para réplica" },
  { date: "10/01/2026 08:30", desc: "Distribuição por sorteio — 14ª Vara Cível" },
];

const mockNotes = [
  { date: "05/02/2026", text: "Verificar prazo de réplica — 15 dias úteis." },
  { date: "01/02/2026", text: "Cliente mencionou novos documentos sobre o contrato." },
];

const mockTasks = [
  { title: "Apresentar réplica", due: "20/02/2026", status: "pendente", priority: "alta" },
  { title: "Juntar novos documentos", due: "15/02/2026", status: "pendente", priority: "média" },
];

const mockDocs = [
  { name: "Petição Inicial.pdf", date: "10/01/2026", size: "320 KB" },
  { name: "Procuração.pdf", date: "10/01/2026", size: "145 KB" },
  { name: "Contrato Original.pdf", date: "12/01/2026", size: "890 KB" },
];

export default function ProcessoDetailPage() {
  const { id } = useParams();

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h1 className="font-serif text-xl font-bold">Silva vs. Empresa ABC Ltda</h1>
            <Star className="h-5 w-5 text-primary shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {decodeURIComponent(id || "")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              TJPR — 14ª Vara Cível
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              Em andamento
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              Dano Moral
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="timeline" className="flex-1 text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 text-xs">Notas</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1 text-xs">Prazos</TabsTrigger>
            <TabsTrigger value="docs" className="flex-1 text-xs">Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4 space-y-0">
            {mockTimeline.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 pb-4 relative"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-border"}`} />
                  {i < mockTimeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{event.desc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-3">
            {mockNotes.map((note, i) => (
              <div key={i} className="p-3 rounded-xl bg-card border border-border">
                <p className="text-sm">{note.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-border">
              <Plus className="h-3 w-3" /> Nova Nota
            </Button>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-3">
            {mockTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{task.due}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      task.priority === "alta" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-border">
              <Plus className="h-3 w-3" /> Novo Prazo
            </Button>
          </TabsContent>

          <TabsContent value="docs" className="mt-4 space-y-3">
            {mockDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <FileText className="h-4 w-4 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-border">
              <Upload className="h-3 w-3" /> Upload
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
