export interface SoilMetric {
  value: number
  optimal: number
  unit: string
  label: string
  description: string
}

export interface SoilMetrics {
  pH: SoilMetric
  EC: SoilMetric
  CEC: SoilMetric
  organicMatter: SoilMetric
  nitrogen: SoilMetric
  phosphorus: SoilMetric
  potassium: SoilMetric
  calcium: SoilMetric
  magnesium: SoilMetric
  drainage: SoilMetric
}

export interface SoilProfile {
  id: string
  locationId: string
  name: string
  soilType: string
  metrics: SoilMetrics
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  lastUpdated: string
  source: 'satellite' | 'iot' | 'manual'
}
