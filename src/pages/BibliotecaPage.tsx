import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  Upload,
  Search,
  ChevronRight,
  File,
  Image,
  FileType,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const folders = [
  { name: "Clientes / PF", count: 12, icon: Folder },
  { name: "Clientes / PJ", count: 5, icon: Folder },
  { name: "Casos", count: 8, icon: Folder },
  { name: "Processos", count: 15, icon: Folder },
  { name: "Modelos", count: 13, icon: FileType },
  { name: "Vade Mecum (Privado)", count: 1, icon: FileText },
  { name: "Jurisprudência", count: 24, icon: FileText },
  { name: "Financeiro", count: 6, icon: File },
];

const recentDocs = [
  { name: "Procuração - Maria Silva.pdf", type: "PDF", date: "05/02/2026", size: "245 KB" },
];

function getFileIcon(type: string) {
  switch (type) {
    case "IMG": return <Image className="h-4 w-4 text-success" />;
    case "DOCX": return <FileType className="h-4 w-4 text-info" />;
    default: return <FileText className="h-4 w-4 text-destructive" />;
  }
}

export default function BibliotecaPage() {
  const [search, setSearch] = useState("");

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Biblioteca</h1>
          <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos, modelos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-sm"
          />
        </div>

        {/* Folders */}
        <section>
          <h2 className="font-serif text-lg font-semibold mb-3">Pastas</h2>
          <div className="grid grid-cols-2 gap-2">
            {folders.map((folder, i) => (
              <motion.button
                key={folder.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left"
              >
                <folder.icon className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{folder.name}</p>
                  <p className="text-[10px] text-muted-foreground">{folder.count} itens</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section>
          <h2 className="font-serif text-lg font-semibold mb-3">Documentos Recentes</h2>
          <div className="space-y-2">
            {recentDocs.map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group"
              >
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
