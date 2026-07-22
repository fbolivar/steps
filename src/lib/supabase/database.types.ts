export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          active_leads_count: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_accepting_leads: boolean
          tenant_id: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          active_leads_count?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_accepting_leads?: boolean
          tenant_id: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          active_leads_count?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_accepting_leads?: boolean
          tenant_id?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_lines: {
        Row: {
          body_mdx: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          segment: Database["public"]["Enums"]["insurance_segment"]
          short_description: string | null
          slug: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          body_mdx?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          segment: Database["public"]["Enums"]["insurance_segment"]
          short_description?: string | null
          slug: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          body_mdx?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          segment?: Database["public"]["Enums"]["insurance_segment"]
          short_description?: string | null
          slug?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          assigned_agent_id: string | null
          consent_data_processing: boolean
          consent_timestamp: string | null
          contact_document: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          insurance_line_id: string | null
          provider: string | null
          provider_reference: string | null
          quote_result: Json | null
          risk_payload: Json
          segment: Database["public"]["Enums"]["insurance_segment"] | null
          source: string
          status: Database["public"]["Enums"]["quote_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          consent_data_processing?: boolean
          consent_timestamp?: string | null
          contact_document?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          insurance_line_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          quote_result?: Json | null
          risk_payload?: Json
          segment?: Database["public"]["Enums"]["insurance_segment"] | null
          source?: string
          status?: Database["public"]["Enums"]["quote_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          consent_data_processing?: boolean
          consent_timestamp?: string | null
          contact_document?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          insurance_line_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          quote_result?: Json | null
          risk_payload?: Json
          segment?: Database["public"]["Enums"]["insurance_segment"] | null
          source?: string
          status?: Database["public"]["Enums"]["quote_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_insurance_line_id_fkey"
            columns: ["insurance_line_id"]
            isOneToOne: false
            referencedRelation: "insurance_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          color_accent: string
          color_primary: string
          color_secondary: string
          contact_email: string | null
          created_at: string
          custom_domain: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          nit: string | null
          nombre_comercial: string
          razon_social: string | null
          slug: string
          subdomain: string | null
          updated_at: string
          uses_shared_quote_engine: boolean
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          contact_email?: string | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          nit?: string | null
          nombre_comercial: string
          razon_social?: string | null
          slug: string
          subdomain?: string | null
          updated_at?: string
          uses_shared_quote_engine?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          contact_email?: string | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          nit?: string | null
          nombre_comercial?: string
          razon_social?: string | null
          slug?: string
          subdomain?: string | null
          updated_at?: string
          uses_shared_quote_engine?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_tenant_access: { Args: { p_tenant: string }; Returns: boolean }
      has_tenant_role: {
        Args: {
          p_roles: Database["public"]["Enums"]["app_role"][]
          p_tenant: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      update_tenant_branding: {
        Args: {
          p_tenant_id: string
          p_nombre_comercial: string
          p_whatsapp_number: string
          p_contact_email: string
          p_color_primary: string
          p_color_secondary: string
          p_color_accent: string
          p_is_active: boolean
          p_subdomain: string
          p_custom_domain: string
        }
        Returns: undefined
      }
      submit_quote_request: {
        Args: {
          p_consent: boolean
          p_contact_document: string
          p_contact_email: string
          p_contact_name: string
          p_contact_phone: string
          p_insurance_line_slug: string
          p_risk_payload: Json
          p_segment: Database["public"]["Enums"]["insurance_segment"]
          p_tenant_slug: string
          p_ts: number
          p_sig: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "super_admin" | "tenant_admin" | "agente" | "editor_contenido"
      insurance_segment: "personas" | "empresas"
      quote_status:
        | "nueva"
        | "contactado"
        | "en_negociacion"
        | "emitida"
        | "perdida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]
