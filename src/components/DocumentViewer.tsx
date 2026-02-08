import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Download, FileText, Loader2, Search, ChevronUp, ChevronDown, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && document && !document.content_text) {
      loadFileUrl();
    }
    // Reset search when document changes
    setSearchQuery("");
    setCurrentMatch(0);
    setMatchCount(0);
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

  // Highlight and count matches
  const highlightedContent = useMemo(() => {
    if (!document?.content_text || !searchQuery.trim()) {
      return document?.content_text || "";
    }

    const query = searchQuery.trim().toLowerCase();
    const text = document.content_text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = text.match(regex);
    
    setMatchCount(matches?.length || 0);
    
    if (!matches?.length) {
      return text;
    }

    let matchIndex = 0;
    return text.replace(regex, (match) => {
      const isCurrent = matchIndex === currentMatch;
      matchIndex++;
      return `<mark class="${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-yellow-300 text-black'}">${match}</mark>`;
    });
  }, [document?.content_text, searchQuery, currentMatch]);

  // Navigate to current match
  useEffect(() => {
    if (matchCount > 0 && contentRef.current) {
      const marks = contentRef.current.querySelectorAll('mark');
      const currentMark = marks[currentMatch];
      if (currentMark) {
        currentMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatch, matchCount, highlightedContent]);

  const goToNextMatch = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev + 1) % matchCount);
    }
  };

  const goToPrevMatch = () => {
    if (matchCount > 0) {
      setCurrentMatch((prev) => (prev - 1 + matchCount) % matchCount);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentMatch(0);
    setMatchCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        goToPrevMatch();
      } else {
        goToNextMatch();
      }
    }
    if (e.key === 'Escape') {
      clearSearch();
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

        {/* Search bar for text content */}
        {hasTextContent && (
          <div className="flex items-center gap-2 py-2 px-1 border-b flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no documento... (Enter = próximo, Shift+Enter = anterior)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentMatch(0);
                }}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-20 text-sm"
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "0 resultados"}
                  </span>
                  <button onClick={clearSearch} className="p-1 hover:bg-muted rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {matchCount > 0 && (
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevMatch}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextMatch}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

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
              <div 
                ref={contentRef}
                className="whitespace-pre-wrap text-sm font-mono leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
              />
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
