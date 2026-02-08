import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Process {
  id: string;
  user_id: string;
  case_id: string | null;
  cnj: string;
  court: string | null;
  judge: string | null;
  subject: string | null;
  status: string;
  distribution_date: string | null;
  last_movement: string | null;
  last_movement_date: string | null;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProcessInsert = Omit<Process, "id" | "user_id" | "created_at" | "updated_at">;

export function useProcesses() {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProcesses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("processes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProcesses(data as Process[] || []);
    } catch (error) {
      console.error("Error fetching processes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, [user]);

  const addProcess = async (process: ProcessInsert) => {
    if (!user) {
      toast.error("Faça login primeiro");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("processes")
        .insert({ ...process, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Processo cadastrado!");
      await fetchProcesses();
      return data as Process;
    } catch (error: any) {
      console.error("Error adding process:", error);
      toast.error(error.message || "Erro ao cadastrar processo");
      return null;
    }
  };

  const updateProcess = async (id: string, updates: Partial<ProcessInsert>) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Processo atualizado!");
      await fetchProcesses();
    } catch (error: any) {
      console.error("Error updating process:", error);
      toast.error(error.message || "Erro ao atualizar processo");
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("processes")
        .update({ is_favorite: !isFavorite })
        .eq("id", id);

      if (error) throw error;
      await fetchProcesses();
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
    }
  };

  const deleteProcess = async (id: string) => {
    try {
      const { error } = await supabase
        .from("processes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Processo excluído");
      await fetchProcesses();
    } catch (error: any) {
      console.error("Error deleting process:", error);
      toast.error(error.message || "Erro ao excluir processo");
    }
  };

  const getFavorites = () => processes.filter(p => p.is_favorite);

  const getByStatus = (status: string) => processes.filter(p => p.status === status);

  return {
    processes,
    loading,
    addProcess,
    updateProcess,
    toggleFavorite,
    deleteProcess,
    getFavorites,
    getByStatus,
    refresh: fetchProcesses,
  };
}
