/**
 * Crop queries
 * Read-only master data queries
 */

import type { SupabaseClient } from '../client'
import type { Crop, Season } from '../types'

/**
 * Get all active crops
 */
export async function getCrops(client: SupabaseClient) {
  const { data, error } = await client
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get crops by season
 */
export async function getCropsBySeason(client: SupabaseClient, season: Season) {
  const { data, error } = await client
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .eq('season', season)
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get a single crop by ID
 */
export async function getCropById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('crops')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get crops suitable for a given soil pH
 */
export async function getCropsBySoilPH(client: SupabaseClient, ph: number) {
  const { data, error } = await client
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .lte('suitable_soil_ph_min', ph)
    .gte('suitable_soil_ph_max', ph)
    .order('name')

  if (error) throw error
  return data
}

/**
 * Search crops by name
 */
export async function searchCrops(client: SupabaseClient, query: string) {
  const { data, error } = await client
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%`)
    .order('name')
    .limit(20)

  if (error) throw error
  return data
}
