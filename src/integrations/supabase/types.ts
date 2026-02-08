export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          area: string | null
          case_number: string | null
          client_id: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          opened_at: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          area?: string | null
          case_number?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opened_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          area?: string | null
          case_number?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opened_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          document_number: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          type: Database["public"]["Enums"]["client_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          document_number?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          document_number?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["client_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          case_id: string | null
          completed_at: string | null
          created_at: string
          deadline_date: string
          deadline_time: string | null
          description: string | null
          id: string
          notified: boolean | null
          priority: string | null
          process_id: string | null
          reminder_days: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_date: string
          deadline_time?: string | null
          description?: string | null
          id?: string
          notified?: boolean | null
          priority?: string | null
          process_id?: string | null
          reminder_days?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline_date?: string
          deadline_time?: string | null
          description?: string | null
          id?: string
          notified?: boolean | null
          priority?: string | null
          process_id?: string | null
          reminder_days?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_text: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder: string | null
          id: string
          is_knowledge_base: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_knowledge_base?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder?: string | null
          id?: string
          is_knowledge_base?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      processes: {
        Row: {
          case_id: string | null
          cnj: string
          court: string | null
          created_at: string
          distribution_date: string | null
          id: string
          is_favorite: boolean | null
          judge: string | null
          last_movement: string | null
          last_movement_date: string | null
          notes: string | null
          status: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          cnj: string
          court?: string | null
          created_at?: string
          distribution_date?: string | null
          id?: string
          is_favorite?: boolean | null
          judge?: string | null
          last_movement?: string | null
          last_movement_date?: string | null
          notes?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          cnj?: string
          court?: string | null
          created_at?: string
          distribution_date?: string | null
          id?: string
          is_favorite?: boolean | null
          judge?: string | null
          last_movement?: string | null
          last_movement_date?: string | null
          notes?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          full_name: string
          id: string
          oab_number: string | null
          preferences: Json | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          oab_number?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          oab_number?: string | null
          preferences?: Json | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_type: "pessoa_fisica" | "pessoa_juridica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_type: ["pessoa_fisica", "pessoa_juridica"],
    },
  },
} as const
