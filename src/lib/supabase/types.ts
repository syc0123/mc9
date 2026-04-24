export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          dynmap_url: string
          tile_path_pattern: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          dynmap_url: string
          tile_path_pattern?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          dynmap_url?: string
          tile_path_pattern?: string | null
          owner_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          workspace_id: string
          user_id: string
          role: 'admin' | 'member'
          invited_at: string
          joined_at: string | null
        }
        Insert: {
          workspace_id: string
          user_id: string
          role: 'admin' | 'member'
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          role?: 'admin' | 'member'
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          }
        ]
      }
      workspace_invites: {
        Row: {
          id: string
          workspace_id: string
          token_hash: string
          invited_by: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          token_hash: string
          invited_by: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          used_at?: string | null
        }
        Relationships: []
      }
      markers: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          title: string
          description: string | null
          lat: number
          lng: number
          color: string
          icon: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          title: string
          description?: string | null
          lat: number
          lng: number
          color?: string
          icon?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          lat?: number
          lng?: number
          color?: string
          icon?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'markers_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
