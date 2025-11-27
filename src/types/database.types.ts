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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string | null
          id: string
          job_posting_id: string
          message: string | null
          resume_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_posting_id: string
          message?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_posting_id?: string
          message?: string | null
          resume_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centers_region_fkey"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
        ]
      }
      employment_types: {
        Row: {
          code: string
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      experience_levels: {
        Row: {
          code: string
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      job_categories: {
        Row: {
          code: string
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          categories: string[]
          center_id: string
          created_at: string | null
          deadline: string | null
          description: string | null
          employment_type: string
          experience_level: string
          gender: string | null
          id: string
          is_active: boolean | null
          region: string
          salary_max: number | null
          salary_min: number | null
          salary_type: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          categories?: string[]
          center_id: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          employment_type: string
          experience_level: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          region: string
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          categories?: string[]
          center_id?: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          employment_type?: string
          experience_level?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          region?: string
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_employment_type_fkey"
            columns: ["employment_type"]
            isOneToOne: false
            referencedRelation: "employment_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_postings_experience_level_fkey"
            columns: ["experience_level"]
            isOneToOne: false
            referencedRelation: "experience_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_postings_region_fkey"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          job_posting_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_posting_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_posting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string
          name: string
          sort_order: number | null
        }
        Insert: {
          code: string
          name: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          birth_year: number | null
          career_history: Json | null
          categories: string[]
          certifications: string[] | null
          created_at: string | null
          education: Json | null
          experience_level: string | null
          gender: string | null
          id: string
          introduction: string | null
          is_primary: boolean | null
          is_public: boolean | null
          region: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_year?: number | null
          career_history?: Json | null
          categories?: string[]
          certifications?: string[] | null
          created_at?: string | null
          education?: Json | null
          experience_level?: string | null
          gender?: string | null
          id?: string
          introduction?: string | null
          is_primary?: boolean | null
          is_public?: boolean | null
          region?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_year?: number | null
          career_history?: Json | null
          categories?: string[]
          certifications?: string[] | null
          created_at?: string | null
          education?: Json | null
          experience_level?: string | null
          gender?: string | null
          id?: string
          introduction?: string | null
          is_primary?: boolean | null
          is_public?: boolean | null
          region?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_experience_level_fkey"
            columns: ["experience_level"]
            isOneToOne: false
            referencedRelation: "experience_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "resumes_region_fkey"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      job_postings_with_details: {
        Row: {
          application_count: number | null
          categories: string[] | null
          center_id: string | null
          center_logo: string | null
          center_name: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          employment_type: string | null
          employment_type_name: string | null
          experience_level: string | null
          experience_level_name: string | null
          gender: string | null
          id: string | null
          is_active: boolean | null
          like_count: number | null
          region: string | null
          region_name: string | null
          salary_max: number | null
          salary_min: number | null
          salary_type: string | null
          title: string | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_employment_type_fkey"
            columns: ["employment_type"]
            isOneToOne: false
            referencedRelation: "employment_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_postings_experience_level_fkey"
            columns: ["experience_level"]
            isOneToOne: false
            referencedRelation: "experience_levels"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "job_postings_region_fkey"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
