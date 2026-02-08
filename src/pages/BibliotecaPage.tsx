import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  File,
  Image,
  FileType,
  Trash2,
  Download,
  Loader2,
  Database,
  Brain,
  BookOpen,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { useFolders, Folder } from "@/hooks/useFolders";
import { useAuth } from "@/contexts/AuthContext";
import FolderManager from "@/components/FolderManager";
import DocumentViewer from "@/components/DocumentViewer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showFolderUpload, setShowFolderUpload] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const { user } = useAuth();
  const { documents, loading, uploading, uploadDocument, deleteDocument, getDownloadUrl } = useDocuments();
  const { folders, loading: foldersLoading } = useFolders();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowFolderUpload(true);
  };

  const handleFolderUploadClick = () => {
    folderFileInputRef.current?.click();
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

  const handleFolderFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedFolder) {
      const isKnowledgeBase = selectedFolder.name === "Banco de Dados";
      await uploadDocument(file, selectedFolder.name, isKnowledgeBase);
      if (folderFileInputRef.current) {
        folderFileInputRef.current.value = "";
      }
      setShowFolderUpload(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    const url = await getDownloadUrl(doc.file_path);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const [importingVademecum, setImportingVademecum] = useState(false);

  const handleImportVademecum = async () => {
    if (!user) {
      toast.error("Faça login primeiro");
      return;
    }

    setImportingVademecum(true);
    toast.info("Importando legislação do Planalto... Isso pode levar alguns segundos.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-vademecum`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const imported = data.results.filter((r: any) => r.status === "success").length;
        const existing = data.results.filter((r: any) => r.status === "already_exists").length;
        toast.success(`Vade Mecum importado! ${imported} novos, ${existing} já existiam.`);
        // Refresh documents
        window.location.reload();
      } else {
        toast.error(data.error || "Erro ao importar");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro ao importar Vade Mecum");
    } finally {
      setImportingVademecum(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  // Count documents per folder
  const documentCounts = documents.reduce((acc, doc) => {
    const folder = doc.folder || "Geral";
    acc[folder] = (acc[folder] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Biblioteca</h1>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.txt"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleImportVademecum}
              disabled={importingVademecum || !user}
              className="gap-1.5 text-xs"
            >
              {importingVademecum ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BookOpen className="h-3.5 w-3.5" />
              )}
              Vade Mecum
            </Button>
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
        {foldersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FolderManager 
            folders={folders} 
            documentCounts={documentCounts} 
            onFolderClick={handleFolderClick}
          />
        )}

        {/* Folder Upload Dialog */}
        <Dialog open={showFolderUpload} onOpenChange={setShowFolderUpload}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedFolder?.name === "Banco de Dados" && (
                  <Brain className="h-5 w-5 text-primary" />
                )}
                Upload para {selectedFolder?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedFolder?.name === "Banco de Dados" && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
                  <p className="font-medium text-primary flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Base de Conhecimento IA
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Documentos enviados aqui serão usados pela IA como fonte de pesquisa nas suas consultas.
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={folderFileInputRef}
                onChange={handleFolderFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              <Button
                onClick={handleFolderUploadClick}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? "Enviando..." : "Selecionar Arquivo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                  onClick={() => setViewingDoc(doc)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group cursor-pointer"
                >
                  {getFileIcon(doc.file_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      {doc.is_knowledge_base && (
                        <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("pt-BR")} · {formatFileSize(doc.file_size)}
                      {doc.folder && ` · ${doc.folder}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingDoc(doc); }}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteDocument(doc); }}
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

        {/* Document Viewer */}
        <DocumentViewer
          document={viewingDoc}
          open={!!viewingDoc}
          onOpenChange={(open) => !open && setViewingDoc(null)}
        />
      </div>
    </AppLayout>
  );
}