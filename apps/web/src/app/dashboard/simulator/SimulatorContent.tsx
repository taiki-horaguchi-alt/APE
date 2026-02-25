'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Sun,
  CloudSnow,
  Save,
  History,
  Users,
} from 'lucide-react'

interface CropData {
  id: string
  name: string
  season: string | null
  emoji: string
  revenuePerUnit: number
  costPerUnit: number
  harvestMonths: number[]
  plantingMonths: number[]
}

interface SimulatorContentProps {
  summerCrops: CropData[]
  winterCrops: CropData[]
}

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

const RISK_SCENARIOS = [
  { id: 'typhoon', name: '台風被害', icon: Zap, impact: -30 },
  { id: 'heat', name: '猛暑', icon: Sun, impact: -10 },
  { id: 'frost', name: '霜害', icon: CloudSnow, impact: -20 },
]

/** 月別収支を計算する */
function calculateMonthlyData(
  crop: CropData | undefined,
  areaSize: number
): { month: number; income: number; expense: number }[] {
  if (!crop) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }))
  }

  const totalRevenue = crop.revenuePerUnit * areaSize
  const totalCost = crop.costPerUnit * areaSize

  const harvestCount = crop.harvestMonths.length || 1
  const monthlyRevenue = Math.round(totalRevenue / harvestCount)

  // コストは植付月に重く、それ以外にも少し分配
  const plantingCount = crop.plantingMonths.length || 1
  const plantingCost = Math.round(totalCost * 0.6 / plantingCount)
  const growingMonths = crop.harvestMonths.length + crop.plantingMonths.length
  const maintenanceCost = growingMonths > 0
    ? Math.round(totalCost * 0.4 / Math.max(growingMonths, 1))
    : 0

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const income = crop.harvestMonths.includes(month) ? monthlyRevenue : 0
    let expense = 0
    if (crop.plantingMonths.includes(month)) {
      expense += plantingCost + maintenanceCost
    } else if (crop.harvestMonths.includes(month)) {
      expense += maintenanceCost
    }
    return { month, income, expense }
  })
}

