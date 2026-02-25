import type { Coordinates } from './location'

export type BuyerType =
  | 'restaurant'
  | 'hotel'
  | 'chain_hq'
  | 'direct_sales'
  | 'ja'
  | 'market'
  | 'supermarket'

export interface Buyer {
  id: string
  name: string
  type: BuyerType
  coordinates: Coordinates
  distance: string
  demandCrops: string[]
  priceLevel: '低' | '中' | '中〜高' | '高'
  contact: string
  matchScore: number
  monthlyVolume?: number
  description?: string
}

export interface BuyerFilter {
  types: BuyerType[]
  crops: string[]
  maxDistance?: number
  minMatchScore?: number
}

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  restaurant: 'レストラン',
  hotel: 'ホテル・旅館',
  chain_hq: 'チェーン本部',
  direct_sales: '直売所',
  ja: 'JA',
  market: '卸売市場',
  supermarket: 'スーパー',
}

export const BUYER_TYPE_ICONS: Record<BuyerType, string> = {
  restaurant: 'restaurant',
  hotel: 'bed',
  chain_hq: 'business',
  direct_sales: 'storefront',
  ja: 'agriculture',
  market: 'inventory',
  supermarket: 'shopping-cart',
}
