export type MarketCategory = 'vegetables' | 'fruits' | 'other'

export interface Market {
  id: string
  name: string
  location: string
}

export interface PricePoint {
  date: string
  price: number
}

export interface CropPrice {
  cropId: string
  cropName: string
  marketId: string
  currentPrice: number
  previousPrice: number
  changePercent: number
  unit: string
  history: PricePoint[]
  threeYearAverage: PricePoint[]
}

export const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  vegetables: '野菜',
  fruits: '果物',
  other: 'その他',
}

export const MARKETS: Market[] = [
  { id: 'osaka', name: '大阪本場', location: '大阪' },
  { id: 'tokyo', name: '東京大田', location: '東京' },
  { id: 'nagoya', name: '名古屋本場', location: '名古屋' },
  { id: 'sapporo', name: '札幌中央', location: '札幌' },
]
