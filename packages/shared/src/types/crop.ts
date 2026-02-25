export type Season = 'summer' | 'winter'
export type WaterRequirement = '低' | '中' | '高'
export type FrostTolerance = '低' | '中' | '高' | '極高'
export type Difficulty = 1 | 2 | 3 | 4 | 5

export interface TemperatureRange {
  min: number
  max: number
}

export interface SoilPHRange {
  min: number
  max: number
}

export interface Crop {
  id: string
  name: string
  nameEn: string
  season: Season
  category: string
  plantingMonths: number[]
  harvestMonths: number[]
  optimalTemp: TemperatureRange
  frostTolerance: FrostTolerance
  revenuePerUnit: number
  costPerUnit: number
  difficulty: Difficulty
  waterRequirement: WaterRequirement
  suitableSoilPH: SoilPHRange
  rotationAvoid: string[]
  description: string
  iconUrl?: string
}

export interface CropSuitability {
  cropId: string
  suitabilityScore: number
  successRate: number
  phMatch: '○' | '△' | '×'
  drainageMatch: '○' | '△' | '×'
  organicMatch: '○' | '△' | '×'
  recommendation: string
}
