import type {
  Crop,
  CropSuitability,
  SoilProfile,
  MonthlyData,
  SimulationResult,
  SimulationAlert,
  RiskScenario,
} from '../types'

/**
 * Calculate crop suitability based on soil profile
 */
export function calculateCropSuitability(
  soilProfile: SoilProfile,
  crop: Crop
): CropSuitability {
  const metrics = soilProfile.metrics

  // pH match calculation
  const phValue = metrics.pH.value
  const phMatch =
    phValue >= crop.suitableSoilPH.min && phValue <= crop.suitableSoilPH.max
      ? '○'
      : Math.abs(phValue - (crop.suitableSoilPH.min + crop.suitableSoilPH.max) / 2) <
          1
        ? '△'
        : '×'

  // Drainage match
  const drainageScore = metrics.drainage.value
  const drainageMatch =
    drainageScore >= 70 ? '○' : drainageScore >= 50 ? '△' : '×'

  // Organic matter match
  const organicScore = metrics.organicMatter.value
  const organicMatch =
    organicScore >= metrics.organicMatter.optimal * 0.8
      ? '○'
      : organicScore >= metrics.organicMatter.optimal * 0.5
        ? '△'
        : '×'

  // Calculate overall suitability score
  let score = 0

  // pH contributes 30%
  if (phMatch === '○') score += 30
  else if (phMatch === '△') score += 15

  // Drainage contributes 25%
  if (drainageMatch === '○') score += 25
  else if (drainageMatch === '△') score += 12

  // Organic matter contributes 20%
  if (organicMatch === '○') score += 20
  else if (organicMatch === '△') score += 10

  // Overall soil score contributes 25%
  score += (soilProfile.overallScore / 100) * 25

  // Success rate is slightly lower than suitability
  const successRate = Math.max(0, score - 10 + Math.random() * 10)

  const recommendation =
    score >= 80
      ? 'この作物は非常に適しています。高い収量が期待できます。'
      : score >= 60
        ? '栽培可能ですが、土壌改良で収量向上が見込めます。'
        : '土壌条件が合わないため、他の作物を検討してください。'

  return {
    cropId: crop.id,
    suitabilityScore: Math.round(score),
    successRate: Math.round(successRate),
    phMatch,
    drainageMatch,
    organicMatch,
    recommendation,
  }
}

/**
 * Calculate monthly cash flow data
 */
export function calculateMonthlyCashflow(
  summerCrop: Crop,
  winterCrop: Crop,
  areaSize: number
): MonthlyData[] {
  const months: MonthlyData[] = []
  let cumulative = 0

  for (let month = 1; month <= 12; month++) {
    let income = 0
    let expense = 0

    // Summer crop income (distributed across harvest months)
    if (summerCrop.harvestMonths.includes(month)) {
      const perMonth =
        (summerCrop.revenuePerUnit * areaSize) / summerCrop.harvestMonths.length
      income += perMonth
    }

    // Summer crop expenses (distributed across planting months)
    if (summerCrop.plantingMonths.includes(month)) {
      const perMonth =
        (summerCrop.costPerUnit * areaSize) / summerCrop.plantingMonths.length
      expense += perMonth
    }

    // Winter crop income
    if (winterCrop.harvestMonths.includes(month)) {
      const perMonth =
        (winterCrop.revenuePerUnit * areaSize) / winterCrop.harvestMonths.length
      income += perMonth
    }

    // Winter crop expenses
    if (winterCrop.plantingMonths.includes(month)) {
      const perMonth =
        (winterCrop.costPerUnit * areaSize) / winterCrop.plantingMonths.length
      expense += perMonth
    }

    const cashflow = income - expense
    cumulative += cashflow

    months.push({
      month,
      income,
      expense,
      cashflow,
      cumulative,
    })
  }

  return months
}

/**
 * Generate simulation alerts based on monthly data
 */
export function generateAlerts(monthlyData: MonthlyData[]): SimulationAlert[] {
  const alerts: SimulationAlert[] = []

  // Check for cash shortage
  for (const data of monthlyData) {
    if (data.cumulative < 0) {
      alerts.push({
        type: 'danger',
        month: data.month,
        message: `${data.month}ヶ月目に資金ショートの可能性があります`,
      })
      break // Only show first shortage
    }
  }

  // Check for large negative cash flow months
  for (const data of monthlyData) {
    if (data.cashflow < -500000) {
      alerts.push({
        type: 'warning',
        month: data.month,
        message: `${data.month}月は大きな支出が予想されます`,
      })
    }
  }

  return alerts
}

/**
 * Apply risk scenarios to profit
 */
export function applyRiskScenarios(
  baseProfit: number,
  scenarios: RiskScenario[]
): number {
  let adjustedProfit = baseProfit

  for (const scenario of scenarios) {
    if (scenario.enabled) {
      adjustedProfit += baseProfit * (scenario.impactPercent / 100)
    }
  }

  return Math.max(0, adjustedProfit)
}

/**
 * Calculate full simulation result
 */
export function calculateSimulation(
  summerCrop: Crop,
  winterCrop: Crop,
  areaSize: number,
  riskScenarios: RiskScenario[]
): SimulationResult {
  const summerRevenue = summerCrop.revenuePerUnit * areaSize
  const summerCost = summerCrop.costPerUnit * areaSize
  const winterRevenue = winterCrop.revenuePerUnit * areaSize
  const winterCost = winterCrop.costPerUnit * areaSize

  const totalRevenue = summerRevenue + winterRevenue
  const totalCost = summerCost + winterCost
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const monthlyData = calculateMonthlyCashflow(summerCrop, winterCrop, areaSize)
  const alerts = generateAlerts(monthlyData)
  const riskAdjustedProfit = applyRiskScenarios(totalProfit, riskScenarios)

  return {
    summerCropId: summerCrop.id,
    winterCropId: winterCrop.id,
    areaSize,
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    monthlyData,
    riskAdjustedProfit,
    alerts,
  }
}

/**
 * Normalize a value to 0-100 score
 */
export function normalizeScore(
  value: number,
  minVal: number,
  maxVal: number,
  optimal: number
): number {
  if (value === optimal) return 100

  const rangeSize = maxVal - minVal
  if (rangeSize === 0) return 50

  const deviation = Math.abs(value - optimal) / rangeSize
  return Math.max(0, Math.min(100, 100 - deviation * 100))
}
