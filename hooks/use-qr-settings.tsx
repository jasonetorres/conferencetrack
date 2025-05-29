"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import type { QrSettings } from "@/types/qr-settings"

type QrSettingsContextType = {
  qrSettings: QrSettings
  updateQrSettings: (settings: Partial<QrSettings>) => void
  isLoading: boolean
}

const defaultQrSettings: QrSettings = {
  bgColor: "#FFFFFF",
  fgColor: "#000000",
  pageBackgroundColor: "#FFFFFF",
  cardBackgroundColor: "#FFFFFF",
  textColor: "#000000",
  showName: true,
  showTitle: true,
  showCompany: true,
  showContact: true,
  showSocials: true,
  showProfilePicture: true,
  layoutStyle: "card",
  qrSize: 220,
  borderRadius: 12,
  cardPadding: 24,
  fontFamily: "Inter",
  fontSize: 14,
}

const QrSettingsContext = createContext<QrSettingsContextType | undefined>(undefined)

export function QrSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [qrSettings, setQrSettings] = useState<QrSettings>(defaultQrSettings)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Load QR settings from localStorage if not authenticated or from Supabase if authenticated
  useEffect(() => {
    const loadQrSettings = async () => {
      // Always try to load from localStorage first
      const savedSettings = localStorage.getItem("qrSettings")
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          // Merge with defaults to ensure all new properties are included
          setQrSettings({ ...defaultQrSettings, ...parsed })
        } catch (e) {
          console.error("Failed to parse QR settings from localStorage", e)
        }
      }

      // If user is authenticated, try to sync with database
      if (user?.id) {
        try {
          const { data, error } = await supabase.from("qr_settings").select("*").eq("user_id", user.id).single()

          // Only update if we successfully got data from the database
          if (data && !error) {
            const loadedSettings = {
              bgColor: data.bg_color,
              fgColor: data.fg_color,
              pageBackgroundColor: data.page_background_color,
              cardBackgroundColor: data.card_background_color,
              textColor: data.text_color,
              showName: data.show_name,
              showTitle: data.show_title,
              showCompany: data.show_company,
              showContact: data.show_contact,
              showSocials: data.show_socials,
              showProfilePicture: data.show_profile_picture,
              layoutStyle: data.layout_style as any,
              qrSize: data.qr_size,
              borderRadius: data.border_radius,
              cardPadding: data.card_padding,
              fontFamily: data.font_family,
              fontSize: data.font_size,
            }
            setQrSettings(loadedSettings)
            // Update localStorage with database data
            localStorage.setItem("qrSettings", JSON.stringify(loadedSettings))
          } else if (error) {
            console.log("Database not available, using localStorage mode:", error.message)
          }
        } catch (error) {
          console.log("Database error, using localStorage mode:", error)
        }
      }

      setIsLoading(false)
    }

    loadQrSettings()
  }, [user?.id, supabase])

  const updateQrSettings = async (settings: Partial<QrSettings>) => {
    const newSettings = { ...qrSettings, ...settings }
    setQrSettings(newSettings)
    // Always update localStorage
    localStorage.setItem("qrSettings", JSON.stringify(newSettings))

    // Try to update database if user is authenticated
    if (user?.id) {
      try {
        const { error } = await supabase.from("qr_settings").upsert({
          user_id: user.id,
          bg_color: newSettings.bgColor,
          fg_color: newSettings.fgColor,
          page_background_color: newSettings.pageBackgroundColor,
          card_background_color: newSettings.cardBackgroundColor,
          text_color: newSettings.textColor,
          show_name: newSettings.showName,
          show_title: newSettings.showTitle,
          show_company: newSettings.showCompany,
          show_contact: newSettings.showContact,
          show_socials: newSettings.showSocials,
          show_profile_picture: newSettings.showProfilePicture,
          layout_style: newSettings.layoutStyle,
          qr_size: newSettings.qrSize,
          border_radius: newSettings.borderRadius,
          card_padding: newSettings.cardPadding,
          font_family: newSettings.fontFamily,
          font_size: newSettings.fontSize,
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.log("Database update failed, settings saved locally:", error.message)
        }
      } catch (error) {
        console.log("Database error during update, settings saved locally:", error)
      }
    }
  }

  return (
    <QrSettingsContext.Provider value={{ qrSettings, updateQrSettings, isLoading }}>
      {children}
    </QrSettingsContext.Provider>
  )
}

export function useQrSettings() {
  const context = useContext(QrSettingsContext)
  if (context === undefined) {
    throw new Error("useQrSettings must be used within a QrSettingsProvider")
  }
  return context
}
