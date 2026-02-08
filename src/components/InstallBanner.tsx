import { motion } from "framer-motion";
import { Download, Share, Smartphone, Monitor, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState } from "react";

export default function InstallBanner() {
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed/standalone or dismissed
  if (isStandalone || isInstalled || dismissed) return null;

  // Don't show if can't install (unless iOS where we show manual instructions)
  if (!canInstall && !isIOS) return null;

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            {isIOS ? (
              <Share className="h-5 w-5 text-primary" />
            ) : (
              <Download className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-sm">Instalar Thainá Jurídico</h3>
            {isIOS ? (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Toque em <Share className="inline h-3 w-3" /> e depois em{" "}
                <strong>"Adicionar à Tela de Início"</strong>
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse rapidamente sem abrir o navegador
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Smartphone className="h-3 w-3 text-muted-foreground" />
                  <Monitor className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Celular & PC</span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isIOS && (
          <Button
            onClick={handleInstall}
            className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Instalar Agora
          </Button>
        )}
      </div>
    </motion.div>
  );
}
