import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Download, FileText, Loader2 } from "lucide-react";
import { Document } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentViewer({ document, open, onOpenChange }: DocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && document && !document.content_text) {
      loadFileUrl();
    }
  }, [open, document]);

  const loadFileUrl = async () => {
    if (!document) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.file_path, 3600);
      
      if (data?.signedUrl) {
        setFileUrl(data.signedUrl);
      }
    } catch (err) {
      setError("Erro ao carregar documento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const isPdf = document?.file_type?.toUpperCase() === "PDF";
  const isImage = ["JPG", "JPEG", "PNG", "WEBP", "GIF"].includes(
    document?.file_type?.toUpperCase() || ""
  );
  const hasTextContent = !!document?.content_text;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-5 w-5 text-primary" />
            <span className="truncate">{document?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={loadFileUrl}>
                Tentar novamente
              </Button>
            </div>
          ) : hasTextContent ? (
            <ScrollArea className="h-full rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {document?.content_text}
              </pre>
            </ScrollArea>
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg border"
              title={document?.name}
            />
          ) : isImage && fileUrl ? (
            <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg border">
              <img
                src={fileUrl}
                alt={document?.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : fileUrl ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Visualização não disponível para este tipo de arquivo.
              </p>
              <Button onClick={openInNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          {fileUrl && (
            <>
              <Button variant="outline" onClick={openInNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir externamente
              </Button>
              <Button asChild className="gap-2">
                <a href={fileUrl} download={document?.name}>
                  <Download className="h-4 w-4" />
                  Baixar
                </a>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
