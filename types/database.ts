export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          title: string | null
          company: string | null
          email: string | null
          phone: string | null
          profile_picture: string | null
          socials: Record<string, string> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          profile_picture?: string | null
          socials?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          profile_picture?: string | null
          socials?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          title: string | null
          company: string | null
          email: string | null
          phone: string | null
          notes: string | null
          met_at: string | null
          date: string
          socials: Record<string, string> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          met_at?: string | null
          date: string
          socials?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          met_at?: string | null
          date?: string
          socials?: Record<string, string> | null
          created_at?: string
          updated_at?: string
        }
      }
      qr_settings: {
        Row: {
          id: string
          user_id: string
          bg_color: string
          fg_color: string
          page_background_color: string
          card_background_color: string
          text_color: string
          show_name: boolean
          show_title: boolean
          show_company: boolean
          show_contact: boolean
          show_socials: boolean
          show_profile_picture: boolean
          layout_style: string
          qr_size: number
          border_radius: number
          card_padding: number
          font_family: string
          font_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bg_color?: string
          fg_color?: string
          page_background_color?: string
          card_background_color?: string
          text_color?: string
          show_name?: boolean
          show_title?: boolean
          show_company?: boolean
          show_contact?: boolean
          show_socials?: boolean
          show_profile_picture?: boolean
          layout_style?: string
          qr_size?: number
          border_radius?: number
          card_padding?: number
          font_family?: string
          font_size?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bg_color?: string
          fg_color?: string
          page_background_color?: string
          card_background_color?: string
          text_color?: string
          show_name?: boolean
          show_title?: boolean
          show_company?: boolean
          show_contact?: boolean
          show_socials?: boolean
          show_profile_picture?: boolean
          layout_style?: string
          qr_size?: number
          border_radius?: number
          card_padding?: number
          font_family?: string
          font_size?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
