import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DocumentTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  content: string;
  variables: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type TemplateInsert = Omit<DocumentTemplate, "id" | "user_id" | "created_at" | "updated_at">;

export function useDocumentTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates(data as DocumentTemplate[] || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const addTemplate = async (template: TemplateInsert) => {
    if (!user) {
      toast.error("Faça login primeiro");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("document_templates")
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Modelo salvo!");
      await fetchTemplates();
      return data as DocumentTemplate;
    } catch (error: any) {
      console.error("Error adding template:", error);
      toast.error(error.message || "Erro ao salvar modelo");
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<TemplateInsert>) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Modelo atualizado!");
      await fetchTemplates();
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error.message || "Erro ao atualizar modelo");
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Modelo excluído");
      await fetchTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.message || "Erro ao excluir modelo");
    }
  };

  // Fill template with variables
  const fillTemplate = (template: DocumentTemplate, values: Record<string, string>) => {
    let content = template.content;
    for (const [key, value] of Object.entries(values)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return content;
  };

  // Extract variables from template content
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/{{(\w+)}}/g) || [];
    return [...new Set(matches.map(m => m.replace(/{{|}}/g, '')))];
  };

  const getByCategory = (category: string) => templates.filter(t => t.category === category);

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    fillTemplate,
    extractVariables,
    getByCategory,
    refresh: fetchTemplates,
  };
}
