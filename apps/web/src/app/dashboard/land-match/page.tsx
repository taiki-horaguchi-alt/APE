import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Leaf, Droplets, Thermometer, Info, ChevronRight, Calendar, Target } from 'lucide-react'
import { getCrops, getSoilProfiles, getLocations, getCropSuitability } from '@/lib/supabase/queries'

const CROP_EMOJI: Record<string, string> = {
  tomato: '🍅', mini_tomato: '🍅', cucumber: '🥒', eggplant: '🍆',
  green_pepper: '🫑', summer_spinach: '🥬', winter_spinach: '🥬',
  edamame: '🫛', okra: '🌿', corn: '🌽', negi: '🧅', cabbage: '🥬',
  daikon: '🥕', carrot: '🥕', hakusai: '🥬', broccoli: '🥦',
  strawberry: '🍓', kabu: '🥕',
}

// デモ用データ（実データがない場合に使用）
const DEMO_SOIL_METRICS = [
  { label: 'pH', value: 6.5, optimal: 6.5, unit: '', status: 'good' as const },
  { label: '有機物', value: 4.2, optimal: 5.0, unit: '%', status: 'warning' as const },
  { label: 'EC', value: 0.3, optimal: 0.3, unit: 'mS/cm', status: 'good' as const },
  { label: '排水性', value: 85, optimal: 80, unit: '%', status: 'good' as const },
  { label: '窒素', value: 12, optimal: 15, unit: 'mg/100g', status: 'warning' as const },
  { label: 'リン酸', value: 25, optimal: 20, unit: 'mg/100g', status: 'good' as const },
]

const DEMO_LOCATION = {
  name: '飛騨高山市国府町',
  elevation: 540,
  annualTemp: 10.5,
  annualRainfall: 1900,
  snowDays: 85,
  frostFreeDays: 150,
}

interface SoilMetric {
  label: string
  value: number
  optimal: number
  unit: string
  status: 'good' | 'warning'
}

