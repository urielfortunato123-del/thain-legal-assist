import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Folder {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

const DEFAULT_FOLDERS = [
  { name: "Banco de Dados", icon: "database" },
  { name: "Clientes / PF", icon: "folder" },
  { name: "Clientes / PJ", icon: "folder" },
  { name: "Casos", icon: "folder" },
  { name: "Processos", icon: "folder" },
  { name: "Modelos", icon: "file-type" },
  { name: "Vade Mecum (Privado)", icon: "file-text" },
  { name: "Jurisprudência", icon: "file-text" },
  { name: "Financeiro", icon: "file" },
];

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // If no folders exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultFolders();
      } else {
        setFolders(data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultFolders = async () => {
    if (!user) return;

    try {
      const foldersToInsert = DEFAULT_FOLDERS.map((f) => ({
        user_id: user.id,
        name: f.name,
        icon: f.icon,
      }));

      const { data, error } = await supabase
        .from("folders")
        .insert(foldersToInsert)
        .select();

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error("Error creating default folders:", error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  const createFolder = async (name: string, icon: string = "folder") => {
    if (!user) {
      toast.error("Faça login para criar pastas");
      return null;
    }

    if (!name.trim()) {
      toast.error("Nome da pasta é obrigatório");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          name: name.trim(),
          icon,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Pasta criada!");
      await fetchFolders();
      return data;
    } catch (error: any) {
      console.error("Create folder error:", error);
      toast.error(error.message || "Erro ao criar pasta");
      return null;
    }
  };

  const updateFolder = async (id: string, name: string) => {
    if (!name.trim()) {
      toast.error("Nome da pasta é obrigatório");
      return false;
    }

    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: name.trim() })
        .eq("id", id);

      if (error) throw error;

      toast.success("Pasta atualizada!");
      await fetchFolders();
      return true;
    } catch (error: any) {
      console.error("Update folder error:", error);
      toast.error(error.message || "Erro ao atualizar pasta");
      return false;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Pasta excluída!");
      await fetchFolders();
      return true;
    } catch (error: any) {
      console.error("Delete folder error:", error);
      toast.error(error.message || "Erro ao excluir pasta");
      return false;
    }
  };

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    refresh: fetchFolders,
  };
}
