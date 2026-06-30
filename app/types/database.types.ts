// Auto-generated types from Supabase
// Run: npx supabase gen types typescript --project-id yaozflybdoigbcibadsa > app/types/database.types.ts

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
