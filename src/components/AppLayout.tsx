import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { path: "/home", icon: Home, label: "Início" },
  { path: "/processos", icon: Scale, label: "Processos" },
  { path: "/leis", icon: BookOpen, label: "Leis" },
  { path: "/assistente", icon: MessageSquare, label: "Assistente" },
  { path: "/biblioteca", icon: FolderOpen, label: "Biblioteca" },
  { path: "/config", icon: Settings, label: "Configurações" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao sair");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <Link to="/home" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-semibold gradient-text">
              Thainá Jurídico
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
            v1.0 · Uso exclusivo
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 glass-card border-b px-4 py-3 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-semibold gradient-text">
              Thainá Jurídico
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-50 glass-card border-b px-6 py-4 items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">
              {navItems.find(n => pathname.startsWith(n.path))?.label || "Thainá Jurídico"}
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:p-2"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t safe-area-bottom">
          <div className="flex items-center justify-around py-2 px-1">
            {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => {
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
                  <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
                </Link>
              );
            })}
            <Link
              to="/config"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                pathname.startsWith("/config")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-medium">Config</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
