import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  folder: string | null;
  created_at: string;
  is_knowledge_base?: boolean;
  content_text?: string | null;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const extractPdfContent = async (documentId: string, filePath: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ documentId, filePath }),
        }
      );

      if (!response.ok) {
        console.error("Failed to extract PDF content");
        return false;
      }

      const result = await response.json();
      console.log("PDF extraction result:", result);
      return result.success;
    } catch (error) {
      console.error("Extract PDF error:", error);
      return false;
    }
  };

  const uploadDocument = async (file: File, folder: string = "Geral", isKnowledgeBase: boolean = false) => {
    if (!user) {
      toast.error("Faça login para enviar documentos");
      return null;
    }

    // Check file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo: 500MB");
      return null;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          name: file.name,
          file_path: fileName,
          file_type: fileExt?.toUpperCase() || "FILE",
          file_size: file.size,
          folder,
          is_knowledge_base: isKnowledgeBase,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // If it's a knowledge base document, extract text content
      if (isKnowledgeBase && data) {
        toast.info("Extraindo conteúdo do documento...");
        await extractPdfContent(data.id, fileName);
        toast.success("Documento adicionado à base de conhecimento!");
      } else {
        toast.success("Documento enviado com sucesso!");
      }

      await fetchDocuments();
      return data;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Erro ao enviar documento");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast.success("Documento excluído");
      await fetchDocuments();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Erro ao excluir documento");
    }
  };

  const getDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl;
  };

  const getKnowledgeBaseDocs = () => {
    return documents.filter(d => d.is_knowledge_base);
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    getDownloadUrl,
    getKnowledgeBaseDocs,
    refresh: fetchDocuments,
  };
}