import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Ensure we have default values for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we're in the browser and if the URL is available
const isBrowser = typeof window !== "undefined"

// Create a singleton instance to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials are missing. Using localStorage-only mode.")

    // Return a mock client for development/preview when credentials are missing
    return createMockSupabaseClient()
  }

  // Create a new client if one doesn't exist
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Mock Supabase client that always returns errors (forcing localStorage fallback)
function createMockSupabaseClient() {
  const mockError = { code: "MOCK_ERROR", message: "Using localStorage mode" }

  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: mockError }),
      insert: () => Promise.resolve({ data: null, error: mockError }),
      update: () => Promise.resolve({ data: null, error: mockError }),
      delete: () => Promise.resolve({ data: null, error: mockError }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: mockError }),
        order: () => Promise.resolve({ data: null, error: mockError }),
      }),
      single: () => Promise.resolve({ data: null, error: mockError }),
      order: () => Promise.resolve({ data: null, error: mockError }),
      upsert: () => Promise.resolve({ data: null, error: mockError }),
    }),
  } as any
}

// Export the supabase client
export const supabase = getSupabaseClient()
