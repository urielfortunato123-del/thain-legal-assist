import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, ChevronRight, Clock, MapPin, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { Link } from "react-router-dom";

const mockTimeline = [
  { date: "05/02/2026", desc: "Conclusos para decisão" },
  { date: "30/01/2026", desc: "Juntada de petição — Réu" },
  { date: "15/01/2026", desc: "Despacho: intimem-se as partes" },
  { date: "10/01/2026", desc: "Distribuição por sorteio" },
];

export default function ProcessosPage() {
  const [cnj, setCnj] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl font-bold">Consulta de Processos</h1>

        {/* Search */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Número CNJ
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="0000000-00.0000.0.00.0000"
              value={cnj}
              onChange={(e) => setCnj(e.target.value)}
              className="bg-secondary border-border font-mono text-sm flex-1"
            />
            <Button
              onClick={() => setSearched(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 px-6"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Result */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Process Card */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-lg font-semibold">Silva vs. Empresa ABC Ltda</h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {cnj || "5001234-56.2024.8.16.0014"}
                  </p>
                </div>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Star className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tribunal</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary" />
                    <p className="text-sm">TJPR — 14ª Vara Cível</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Classe</p>
                  <p className="text-sm">Procedimento Comum Cível</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Assunto</p>
                  <p className="text-sm">Indenização por Dano Moral</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className="text-sm text-success">Em andamento</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-xs gap-1 border-border">
                  <Star className="h-3 w-3" /> Favoritar
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1 border-border">
                  <Clock className="h-3 w-3" /> Criar Prazo
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1 border-border">
                  <FileText className="h-3 w-3" /> Nota
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-serif text-lg font-semibold mb-3">Movimentações</h3>
              <div className="space-y-0">
                {mockTimeline.map((event, i) => (
                  <div key={i} className="flex gap-3 pb-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-border"}`} />
                      {i < mockTimeline.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm">{event.desc}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
