import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Scale, Download, Share, Smartphone, Monitor, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallPage() {
  const { canInstall, isInstalled, isIOS, isStandalone, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center"
      >
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary shadow-gold">
          <Scale className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="font-serif text-2xl font-bold gradient-text">
            Thainá Jurídico
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Instale para acesso rápido
          </p>
        </div>

        {/* Already installed */}
        {(isInstalled || isStandalone) && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-xl bg-success/10 border border-success/20"
          >
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">App já instalado!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Você está usando a versão instalada
            </p>
          </motion.div>
        )}

        {/* Install options */}
        {!isInstalled && !isStandalone && (
          <div className="space-y-4">
            {/* Platforms */}
            <div className="flex justify-center gap-6 py-3">
              <div className="flex flex-col items-center gap-1">
                <Smartphone className="h-6 w-6 text-primary" />
                <span className="text-[10px] text-muted-foreground">iPhone/Android</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Monitor className="h-6 w-6 text-primary" />
                <span className="text-[10px] text-muted-foreground">Windows/Mac</span>
              </div>
            </div>

            {/* iOS Instructions */}
            {isIOS && (
              <div className="p-4 rounded-xl bg-card border border-border text-left space-y-3">
                <p className="text-sm font-medium">Para instalar no iPhone:</p>
                <ol className="text-xs text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Toque no botão <Share className="inline h-3 w-3" /> Compartilhar na barra inferior do Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span>Role e toque em <strong>"Adicionar à Tela de Início"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Confirme tocando em <strong>"Adicionar"</strong></span>
                  </li>
                </ol>
              </div>
            )}

            {/* Chrome/Edge Install Button */}
            {canInstall && (
              <Button
                onClick={handleInstall}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 gap-2 h-12"
              >
                <Download className="h-5 w-5" />
                Instalar Aplicativo
              </Button>
            )}

            {/* Not iOS and can't install */}
            {!isIOS && !canInstall && (
              <div className="p-4 rounded-xl bg-card border border-border text-left space-y-2">
                <p className="text-sm font-medium">Para instalar no PC:</p>
                <p className="text-xs text-muted-foreground">
                  Clique no ícone de instalação <Download className="inline h-3 w-3" /> na barra de endereço do Chrome ou Edge
                </p>
              </div>
            )}
          </div>
        )}

        {/* Continue to app */}
        <Link to="/login" className="block">
          <Button variant="outline" className="w-full border-border gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isInstalled ? "Abrir App" : "Continuar no navegador"}
          </Button>
        </Link>

        <p className="text-[10px] text-muted-foreground/50">
          Funciona offline após instalação
        </p>
      </motion.div>
    </div>
  );
}
