import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  type: "pessoa_fisica" | "pessoa_juridica";
  name: string;
  document_number: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Omit<Client, "id" | "user_id" | "created_at" | "updated_at">;

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) throw error;
      setClients(data as Client[] || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const addClient = async (client: ClientInsert) => {
    if (!user) {
      toast.error("Faça login primeiro");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Cliente cadastrado!");
      await fetchClients();
      return data as Client;
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast.error(error.message || "Erro ao cadastrar cliente");
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<ClientInsert>) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Cliente atualizado!");
      await fetchClients();
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast.error(error.message || "Erro ao atualizar cliente");
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Cliente excluído");
      await fetchClients();
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast.error(error.message || "Erro ao excluir cliente");
    }
  };

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refresh: fetchClients,
  };
}
