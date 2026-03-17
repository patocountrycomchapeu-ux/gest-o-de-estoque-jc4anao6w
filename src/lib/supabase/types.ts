// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      assets: {
        Row: {
          categoria: string | null
          condition: string | null
          current_quantity: number | null
          damaged_date: string | null
          damaged_user: string | null
          departamento: string | null
          id: string
          is_batch: boolean | null
          item: string | null
          marca: string | null
          patrimony_number: string | null
          photos: Json | null
          price: number | null
          secao: string | null
          status: string | null
          team_id: string | null
          tree_node_id: string | null
        }
        Insert: {
          categoria?: string | null
          condition?: string | null
          current_quantity?: number | null
          damaged_date?: string | null
          damaged_user?: string | null
          departamento?: string | null
          id: string
          is_batch?: boolean | null
          item?: string | null
          marca?: string | null
          patrimony_number?: string | null
          photos?: Json | null
          price?: number | null
          secao?: string | null
          status?: string | null
          team_id?: string | null
          tree_node_id?: string | null
        }
        Update: {
          categoria?: string | null
          condition?: string | null
          current_quantity?: number | null
          damaged_date?: string | null
          damaged_user?: string | null
          departamento?: string | null
          id?: string
          is_batch?: boolean | null
          item?: string | null
          marca?: string | null
          patrimony_number?: string | null
          photos?: Json | null
          price?: number | null
          secao?: string | null
          status?: string | null
          team_id?: string | null
          tree_node_id?: string | null
        }
        Relationships: []
      }
      checklists: {
        Row: {
          date: string | null
          discrepancies: number | null
          id: string
          leader_name: string | null
          team_id: string | null
        }
        Insert: {
          date?: string | null
          discrepancies?: number | null
          id: string
          leader_name?: string | null
          team_id?: string | null
        }
        Update: {
          date?: string | null
          discrepancies?: number | null
          id?: string
          leader_name?: string | null
          team_id?: string | null
        }
        Relationships: []
      }
      history: {
        Row: {
          asset_id: string | null
          description: string | null
          destination_responsible: string | null
          id: string
          origin_responsible: string | null
          quantity: number | null
          timestamp: string | null
          type: string | null
          user_name: string | null
        }
        Insert: {
          asset_id?: string | null
          description?: string | null
          destination_responsible?: string | null
          id: string
          origin_responsible?: string | null
          quantity?: number | null
          timestamp?: string | null
          type?: string | null
          user_name?: string | null
        }
        Update: {
          asset_id?: string | null
          description?: string | null
          destination_responsible?: string | null
          id?: string
          origin_responsible?: string | null
          quantity?: number | null
          timestamp?: string | null
          type?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'history_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
        ]
      }
      nodes: {
        Row: {
          id: string
          is_grouped: boolean | null
          level: string | null
          name: string | null
          parent_id: string | null
        }
        Insert: {
          id: string
          is_grouped?: boolean | null
          level?: string | null
          name?: string | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          is_grouped?: boolean | null
          level?: string | null
          name?: string | null
          parent_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          full_name: string
          id: string
          is_active: boolean
          preferred_theme: string | null
          role: string
          team_id: string | null
        }
        Insert: {
          email: string
          full_name: string
          id: string
          is_active?: boolean
          preferred_theme?: string | null
          role?: string
          team_id?: string | null
        }
        Update: {
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          preferred_theme?: string | null
          role?: string
          team_id?: string | null
        }
        Relationships: []
      }
      repairs: {
        Row: {
          asset_id: string | null
          condition_status: string | null
          cost: number | null
          description: string | null
          estimated_completion_date: string | null
          id: string
          is_sent: boolean | null
          location: string | null
          repair_date: string | null
          repair_user: string | null
        }
        Insert: {
          asset_id?: string | null
          condition_status?: string | null
          cost?: number | null
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          is_sent?: boolean | null
          location?: string | null
          repair_date?: string | null
          repair_user?: string | null
        }
        Update: {
          asset_id?: string | null
          condition_status?: string | null
          cost?: number | null
          description?: string | null
          estimated_completion_date?: string | null
          id?: string
          is_sent?: boolean | null
          location?: string | null
          repair_date?: string | null
          repair_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'repairs_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: true
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          description: string | null
          id: string
          location: string | null
          name: string | null
        }
        Insert: {
          description?: string | null
          id: string
          location?: string | null
          name?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          from_team_id: string | null
          id: string
          initiated_at: string | null
          initiated_by: string | null
          inventory_id: string | null
          status: string | null
          to_team_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          from_team_id?: string | null
          id: string
          initiated_at?: string | null
          initiated_by?: string | null
          inventory_id?: string | null
          status?: string | null
          to_team_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          from_team_id?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          inventory_id?: string | null
          status?: string | null
          to_team_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: assets
//   id: text (not null)
//   departamento: text (nullable)
//   secao: text (nullable)
//   categoria: text (nullable)
//   item: text (nullable)
//   marca: text (nullable)
//   tree_node_id: text (nullable)
//   patrimony_number: text (nullable)
//   is_batch: boolean (nullable, default: false)
//   current_quantity: integer (nullable, default: 1)
//   team_id: text (nullable)
//   condition: text (nullable, default: 'good'::text)
//   status: text (nullable, default: 'present'::text)
//   photos: jsonb (nullable, default: '[]'::jsonb)
//   price: numeric (nullable, default: 0)
//   damaged_date: timestamp with time zone (nullable)
//   damaged_user: text (nullable)
// Table: checklists
//   id: text (not null)
//   team_id: text (nullable)
//   date: timestamp with time zone (nullable)
//   leader_name: text (nullable)
//   discrepancies: integer (nullable)
// Table: history
//   id: text (not null)
//   asset_id: text (nullable)
//   origin_responsible: text (nullable)
//   destination_responsible: text (nullable)
//   quantity: integer (nullable, default: 1)
//   timestamp: timestamp with time zone (nullable, default: now())
//   type: text (nullable)
//   description: text (nullable)
//   user_name: text (nullable)
// Table: nodes
//   id: text (not null)
//   name: text (nullable)
//   level: text (nullable)
//   parent_id: text (nullable)
//   is_grouped: boolean (nullable, default: false)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   full_name: text (not null)
//   role: text (not null, default: 'Visualizador'::text)
//   is_active: boolean (not null, default: true)
//   preferred_theme: text (nullable, default: 'system'::text)
//   team_id: text (nullable)
// Table: repairs
//   id: text (not null, default: (gen_random_uuid())::text)
//   asset_id: text (nullable)
//   is_sent: boolean (nullable, default: false)
//   estimated_completion_date: timestamp with time zone (nullable)
//   condition_status: text (nullable)
//   cost: numeric (nullable, default: 0)
//   location: text (nullable)
//   description: text (nullable)
//   repair_user: text (nullable)
//   repair_date: timestamp with time zone (nullable)
// Table: teams
//   id: text (not null)
//   name: text (nullable)
//   description: text (nullable)
//   location: text (nullable)
// Table: transfers
//   id: text (not null)
//   inventory_id: text (nullable)
//   from_team_id: text (nullable)
//   to_team_id: text (nullable)
//   initiated_by: text (nullable)
//   initiated_at: timestamp with time zone (nullable)
//   status: text (nullable)
//   completed_at: timestamp with time zone (nullable)
//   completed_by: text (nullable)

// --- CONSTRAINTS ---
// Table: assets
//   PRIMARY KEY assets_pkey: PRIMARY KEY (id)
// Table: checklists
//   PRIMARY KEY checklists_pkey: PRIMARY KEY (id)
// Table: history
//   FOREIGN KEY history_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   PRIMARY KEY history_pkey: PRIMARY KEY (id)
// Table: nodes
//   PRIMARY KEY nodes_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: repairs
//   FOREIGN KEY repairs_asset_id_fkey: FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
//   UNIQUE repairs_asset_id_key: UNIQUE (asset_id)
//   PRIMARY KEY repairs_pkey: PRIMARY KEY (id)
// Table: teams
//   PRIMARY KEY teams_pkey: PRIMARY KEY (id)
// Table: transfers
//   PRIMARY KEY transfers_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: assets
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: checklists
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: history
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: nodes
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: profiles
//   Policy "Profiles read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Profiles update Gestor" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (( SELECT profiles_1.role    FROM profiles profiles_1   WHERE (profiles_1.id = auth.uid())) = 'Gestor'::text)
//     WITH CHECK: (( SELECT profiles_1.role    FROM profiles profiles_1   WHERE (profiles_1.id = auth.uid())) = 'Gestor'::text)
//   Policy "Profiles update Self" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
// Table: repairs
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: teams
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()
// Table: transfers
//   Policy "Allow read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow write" (ALL, PERMISSIVE) roles={authenticated}
//     USING: can_write()

// --- DATABASE FUNCTIONS ---
// FUNCTION can_write()
//   CREATE OR REPLACE FUNCTION public.can_write()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Gestor', 'Encarregado Gestor', 'Encarregado');
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, full_name, role, is_active)
//     VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'Visualizador', true);
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: repairs
//   CREATE UNIQUE INDEX repairs_asset_id_key ON public.repairs USING btree (asset_id)
