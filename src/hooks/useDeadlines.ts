import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Deadline {
  id: string;
  user_id: string;
  process_id: string | null;
  case_id: string | null;
  title: string;
  description: string | null;
  deadline_date: string;
  deadline_time: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pendente" | "concluido" | "cancelado";
  reminder_days: number;
  notified: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DeadlineInsert = Omit<Deadline, "id" | "user_id" | "created_at" | "updated_at" | "notified" | "completed_at">;

export function useDeadlines() {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("deadlines")
        .select("*")
        .order("deadline_date");

      if (error) throw error;
      setDeadlines(data as Deadline[] || []);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, [user]);

  const addDeadline = async (deadline: DeadlineInsert) => {
    if (!user) {
      toast.error("Faça login primeiro");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("deadlines")
        .insert({ ...deadline, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Prazo cadastrado!");
      await fetchDeadlines();
      return data as Deadline;
    } catch (error: any) {
      console.error("Error adding deadline:", error);
      toast.error(error.message || "Erro ao cadastrar prazo");
      return null;
    }
  };

  const updateDeadline = async (id: string, updates: Partial<DeadlineInsert>) => {
    try {
      const { error } = await supabase
        .from("deadlines")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Prazo atualizado!");
      await fetchDeadlines();
    } catch (error: any) {
      console.error("Error updating deadline:", error);
      toast.error(error.message || "Erro ao atualizar prazo");
    }
  };

  const completeDeadline = async (id: string) => {
    try {
      const { error } = await supabase
        .from("deadlines")
        .update({ 
          status: "concluido", 
          completed_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Prazo concluído!");
      await fetchDeadlines();
    } catch (error: any) {
      console.error("Error completing deadline:", error);
      toast.error(error.message || "Erro ao concluir prazo");
    }
  };

  const deleteDeadline = async (id: string) => {
    try {
      const { error } = await supabase
        .from("deadlines")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Prazo excluído");
      await fetchDeadlines();
    } catch (error: any) {
      console.error("Error deleting deadline:", error);
      toast.error(error.message || "Erro ao excluir prazo");
    }
  };

  // Get upcoming deadlines (next 7 days)
  const getUpcoming = () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return deadlines.filter(d => {
      if (d.status !== "pendente") return false;
      const date = new Date(d.deadline_date);
      return date >= now && date <= weekFromNow;
    });
  };

  // Get overdue deadlines
  const getOverdue = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return deadlines.filter(d => {
      if (d.status !== "pendente") return false;
      const date = new Date(d.deadline_date);
      return date < now;
    });
  };

  return {
    deadlines,
    loading,
    addDeadline,
    updateDeadline,
    completeDeadline,
    deleteDeadline,
    getUpcoming,
    getOverdue,
    refresh: fetchDeadlines,
  };
}
