export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  id: string
  name: string
  prefecture: string
  city: string
  area: string
  coordinates: Coordinates
  elevation: number
  climateZone: string
  annualTemp: number
  annualRainfall: number
  snowDays: number
  frostFreeDays: number
  soilType: string
  mainCrops: string[]
  challenges: string[]
  description: string
}

export interface Field {
  id: string
  name: string
  locationId: string
  polygon: Coordinates[]
  areaSize: number
  soilProfileId?: string
}
