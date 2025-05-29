"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import type { Profile } from "@/types/profile"

type ProfileContextType = {
  profile: Profile
  updateProfile: (profile: Profile) => void
  isLoading: boolean
}

const defaultProfile: Profile = {
  name: "",
  title: "",
  company: "",
  email: "",
  phone: "",
  socials: {},
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Load profile from localStorage if not authenticated or from Supabase if authenticated
  useEffect(() => {
    const loadProfile = async () => {
      // Always try to load from localStorage first
      const savedProfile = localStorage.getItem("profile")
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setProfile(parsed)
        } catch (e) {
          console.error("Failed to parse profile from localStorage", e)
        }
      }

      // If user is authenticated, try to sync with database
      if (user?.id) {
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

          // Only update if we successfully got data from the database
          if (data && !error) {
            const loadedProfile = {
              name: data.name || "",
              title: data.title || "",
              company: data.company || "",
              email: data.email || "",
              phone: data.phone || "",
              socials: data.socials || {},
              profilePicture: data.profile_picture || undefined,
            }
            setProfile(loadedProfile)
            // Update localStorage with database data
            localStorage.setItem("profile", JSON.stringify(loadedProfile))
          } else if (error) {
            console.log("Database not available, using localStorage mode:", error.message)
          }
        } catch (error) {
          console.log("Database error, using localStorage mode:", error)
        }
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [user?.id, supabase])

  const updateProfile = async (newProfile: Profile) => {
    setProfile(newProfile)
    // Always update localStorage
    localStorage.setItem("profile", JSON.stringify(newProfile))

    // Try to update database if user is authenticated
    if (user?.id) {
      try {
        const { error } = await supabase.from("profiles").upsert({
          user_id: user.id,
          name: newProfile.name,
          title: newProfile.title,
          company: newProfile.company,
          email: newProfile.email,
          phone: newProfile.phone,
          socials: newProfile.socials,
          profile_picture: newProfile.profilePicture,
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.log("Database update failed, data saved locally:", error.message)
        }
      } catch (error) {
        console.log("Database error during update, data saved locally:", error)
      }
    }
  }

  return <ProfileContext.Provider value={{ profile, updateProfile, isLoading }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
