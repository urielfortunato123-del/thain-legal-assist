import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Eye, EyeOff, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary shadow-gold">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold gradient-text">
            Thainá Jurídico
          </h1>
          <p className="text-sm text-muted-foreground">
            Assistente pessoal jurídico
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              E-mail
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold">
            Entrar
          </Button>
        </form>

        {/* Passkey */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Button
            variant="outline"
            className="w-full border-gold-dim text-gold hover:bg-secondary gap-2"
            onClick={() => navigate("/home")}
          >
            <Fingerprint className="h-5 w-5" />
            Entrar com Face ID (Passkey)
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <button className="text-primary hover:underline">Esqueci minha senha</button>
        </p>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/50 pt-4">
          Uso exclusivo, privado e profissional
        </p>
      </motion.div>
    </div>
  );
}
