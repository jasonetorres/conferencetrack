"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import type { Contact } from "@/types/contact"

type ContactsContextType = {
  contacts: Contact[]
  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void
  isLoading: boolean
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Load contacts from localStorage if not authenticated or from Supabase if authenticated
  useEffect(() => {
    const loadContacts = async () => {
      // Always try to load from localStorage first
      const savedContacts = localStorage.getItem("contacts")
      if (savedContacts) {
        try {
          const parsed = JSON.parse(savedContacts)
          setContacts(parsed)
        } catch (e) {
          console.error("Failed to parse contacts from localStorage", e)
        }
      }

      // If user is authenticated, try to sync with database
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          // Only update if we successfully got data from the database
          if (data && !error) {
            const formattedContacts: Contact[] = data.map((contact) => ({
              id: contact.id,
              name: contact.name,
              title: contact.title || undefined,
              company: contact.company || undefined,
              email: contact.email || undefined,
              phone: contact.phone || undefined,
              notes: contact.notes || undefined,
              metAt: contact.met_at || undefined,
              date: contact.date,
              socials: contact.socials || undefined,
            }))
            setContacts(formattedContacts)
            // Update localStorage with database data
            localStorage.setItem("contacts", JSON.stringify(formattedContacts))
          } else if (error) {
            console.log("Database not available, using localStorage mode:", error.message)
          }
        } catch (error) {
          console.log("Database error, using localStorage mode:", error)
        }
      }

      setIsLoading(false)
    }

    loadContacts()
  }, [user?.id, supabase])

  const addContact = async (contact: Contact) => {
    const updatedContacts = [contact, ...contacts]
    setContacts(updatedContacts)
    // Always update localStorage
    localStorage.setItem("contacts", JSON.stringify(updatedContacts))

    // Try to update database if user is authenticated
    if (user?.id) {
      try {
        const { error } = await supabase.from("contacts").insert({
          id: contact.id,
          user_id: user.id,
          name: contact.name,
          title: contact.title,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
          met_at: contact.metAt,
          date: contact.date,
          socials: contact.socials,
        })

        if (error) {
          console.log("Database insert failed, data saved locally:", error.message)
        }
      } catch (error) {
        console.log("Database error during insert, data saved locally:", error)
      }
    }
  }

  const updateContact = async (updatedContact: Contact) => {
    const updatedContacts = contacts.map((contact) => (contact.id === updatedContact.id ? updatedContact : contact))
    setContacts(updatedContacts)
    // Always update localStorage
    localStorage.setItem("contacts", JSON.stringify(updatedContacts))

    // Try to update database if user is authenticated
    if (user?.id) {
      try {
        const { error } = await supabase
          .from("contacts")
          .update({
            name: updatedContact.name,
            title: updatedContact.title,
            company: updatedContact.company,
            email: updatedContact.email,
            phone: updatedContact.phone,
            notes: updatedContact.notes,
            met_at: updatedContact.metAt,
            date: updatedContact.date,
            socials: updatedContact.socials,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedContact.id)
          .eq("user_id", user.id)

        if (error) {
          console.log("Database update failed, data saved locally:", error.message)
        }
      } catch (error) {
        console.log("Database error during update, data saved locally:", error)
      }
    }
  }

  const deleteContact = async (id: string) => {
    const updatedContacts = contacts.filter((contact) => contact.id !== id)
    setContacts(updatedContacts)
    // Always update localStorage
    localStorage.setItem("contacts", JSON.stringify(updatedContacts))

    // Try to update database if user is authenticated
    if (user?.id) {
      try {
        const { error } = await supabase.from("contacts").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.log("Database delete failed, data removed locally:", error.message)
        }
      } catch (error) {
        console.log("Database error during delete, data removed locally:", error)
      }
    }
  }

  return (
    <ContactsContext.Provider value={{ contacts, addContact, updateContact, deleteContact, isLoading }}>
      {children}
    </ContactsContext.Provider>
  )
}

export function useContacts() {
  const context = useContext(ContactsContext)
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider")
  }
  return context
}
