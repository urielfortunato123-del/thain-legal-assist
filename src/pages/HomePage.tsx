import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Scale,
  BookOpen,
  MessageSquare,
  FolderOpen,
  Bell,
  Star,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";

const quickActions = [
  { icon: Scale, label: "Processos", path: "/processos", color: "text-primary" },
  { icon: BookOpen, label: "Leis", path: "/leis", color: "text-info" },
  { icon: MessageSquare, label: "Assistente", path: "/assistente", color: "text-success" },
  { icon: FolderOpen, label: "Biblioteca", path: "/biblioteca", color: "text-warning" },
];

const favoriteProcesses = [
  { cnj: "5001234-56.2024.8.16.0014", title: "Silva vs. Empresa ABC", status: "Em andamento", court: "TJPR" },
  { cnj: "5009876-12.2023.8.16.0001", title: "Inventário - Família Santos", status: "Aguardando", court: "TJPR" },
  { cnj: "5005555-33.2024.8.16.0014", title: "Trabalhista - Maria Oliveira", status: "Concluso", court: "TRT9" },
];

const todayAlerts = [
  { type: "movement", text: "Nova movimentação: Silva vs. Empresa ABC", time: "14:32" },
  { type: "deadline", text: "Prazo: contestação Família Santos — 3 dias", time: "Vence 11/02" },
  { type: "movement", text: "Despacho publicado: Trabalhista Maria Oliveira", time: "09:15" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        {/* Greeting */}
        <div>
          <h1 className="font-serif text-2xl font-bold">Bom dia, Thainá Woichaka</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar processo, lei, documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border h-12 text-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, path, color }, i) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all shadow-card"
              >
                <Icon className={`h-6 w-6 ${color}`} />
                <span className="text-[11px] font-medium text-foreground">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Today Alerts */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-semibold">Alertas de Hoje</h2>
            </div>
            <span className="text-xs text-muted-foreground">{todayAlerts.length} novos</span>
          </div>
          <div className="space-y-2">
            {todayAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
              >
                {alert.type === "deadline" ? (
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-info mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{alert.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Favorite Processes */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-lg font-semibold">Meus Processos</h2>
            </div>
            <Link to="/processos" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {favoriteProcesses.map((proc) => (
              <Link
                key={proc.cnj}
                to={`/processo/${encodeURIComponent(proc.cnj)}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{proc.title}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {proc.cnj}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {proc.court}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{proc.status}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </AppLayout>
  );
}
