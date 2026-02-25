/**
 * Market price queries
 * Read-only market data queries
 */

import type { SupabaseClient } from '../client'

/**
 * Get all markets
 */
export async function getMarkets(client: SupabaseClient) {
  const { data, error } = await client
    .from('markets')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get market by ID
 */
export async function getMarketById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from('markets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get prices for a specific crop across all markets
 */
export async function getPricesForCrop(
  client: SupabaseClient,
  cropId: string,
  days = 30
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await client
    .from('market_prices')
    .select(`
      *,
      market:markets(*)
    `)
    .eq('crop_id', cropId)
    .gte('price_date', startDate.toISOString().split('T')[0])
    .order('price_date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get prices for a specific market
 */
export async function getPricesForMarket(
  client: SupabaseClient,
  marketId: string,
  days = 30
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await client
    .from('market_prices')
    .select(`
      *,
      crop:crops(*)
    `)
    .eq('market_id', marketId)
    .gte('price_date', startDate.toISOString().split('T')[0])
    .order('price_date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get latest prices for all crops in a market
 */
export async function getLatestPricesForMarket(
  client: SupabaseClient,
  marketId: string
) {
  // Get the most recent price for each crop in the market
  const { data, error } = await client
    .from('market_prices')
    .select(`
      *,
      crop:crops(id, name, name_en, season, category)
    `)
    .eq('market_id', marketId)
    .order('price_date', { ascending: false })

  if (error) throw error

  // Deduplicate to get only the latest price per crop
  const latestPrices = new Map<string, typeof data[0]>()
  for (const price of data) {
    if (!latestPrices.has(price.crop_id)) {
      latestPrices.set(price.crop_id, price)
    }
  }

  return Array.from(latestPrices.values())
}

/**
 * Get price trend for a specific crop in a specific market
 */
export async function getPriceTrend(
  client: SupabaseClient,
  cropId: string,
  marketId: string,
  days = 30
) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await client
    .from('market_prices')
    .select('price_date, price')
    .eq('crop_id', cropId)
    .eq('market_id', marketId)
    .gte('price_date', startDate.toISOString().split('T')[0])
    .order('price_date', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Compare prices across markets for a crop
 */
export async function comparePricesAcrossMarkets(
  client: SupabaseClient,
  cropId: string
) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await client
    .from('market_prices')
    .select(`
      price,
      market:markets(id, name, location)
    `)
    .eq('crop_id', cropId)
    .eq('price_date', today)
    .order('price', { ascending: false })

  if (error) throw error
  return data
}
