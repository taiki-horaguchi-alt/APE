export type ViewMode = 'revenue' | 'cashflow'

export interface MonthlyData {
  month: number
  income: number
  expense: number
  cashflow: number
  cumulative: number
}

export interface RiskScenario {
  id: string
  name: string
  icon: string
  impactPercent: number
  enabled: boolean
}

export interface SimulationResult {
  summerCropId: string
  winterCropId: string
  areaSize: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  monthlyData: MonthlyData[]
  riskAdjustedProfit: number
  alerts: SimulationAlert[]
}

export interface SimulationAlert {
  type: 'warning' | 'danger' | 'info'
  month: number
  message: string
}

export const DEFAULT_RISK_SCENARIOS: RiskScenario[] = [
  {
    id: 'typhoon',
    name: '台風被害',
    icon: 'cyclone',
    impactPercent: -30,
    enabled: false,
  },
  {
    id: 'heat',
    name: '猛暑',
    icon: 'sunny',
    impactPercent: -10,
    enabled: false,
  },
  {
    id: 'frost',
    name: '霜害',
    icon: 'ac-unit',
    impactPercent: -20,
    enabled: false,
  },
]
