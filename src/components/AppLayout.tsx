import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Scale,
  BookOpen,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/home", icon: Home, label: "Início" },
  { path: "/processos", icon: Scale, label: "Processos" },
  { path: "/leis", icon: BookOpen, label: "Leis" },
  { path: "/assistente", icon: MessageSquare, label: "Assistente" },
  { path: "/biblioteca", icon: FolderOpen, label: "Biblioteca" },
  { path: "/config", icon: Settings, label: "Config" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-card border-b px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg font-semibold gradient-text">
            Thainá Jurídico
          </span>
        </Link>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 pb-20">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
