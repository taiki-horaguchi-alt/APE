/**
 * Field queries
 * CRUD operations for farm fields
 */

import type { SupabaseClient } from '../client'
import type { Field, InsertTables, UpdateTables } from '../types'

/**
 * Get all fields for the current user's organization
 */
export async function getFields(client: SupabaseClient) {
  const { data, error } = await client
    .from('fields')
    .select(`
      *,
      location:locations(*),
      soil_profile:soil_profiles(*)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a single field by ID
 */
export async function getFieldById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('fields')
    .select(`
      *,
      location:locations(*),
      soil_profile:soil_profiles(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new field
 */
export async function createField(
  client: SupabaseClient,
  field: InsertTables<'fields'>
) {
  const { data, error } = await client
    .from('fields')
    .insert(field)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a field
 */
export async function updateField(
  client: SupabaseClient,
  id: string,
  updates: UpdateTables<'fields'>
) {
  const { data, error } = await client
    .from('fields')
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
 * Soft delete a field
 */
export async function deleteField(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('fields')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get fields by location
 */
export async function getFieldsByLocation(client: SupabaseClient, locationId: string) {
  const { data, error } = await client
    .from('fields')
    .select(`
      *,
      soil_profile:soil_profiles(*)
    `)
    .eq('location_id', locationId)
    .is('deleted_at', null)
    .order('name')

  if (error) throw error
  return data
}