export default async function LandMatchPage() {
  // 並行でデータ取得
  const [soilProfiles, locations] = await Promise.all([
    getSoilProfiles().catch(() => []),
    getLocations().catch(() => []),
  ])

  // 最新の土壌プロファイルとロケーション
  const latestSoil = (soilProfiles ?? [])[0]
  const latestLocation = (locations ?? [])[0]
  const hasRealData = !!latestSoil

  // 土壌メトリクスの変換
  const soilMetrics: SoilMetric[] = hasRealData && latestSoil.metrics
    ? parseSoilMetrics(latestSoil.metrics as Record<string, number>)
    : DEMO_SOIL_METRICS

  // ロケーション情報
  const locationInfo = latestLocation
    ? {
        name: `${latestLocation.prefecture}${latestLocation.city}`,
        elevation: latestLocation.elevation ?? 0,
        annualTemp: Number(latestLocation.annual_temp) || 0,
        annualRainfall: latestLocation.annual_rainfall ?? 0,
        snowDays: latestLocation.snow_days ?? 0,
        frostFreeDays: latestLocation.frost_free_days ?? 0,
      }
    : DEMO_LOCATION

  // 土壌pHから作物適合度を計算
  const soilPh = soilMetrics.find(m => m.label === 'pH')?.value ?? 6.5
  const suitabilities = await getCropSuitability(soilPh).catch(() => [])

  // 上位4件
  const recommendedCrops = suitabilities.slice(0, 4).map(s => ({
    id: s.cropId,
    name: s.cropName,
    emoji: CROP_EMOJI[s.cropId] ?? '🌱',
    suitability: s.suitability,
    reason: getSuitabilityReason(s.suitability, s.cropId),
  }))

  // 総合スコア
  const overallScore = hasRealData
    ? (latestSoil.overall_score ?? 85)
    : 85

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="土地診断"
        subtitle="衛星データとAIによる土壌分析"
      />

      <div className="p-6">
        {/* Demo Notice */}
        {!hasRealData && (
          <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg text-sm text-info-700">
            土壌データがまだ登録されていません。以下はデモデータです。
          </div>
        )}

        {/* Map Section */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="relative h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="text-primary-700 font-medium">衛星マップビュー</p>
                <p className="text-sm text-primary-600 mt-1">
                  {locationInfo.name}の農地
                </p>
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-neutral-800">
                  {locationInfo.name}
                </p>
                <p className="text-xs text-neutral-500">
                  標高 {locationInfo.elevation}m
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-sm">
                <p className="text-sm font-medium">
                  総合スコア: {overallScore}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Soil Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary-500" />
                  土壌分析結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {soilMetrics.map(metric => (
                    <div
                      key={metric.label}
                      className={`p-4 rounded-lg border ${
                        metric.status === 'good'
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-warning-50 border-warning-200'
                      }`}
                    >
                      <p className="text-sm text-neutral-600 mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold text-neutral-800">
                        {metric.value}
                        <span className="text-sm font-normal text-neutral-500 ml-1">
                          {metric.unit}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        最適値: {metric.optimal}{metric.unit}
                      </p>
                      <div className="mt-2 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            metric.status === 'good' ? 'bg-primary-500' : 'bg-warning-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (metric.value / metric.optimal) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {hasRealData && latestSoil.recommendation && (
                  <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-info-800">改善提案</p>
                        <p className="text-sm text-info-700 mt-1">
                          {latestSoil.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!hasRealData && (
                  <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-info-800">改善提案</p>
                        <p className="text-sm text-info-700 mt-1">
                          有機物と窒素がやや不足しています。堆肥の投入（10a あたり 2t）を推奨します。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Climate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-primary-500" />
                  気候情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">年間平均気温</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {locationInfo.annualTemp}°C
                    </p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">年間降水量</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {locationInfo.annualRainfall.toLocaleString()}mm
                    </p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">積雪日数</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {locationInfo.snowDays}日
                    </p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">無霜期間</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      {locationInfo.frostFreeDays}日
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accumulated Temperature & Harvest Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-500" />
                  積算温度と収穫予測
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">
                    <strong>積算温度</strong>とは、毎日の平均気温を合計した値（℃・日）。
                    作物の生育ステージや収穫時期の目安になります。
                  </p>
                </div>

                <div className="space-y-4">
                  <HarvestPrediction
                    cropName="トマト"
                    emoji="🍅"
                    requiredTemp={1100}
                    currentTemp={680}
                    plantDate="4月15日"
                    predictedHarvest="7月中旬"
                    dailyAvg={locationInfo.annualTemp > 0 ? Math.round(locationInfo.annualTemp * 2.2) : 23}
                  />
                  <HarvestPrediction
                    cropName="きゅうり"
                    emoji="🥒"
                    requiredTemp={900}
                    currentTemp={680}
                    plantDate="4月20日"
                    predictedHarvest="6月下旬"
                    dailyAvg={locationInfo.annualTemp > 0 ? Math.round(locationInfo.annualTemp * 2.2) : 23}
                  />
                  <HarvestPrediction
                    cropName="ほうれん草"
                    emoji="🥬"
                    requiredTemp={800}
                    currentTemp={750}
                    plantDate="3月1日"
                    predictedHarvest="来週"
                    dailyAvg={locationInfo.annualTemp > 0 ? Math.round(locationInfo.annualTemp * 2.2) : 23}
                  />
                  <HarvestPrediction
                    cropName="ブロッコリー"
                    emoji="🥦"
                    requiredTemp={1200}
                    currentTemp={420}
                    plantDate="5月1日"
                    predictedHarvest="8月上旬"
                    dailyAvg={locationInfo.annualTemp > 0 ? Math.round(locationInfo.annualTemp * 2.2) : 23}
                  />
                </div>

                <p className="text-xs text-neutral-400 mt-4">
                  ※ 積算温度は概算値です。実際の収穫時期は天候により変動します。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Crops */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>おすすめの作物</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedCrops.map((crop, index) => (
                    <div
                      key={crop.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        index === 0
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-white border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{crop.emoji}</span>
                          <span className="font-medium text-neutral-800">{crop.name}</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            crop.suitability >= 90
                              ? 'text-primary-600'
                              : crop.suitability >= 80
                                ? 'text-info-600'
                                : 'text-neutral-600'
                          }`}
                        >
                          {crop.suitability}%
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">{crop.reason}</p>
                      <div className="mt-2 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${crop.suitability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IoT Upsell */}
            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
              <CardContent>
                <Droplets className="w-10 h-10 mb-4 text-primary-200" />
                <h3 className="text-lg font-semibold mb-2">
                  IoTセンサーで精度アップ
                </h3>
                <p className="text-sm text-primary-100 mb-4">
                  リアルタイムの土壌データで、より精密な分析が可能になります。
                </p>
                <Button className="w-full bg-white text-primary-600 hover:bg-primary-50">
                  詳細を見る
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/** JSONB metrics を表示用に変換 */
function parseSoilMetrics(metrics: Record<string, number>): SoilMetric[] {
  const definitions = [
    { key: 'pH', label: 'pH', optimal: 6.5, unit: '' },
    { key: 'organicMatter', label: '有機物', optimal: 5.0, unit: '%' },
    { key: 'EC', label: 'EC', optimal: 0.3, unit: 'mS/cm' },
    { key: 'drainage', label: '排水性', optimal: 80, unit: '%' },
    { key: 'nitrogen', label: '窒素', optimal: 15, unit: 'mg/100g' },
    { key: 'phosphorus', label: 'リン酸', optimal: 20, unit: 'mg/100g' },
  ]

  return definitions
    .filter(d => metrics[d.key] !== undefined)
    .map(d => {
      const value = metrics[d.key]
      const ratio = value / d.optimal
      return {
        label: d.label,
        value,
        optimal: d.optimal,
        unit: d.unit,
        status: (ratio >= 0.8 && ratio <= 1.3 ? 'good' : 'warning') as 'good' | 'warning',
      }
    })
}

/** 積算温度に基づく収穫予測コンポーネント */
function HarvestPrediction({
  cropName,
  emoji,
  requiredTemp,
  currentTemp,
  plantDate,
  predictedHarvest,
  dailyAvg,
}: {
  cropName: string
  emoji: string
  requiredTemp: number
  currentTemp: number
  plantDate: string
  predictedHarvest: string
  dailyAvg: number
}) {
  const progress = Math.min(100, Math.round((currentTemp / requiredTemp) * 100))
  const remaining = requiredTemp - currentTemp
  const daysLeft = dailyAvg > 0 ? Math.max(0, Math.ceil(remaining / dailyAvg)) : 0
  const isReady = progress >= 95

  return (
    <div className={`p-4 rounded-lg border ${isReady ? 'bg-primary-50 border-primary-200' : 'bg-white border-neutral-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium text-neutral-800">{cropName}</span>
        </div>
        <div className="text-right">
          {isReady ? (
            <span className="text-xs font-bold bg-primary-500 text-white px-2 py-1 rounded-full">収穫適期</span>
          ) : (
            <span className="text-xs text-neutral-500">あと約{daysLeft}日</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isReady ? 'bg-primary-500' : 'bg-yellow-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-neutral-700">{progress}%</span>
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>定植: {plantDate}</span>
        <span>{currentTemp}℃・日 / {requiredTemp}℃・日</span>
        <span>予測: {predictedHarvest}</span>
      </div>
    </div>
  )
}

/** 適合度に応じた説明文を生成 */
function getSuitabilityReason(suitability: number, cropId: string): string {
  const reasons: Record<string, string> = {
    tomato: 'pH、排水性が最適。高収益が期待できます。',
    cucumber: '温度条件が適しています。夏場の収穫に最適。',
    eggplant: '温暖な気候と排水性の良さが好条件。',
    spinach: '有機物を追加すれば更に収量アップ。',
    winter_spinach: '冬場の栽培に適した土壌条件。',
    carrot: '排水性が良好で根菜類に適しています。',
    cabbage: '安定した収穫が見込めます。',
    daikon: '深い土壌と排水性が好条件。',
    broccoli: '冬場の高収益作物として有望。',
    negi: '通年栽培可能で安定収入に。',
    strawberry: '高品質な栽培が見込めます。',
  }

  if (reasons[cropId]) return reasons[cropId]

  if (suitability >= 90) return '土壌条件が非常に適しています。'
  if (suitability >= 80) return '条件が良好で安定した栽培が可能。'
  return '一部の条件改善で栽培可能です。'
}
