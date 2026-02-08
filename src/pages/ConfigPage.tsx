import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Bell, Palette, Download, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/components/AppLayout";

const areas = [
  { label: "Cível", active: true },
  { label: "Família", active: true },
  { label: "Trabalhista", active: false },
  { label: "Criminal", active: false },
  { label: "Empresarial", active: true },
  { label: "Consumidor", active: true },
];

export default function ConfigPage() {
  const [responseMode, setResponseMode] = useState<"curtas" | "completas">("completas");
  const [areasState, setAreasState] = useState(areas);

  const toggleArea = (idx: number) => {
    setAreasState((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl font-bold">Configurações</h1>

        {/* Response Mode */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-base font-semibold">Modo de Resposta</h2>
          </div>
          <div className="flex gap-2">
            {(["curtas", "completas"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setResponseMode(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  responseMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Areas */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-card border border-border space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-base font-semibold">Áreas de Atuação</h2>
          </div>
          <div className="space-y-3">
            {areasState.map((area, i) => (
              <div key={area.label} className="flex items-center justify-between">
                <span className="text-sm">{area.label}</span>
                <Switch checked={area.active} onCheckedChange={() => toggleArea(i)} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-card border border-border space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-base font-semibold">Notificações</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertas no app</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">E-mail</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push (quando suportado)</span>
              <Switch />
            </div>
          </div>
        </motion.section>

        {/* Backup */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Backup / Exportação</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.section>

        {/* Footer */}
        <div className="text-center pt-4 space-y-1">
          <p className="text-xs text-muted-foreground">Thainá Jurídico v1.0</p>
          <p className="text-[10px] text-muted-foreground/50">
            Uso exclusivo, privado e profissional
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
