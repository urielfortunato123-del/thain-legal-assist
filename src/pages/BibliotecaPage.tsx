import { useState, useRef } from "react";
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
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";

const folders = [
  { name: "Clientes / PF", count: 0, icon: Folder },
  { name: "Clientes / PJ", count: 0, icon: Folder },
  { name: "Casos", count: 0, icon: Folder },
  { name: "Processos", count: 0, icon: Folder },
  { name: "Modelos", count: 0, icon: FileType },
  { name: "Vade Mecum (Privado)", count: 0, icon: FileText },
  { name: "Jurisprudência", count: 0, icon: FileText },
  { name: "Financeiro", count: 0, icon: File },
];

function getFileIcon(type: string | null) {
  const t = type?.toUpperCase();
  switch (t) {
    case "JPG":
    case "JPEG":
    case "PNG":
    case "WEBP":
    case "IMG":
      return <Image className="h-4 w-4 text-success" />;
    case "DOC":
    case "DOCX":
      return <FileType className="h-4 w-4 text-info" />;
    case "PDF":
      return <FileText className="h-4 w-4 text-destructive" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BibliotecaPage() {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { documents, loading, uploading, uploadDocument, deleteDocument, getDownloadUrl } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async (doc: Document) => {
    const url = await getDownloadUrl(doc.file_path);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Biblioteca</h1>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.txt"
          />
          <Button
            size="sm"
            onClick={handleUploadClick}
            disabled={uploading || !user}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 text-xs"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploading ? "Enviando..." : "Upload"}
          </Button>
        </div>

        {!user && (
          <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
            Faça login para enviar e gerenciar seus documentos.
          </p>
        )}

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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {user ? "Nenhum documento ainda. Clique em Upload para começar." : "Faça login para ver seus documentos."}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                >
                  {getFileIcon(doc.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("pt-BR")} · {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}