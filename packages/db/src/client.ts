/**
 * APE Supabase Client
 * Shared client configuration for web and mobile apps
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Environment variables (should be set in each app)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not set. Client will not function properly.')
}

/**
 * Create a typed Supabase client
 */
export function createClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

/**
 * Create a Supabase client with custom options
 */
export function createClientWithOptions(options: {
  supabaseUrl?: string
  supabaseKey?: string
  auth?: {
    autoRefreshToken?: boolean
    persistSession?: boolean
    storage?: {
      getItem: (key: string) => Promise<string | null> | string | null
      setItem: (key: string, value: string) => Promise<void> | void
      removeItem: (key: string) => Promise<void> | void
    }
  }
}) {
  const url = options.supabaseUrl || SUPABASE_URL
  const key = options.supabaseKey || SUPABASE_ANON_KEY

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: options.auth?.autoRefreshToken ?? true,
      persistSession: options.auth?.persistSession ?? true,
      detectSessionInUrl: true,
      storage: options.auth?.storage,
    },
  })
}

/**
 * Default client instance (for simple use cases)
 * Note: For SSR/RSC, create a new client per request
 */
export const supabase = createClient()

/**
 * Type-safe table accessor
 */
export function getTable<T extends keyof Database['public']['Tables']>(
  client: ReturnType<typeof createClient>,
  table: T
) {
  return client.from(table)
}

export type SupabaseClient = ReturnType<typeof createClient>
