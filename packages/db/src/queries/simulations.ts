/**
 * Simulation queries
 * CRUD operations for profit simulations
 */

import type { SupabaseClient } from '../client'
import type { InsertTables, UpdateTables } from '../types'

/**
 * Get all simulations for the current user's organization
 */
export async function getSimulations(client: SupabaseClient) {
  const { data, error } = await client
    .from('simulations')
    .select(`
      *,
      summer_crop:crops!simulations_summer_crop_id_fkey(*),
      winter_crop:crops!simulations_winter_crop_id_fkey(*),
      field:fields(*)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single simulation by ID
 */
export async function getSimulationById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('simulations')
    .select(`
      *,
      summer_crop:crops!simulations_summer_crop_id_fkey(*),
      winter_crop:crops!simulations_winter_crop_id_fkey(*),
      field:fields(
        *,
        location:locations(*),
        soil_profile:soil_profiles(*)
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new simulation
 */
export async function createSimulation(
  client: SupabaseClient,
  simulation: InsertTables<'simulations'>
) {
  const { data, error } = await client
    .from('simulations')
    .insert(simulation)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a simulation
 */
export async function updateSimulation(
  client: SupabaseClient,
  id: string,
  updates: UpdateTables<'simulations'>
) {
  const { data, error } = await client
    .from('simulations')
    .update({
      ...updates,
      version: (updates.version || 1) + 1,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Soft delete a simulation
 */
export async function deleteSimulation(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('simulations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get simulations by user
 */
export async function getSimulationsByUser(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from('simulations')
    .select(`
      *,
      summer_crop:crops!simulations_summer_crop_id_fkey(id, name),
      winter_crop:crops!simulations_winter_crop_id_fkey(id, name)
    `)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get recent simulations (for dashboard)
 */
export async function getRecentSimulations(client: SupabaseClient, limit = 5) {
  const { data, error } = await client
    .from('simulations')
    .select(`
      id,
      name,
      result,
      created_at,
      summer_crop:crops!simulations_summer_crop_id_fkey(id, name),
      winter_crop:crops!simulations_winter_crop_id_fkey(id, name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
