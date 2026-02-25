import { DashboardHeader } from '@/components/layout/DashboardHeader'
import {
  getCrops,
  getMarkets,
  getMarketPricesWithCrops,
  getCropPriceHistory,
  getCropPriceComparison,
  getCurrentUser,
  getUserProfile,
} from '@/lib/supabase/queries'
import { MarketContent } from './MarketContent'

const CROP_EMOJI: Record<string, string> = {
  tomato: '🍅',
  mini_tomato: '🍅',
  cucumber: '🥒',
  eggplant: '🍆',
  green_pepper: '🫑',
  summer_spinach: '🥬',
  winter_spinach: '🥬',
  edamame: '🫛',
  okra: '🌿',
  corn: '🌽',
  negi: '🧅',
  cabbage: '🥬',
  daikon: '🥕',
  carrot: '🥕',
  hakusai: '🥬',
  broccoli: '🥦',
  strawberry: '🍓',
  kabu: '🥕',
}

const DEFAULT_MARKET = 'osaka_honba'

export default async function MarketPage() {
  // 並行でデータ取得
  const [crops, markets, prices, user] = await Promise.all([
    getCrops().catch(() => []),
    getMarkets().catch(() => []),
    getMarketPricesWithCrops(DEFAULT_MARKET).catch(() => []),
    getCurrentUser().catch(() => null),
  ])

  // ユーザーの関心作物を取得
  const profile = user ? await getUserProfile(user.id).catch(() => null) : null
  const interestedCrops = profile?.interested_crops ?? []

  // 作物名マップ
  const cropMap = new Map(
    (crops ?? []).map(c => [c.id, c.name])
  )

  // 作物名→IDの逆引き
  const cropNameToId = new Map(
    (crops ?? []).map(c => [c.name, c.id])
  )

  // ユーザーの関心作物IDリスト
  const interestedCropIds = interestedCrops
    .map((name: string) => cropNameToId.get(name))
    .filter((id: string | undefined): id is string => !!id)

  // 各作物の価格履歴を並行で取得
  const cropIds = prices.map(p => p.cropId)
  const histories = await Promise.all(
    cropIds.map(id =>
      getCropPriceHistory(id, DEFAULT_MARKET, 30).catch(() => [])
    )
  )

  const historyMap = new Map(
    cropIds.map((id, i) => [id, histories[i].map(h => h.price)])
  )

  // 最初の作物の市場比較データ
  const firstCropId = cropIds[0] ?? 'tomato'
  const comparisons = await getCropPriceComparison(firstCropId).catch(() => [])

  // CropPrice型に変換
  const cropPrices = prices.map(p => ({
    cropId: p.cropId,
    cropName: cropMap.get(p.cropId) ?? p.cropId,
    emoji: CROP_EMOJI[p.cropId] ?? '🌱',
    price: p.price,
    change: p.change,
    trend: p.trend,
    history: historyMap.get(p.cropId) ?? [],
  }))

  // 市場リスト
  const marketList = (markets ?? []).map(m => ({
    id: m.id,
    name: m.name,
  }))

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="マーケット"
        subtitle="市況情報・価格トレンド"
      />
      <MarketContent
        markets={marketList}
        initialMarketId={DEFAULT_MARKET}
        cropPrices={cropPrices}
        marketComparisons={comparisons}
        interestedCropIds={interestedCropIds}
      />
    </div>
  )
}