export function SimulatorContent({
  summerCrops,
  winterCrops,
}: SimulatorContentProps) {
  const [summerCropId, setSummerCropId] = useState(summerCrops[0]?.id ?? '')
  const [winterCropId, setWinterCropId] = useState(winterCrops[0]?.id ?? '')
  const [areaSize, setAreaSize] = useState(3)
  const [risks, setRisks] = useState(
    RISK_SCENARIOS.map(r => ({ ...r, enabled: false }))
  )

  const selectedSummer = useMemo(
    () => summerCrops.find(c => c.id === summerCropId),
    [summerCrops, summerCropId]
  )
  const selectedWinter = useMemo(
    () => winterCrops.find(c => c.id === winterCropId),
    [winterCrops, winterCropId]
  )

  // 月別データ計算
  const summerMonthly = useMemo(
    () => calculateMonthlyData(selectedSummer, areaSize),
    [selectedSummer, areaSize]
  )
  const winterMonthly = useMemo(
    () => calculateMonthlyData(selectedWinter, areaSize),
    [selectedWinter, areaSize]
  )

  // 合算
  const monthlyData = useMemo(
    () => summerMonthly.map((s, i) => ({
      month: s.month,
      income: s.income + winterMonthly[i].income,
      expense: s.expense + winterMonthly[i].expense,
      balance: (s.income + winterMonthly[i].income) - (s.expense + winterMonthly[i].expense),
    })),
    [summerMonthly, winterMonthly]
  )

  // 年間合計
  const totalRevenue = monthlyData.reduce((acc, d) => acc + d.income, 0)
  const totalCost = monthlyData.reduce((acc, d) => acc + d.expense, 0)
  const totalProfit = totalRevenue - totalCost

  // リスク計算
  const toggleRisk = (id: string) => {
    setRisks(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const riskImpact = risks
    .filter(r => r.enabled)
    .reduce((acc, r) => acc + r.impact, 0)
  const riskAdjustedProfit = Math.max(0, totalProfit * (1 + riskImpact / 100))

  // 資金ショート月を検出
  const cumulativeData = monthlyData.reduce<{ month: number; cumulative: number }[]>(
    (acc, d) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0
      return [...acc, { month: d.month, cumulative: prev + d.balance }]
    },
    []
  )
  const shortfallMonths = cumulativeData.filter(d => d.cumulative < 0)

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Crop Selection */}
          <Card>
            <CardHeader>
              <CardTitle>作物選択</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  夏作
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {summerCrops.map(crop => (
                    <button
                      key={crop.id}
                      onClick={() => setSummerCropId(crop.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        summerCropId === crop.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-xl">{crop.emoji}</span>
                      <p className="text-sm font-medium mt-1">{crop.name}</p>
                      <p className="text-xs text-neutral-500">
                        ¥{(crop.revenuePerUnit / 10000).toFixed(0)}万/反
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  冬作
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {winterCrops.map(crop => (
                    <button
                      key={crop.id}
                      onClick={() => setWinterCropId(crop.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        winterCropId === crop.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-xl">{crop.emoji}</span>
                      <p className="text-sm font-medium mt-1">{crop.name}</p>
                      <p className="text-xs text-neutral-500">
                        ¥{(crop.revenuePerUnit / 10000).toFixed(0)}万/反
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  栽培面積: {areaSize}反
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={areaSize}
                  onChange={e => setAreaSize(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>1反</span>
                  <span>10反</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Scenarios */}
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white border-0">
            <CardHeader>
              <CardTitle className="text-white">もしもシミュレーション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {risks.map(risk => (
                <div key={risk.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRisk(risk.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        risk.enabled ? 'bg-primary-500' : 'bg-neutral-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          risk.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <risk.icon className="w-5 h-5" />
                    <span>{risk.name}</span>
                  </div>
                  <span className="text-sm text-neutral-400">{risk.impact}%</span>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-neutral-700">
                <p className="text-sm text-neutral-400 mb-2">リスク込み予想利益</p>
                <p className="text-3xl font-bold text-primary-400">
                  ¥{riskAdjustedProfit.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button className="w-full" variant="primary">
            <Save className="w-4 h-4 mr-2" />
            シミュレーションを保存
          </Button>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="text-center py-6">
                <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm text-primary-700">年間売上</p>
                <p className="text-2xl font-bold text-primary-600">
                  ¥{totalRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-danger-50 border-danger-200">
              <CardContent className="text-center py-6">
                <TrendingDown className="w-8 h-8 text-danger-500 mx-auto mb-2" />
                <p className="text-sm text-danger-700">年間コスト</p>
                <p className="text-2xl font-bold text-danger-600">
                  ¥{totalCost.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-info-50 border-info-200">
              <CardContent className="text-center py-6">
                <BarChart3 className="w-8 h-8 text-info-500 mx-auto mb-2" />
                <p className="text-sm text-info-700">年間利益</p>
                <p className="text-2xl font-bold text-info-600">
                  ¥{totalProfit.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>月次キャッシュバランス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {monthlyData.map(data => {
                  const maxValue = Math.max(
                    ...monthlyData.map(d => Math.abs(d.balance)),
                    1
                  )
                  const height = (Math.abs(data.balance) / maxValue) * 100

                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full h-48 flex items-end justify-center">
                        <div
                          className={`w-full rounded-t transition-all ${
                            data.balance < 0 ? 'bg-danger-400' : 'bg-primary-500'
                          }`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`¥${data.balance.toLocaleString()}`}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        {MONTHS[data.month - 1]}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Alert for shortfall months */}
              {shortfallMonths.length > 0 && (
                <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-800">
                        {shortfallMonths.map(m => MONTHS[m.month - 1]).join('・')}
                        に資金ショートの可能性
                      </p>
                      <p className="text-sm text-warning-700 mt-1">
                        つなぎ融資やJA短期借入を検討することをお勧めします。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>月別収支明細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 font-medium text-neutral-600">月</th>
                      <th className="text-right py-2 font-medium text-neutral-600">収入</th>
                      <th className="text-right py-2 font-medium text-neutral-600">支出</th>
                      <th className="text-right py-2 font-medium text-neutral-600">収支</th>
                      <th className="text-right py-2 font-medium text-neutral-600">累計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((data, index) => {
                      const cumulative = cumulativeData[index]?.cumulative ?? 0

                      return (
                        <tr key={data.month} className="border-b border-neutral-100">
                          <td className="py-2">{MONTHS[data.month - 1]}</td>
                          <td className="text-right py-2 text-primary-600">
                            {data.income > 0 ? `¥${data.income.toLocaleString()}` : '-'}
                          </td>
                          <td className="text-right py-2 text-danger-600">
                            {data.expense > 0 ? `¥${data.expense.toLocaleString()}` : '-'}
                          </td>
                          <td className={`text-right py-2 font-medium ${
                            data.balance >= 0 ? 'text-primary-600' : 'text-danger-600'
                          }`}>
                            ¥{data.balance.toLocaleString()}
                          </td>
                          <td className={`text-right py-2 ${
                            cumulative >= 0 ? 'text-neutral-800' : 'text-danger-600'
                          }`}>
                            ¥{cumulative.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                    {/* 年間合計行 */}
                    <tr className="border-t-2 border-neutral-300 font-bold">
                      <td className="py-2">合計</td>
                      <td className="text-right py-2 text-primary-600">
                        ¥{totalRevenue.toLocaleString()}
                      </td>
                      <td className="text-right py-2 text-danger-600">
                        ¥{totalCost.toLocaleString()}
                      </td>
                      <td className={`text-right py-2 ${
                        totalProfit >= 0 ? 'text-primary-600' : 'text-danger-600'
                      }`}>
                        ¥{totalProfit.toLocaleString()}
                      </td>
                      <td className="text-right py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Last Year Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                昨年の振り返り
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">昨年売上</p>
                  <p className="text-xl font-bold text-primary-600">¥2,850,000</p>
                </div>
                <div className="text-center p-3 bg-danger-50 rounded-lg">
                  <p className="text-sm text-danger-700">昨年コスト</p>
                  <p className="text-xl font-bold text-danger-600">¥1,420,000</p>
                </div>
                <div className="text-center p-3 bg-info-50 rounded-lg">
                  <p className="text-sm text-info-700">昨年利益</p>
                  <p className="text-xl font-bold text-info-600">¥1,430,000</p>
                </div>
              </div>

              {/* Year over Year comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-700">売上 前年比</span>
                  <span className={`font-bold ${totalRevenue >= 2850000 ? 'text-primary-600' : 'text-danger-600'}`}>
                    {totalRevenue >= 2850000 ? '+' : ''}{Math.round(((totalRevenue - 2850000) / 2850000) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-700">コスト 前年比</span>
                  <span className={`font-bold ${totalCost <= 1420000 ? 'text-primary-600' : 'text-danger-600'}`}>
                    {totalCost >= 1420000 ? '+' : ''}{Math.round(((totalCost - 1420000) / 1420000) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-700">利益 前年比</span>
                  <span className={`font-bold ${totalProfit >= 1430000 ? 'text-primary-600' : 'text-danger-600'}`}>
                    {totalProfit >= 1430000 ? '+' : ''}{Math.round(((totalProfit - 1430000) / 1430000) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-4">
                ※ 昨年データはデモ値です。実績データを登録すると正確な比較が可能になります。
              </p>
            </CardContent>
          </Card>

          {/* Labor allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                人員配置シミュレーション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map(data => {
                  const laborHours = data.income > 0 ? 160 : data.expense > 0 ? 80 : 20
                  const people = Math.ceil(laborHours / 160)
                  const maxHours = 200

                  return (
                    <div key={data.month} className="flex items-center gap-3">
                      <span className="w-10 text-sm text-neutral-600">{MONTHS[data.month - 1]}</span>
                      <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            laborHours > 160 ? 'bg-danger-400' : laborHours > 80 ? 'bg-yellow-400' : 'bg-primary-400'
                          }`}
                          style={{ width: `${(laborHours / maxHours) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-neutral-500">{laborHours}h</span>
                      <span className="w-12 text-right text-xs font-medium text-neutral-700">{people}人</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-neutral-400 mt-4">
                ※ 1人あたり月160時間として算出
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
