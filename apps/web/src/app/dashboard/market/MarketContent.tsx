'use client'

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Filter,
  BarChart3,
  Globe,
  Package,
} from 'lucide-react'

interface CropPrice {
  cropId: string
  cropName: string
  emoji: string
  price: number
  change: number
  trend: 'up' | 'down'
  history: number[]
}

interface Market {
  id: string
  name: string
}

interface MarketComparison {
  marketId: string
  marketName: string
  price: number
  change: number
}

interface MarketContentProps {
  markets: Market[]
  initialMarketId: string
  cropPrices: CropPrice[]
  marketComparisons: MarketComparison[]
  interestedCropIds: string[]
}

// 業界動向データ（将来的にAPIから取得）
const INDUSTRY_TRENDS = [
  { label: '全国野菜出荷量', value: '前年比 98.2%', trend: 'down' as const, detail: '天候不順による減少' },
  { label: '輸入野菜量', value: '前年比 103.5%', trend: 'up' as const, detail: '円安の影響で増加傾向' },
  { label: '有機野菜需要', value: '前年比 112%', trend: 'up' as const, detail: '消費者の健康志向が継続' },
  { label: '直売所売上', value: '前年比 106%', trend: 'up' as const, detail: '地産地消ブームが追い風' },
]

export function MarketContent({
  markets,
  initialMarketId,
  cropPrices,
  marketComparisons,
  interestedCropIds,
}: MarketContentProps) {
  const [selectedMarket, setSelectedMarket] = useState(initialMarketId)
  const [selectedCropId, setSelectedCropId] = useState(cropPrices[0]?.cropId ?? '')
  const [showMarketDropdown, setShowMarketDropdown] = useState(false)
  const [filterMycrops, setFilterMycrops] = useState(false)

  const filteredPrices = useMemo(() => {
    if (!filterMycrops || interestedCropIds.length === 0) return cropPrices
    return cropPrices.filter(p => interestedCropIds.includes(p.cropId))
  }, [cropPrices, filterMycrops, interestedCropIds])

  const selectedCrop = useMemo(
    () => cropPrices.find(p => p.cropId === selectedCropId),
    [cropPrices, selectedCropId]
  )

  const selectedMarketName = markets.find(m => m.id === selectedMarket)?.name ?? ''

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Price List */}
        <div className="space-y-6">
          {/* Market Selector */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">市場:</span>
                <div className="relative">
                  <button
                    onClick={() => setShowMarketDropdown(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <span className="font-medium">{selectedMarketName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showMarketDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                      {markets.map(market => (
                        <button
                          key={market.id}
                          onClick={() => {
                            setSelectedMarket(market.id)
                            setShowMarketDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedMarket === market.id
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-neutral-700'
                          }`}
                        >
                          {market.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Toggle */}
          <button
            onClick={() => setFilterMycrops(prev => !prev)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              filterMycrops
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            設定した品目のみ表示
            {filterMycrops && interestedCropIds.length > 0 && (
              <span className="ml-auto text-xs bg-primary-500 text-white rounded-full px-2 py-0.5">
                {interestedCropIds.length}品目
              </span>
            )}
          </button>

          {/* Price List */}
          <Card>
            <CardHeader>
              <CardTitle>品目別トレンド</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPrices.length > 0 ? (
                filteredPrices.map(item => (
                  <button
                    key={item.cropId}
                    onClick={() => setSelectedCropId(item.cropId)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedCropId === item.cropId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="font-medium text-neutral-800">
                          {item.cropName}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-800">
                          ¥{item.price}/kg
                        </p>
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            item.change > 0 ? 'text-danger-600' : 'text-info-600'
                          }`}
                        >
                          {item.change > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {item.change > 0 ? '+' : ''}
                            {item.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Mini chart */}
                    {item.history.length > 1 && (
                      <div className="flex items-end gap-1 mt-3 h-8">
                        {item.history.slice(-7).map((value, index, arr) => {
                          const max = Math.max(...arr)
                          const min = Math.min(...arr)
                          const height =
                            ((value - min) / (max - min || 1)) * 100 || 50

                          return (
                            <div
                              key={index}
                              className={`flex-1 rounded-sm ${
                                index === arr.length - 1
                                  ? item.change > 0
                                    ? 'bg-danger-400'
                                    : 'bg-info-400'
                                  : 'bg-neutral-300'
                              }`}
                              style={{ height: `${Math.max(20, height)}%` }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-neutral-500 text-sm text-center py-8">
                  {filterMycrops
                    ? '設定された品目の価格データがありません'
                    : '価格データがありません'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Crop Info */}
          {selectedCrop && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedCrop.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-800">
                        {selectedCrop.cropName}
                      </h2>
                      <p className="text-neutral-500">{selectedMarketName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-neutral-800">
                      ¥{selectedCrop.price}
                      <span className="text-lg font-normal text-neutral-500">
                        /kg
                      </span>
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCrop.change > 0
                          ? 'bg-danger-50 text-danger-600'
                          : 'bg-info-50 text-info-600'
                      }`}
                    >
                      {selectedCrop.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {selectedCrop.change > 0 ? '+' : ''}
                      {selectedCrop.change}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price History Chart */}
          {selectedCrop && selectedCrop.history.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>過去30日の価格推移</CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                    <span className="text-neutral-600">日別価格</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PriceChart history={selectedCrop.history} />
              </CardContent>
            </Card>
          )}

          {/* Market Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>市場別価格比較</CardTitle>
            </CardHeader>
            <CardContent>
              {marketComparisons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 font-medium text-neutral-600">
                          市場
                        </th>
                        <th className="text-right py-3 font-medium text-neutral-600">
                          最新価格
                        </th>
                        <th className="text-right py-3 font-medium text-neutral-600">
                          前日比
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketComparisons.map(comp => (
                        <tr
                          key={comp.marketId}
                          className={`border-b border-neutral-100 ${
                            comp.marketId === selectedMarket
                              ? 'bg-primary-50'
                              : ''
                          }`}
                        >
                          <td className="py-3 font-medium">
                            {comp.marketName}
                            {comp.marketId === selectedMarket && (
                              <span className="ml-2 text-xs text-primary-600">
                                (選択中)
                              </span>
                            )}
                          </td>
                          <td className="text-right py-3">
                            ¥{comp.price}/kg
                          </td>
                          <td
                            className={`text-right py-3 ${
                              comp.change > 0
                                ? 'text-danger-600'
                                : comp.change < 0
                                  ? 'text-info-600'
                                  : 'text-neutral-500'
                            }`}
                          >
                            {comp.change > 0 ? '+' : ''}
                            {comp.change}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm text-center py-8">
                  比較データがありません
                </p>
              )}
            </CardContent>
          </Card>

          {/* Industry Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                農業界の動向
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INDUSTRY_TRENDS.map((item) => (
                  <div
                    key={item.label}
                    className="p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">
                        {item.label}
                      </span>
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-danger-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-info-500" />
                      )}
                    </div>
                    <p className="text-lg font-bold text-neutral-800">
                      {item.value}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Production Volume & Planting Area Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                主要品目の作付け動向
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 font-medium text-neutral-600">品目</th>
                      <th className="text-right py-3 font-medium text-neutral-600">作付面積</th>
                      <th className="text-right py-3 font-medium text-neutral-600">前年比</th>
                      <th className="text-right py-3 font-medium text-neutral-600">生産量</th>
                      <th className="text-right py-3 font-medium text-neutral-600">前年比</th>
                    </tr>
                  </thead>
                  <tbody>
                    <PlantingRow name="トマト" area="11,800ha" areaChange={-1.2} volume="720,000t" volumeChange={-2.5} />
                    <PlantingRow name="きゅうり" area="10,300ha" areaChange={-0.8} volume="560,000t" volumeChange={1.3} />
                    <PlantingRow name="なす" area="8,900ha" areaChange={-2.1} volume="310,000t" volumeChange={-3.2} />
                    <PlantingRow name="ほうれん草" area="19,700ha" areaChange={0.5} volume="220,000t" volumeChange={2.1} />
                    <PlantingRow name="ねぎ" area="22,100ha" areaChange={1.0} volume="460,000t" volumeChange={0.8} />
                    <PlantingRow name="キャベツ" area="33,500ha" areaChange={-0.3} volume="1,460,000t" volumeChange={-1.1} />
                    <PlantingRow name="だいこん" area="31,200ha" areaChange={-1.5} volume="1,300,000t" volumeChange={-2.0} />
                    <PlantingRow name="ブロッコリー" area="16,100ha" areaChange={3.2} volume="170,000t" volumeChange={4.5} />
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-neutral-400 mt-3">
                出典：農林水産省 作物統計（概算値）
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PlantingRow({
  name,
  area,
  areaChange,
  volume,
  volumeChange,
}: {
  name: string
  area: string
  areaChange: number
  volume: string
  volumeChange: number
}) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-3 font-medium text-neutral-800">{name}</td>
      <td className="text-right py-3 text-neutral-700">{area}</td>
      <td className={`text-right py-3 ${areaChange >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
        {areaChange > 0 ? '+' : ''}{areaChange}%
      </td>
      <td className="text-right py-3 text-neutral-700">{volume}</td>
      <td className={`text-right py-3 ${volumeChange >= 0 ? 'text-primary-600' : 'text-danger-600'}`}>
        {volumeChange > 0 ? '+' : ''}{volumeChange}%
      </td>
    </tr>
  )
}

/** 価格推移バーチャート */
function PriceChart({ history }: { history: number[] }) {
  const max = Math.max(...history)
  const min = Math.min(...history)
  const range = max - min || 1

  // Y軸ラベル
  const yLabels = Array.from({ length: 5 }, (_, i) =>
    Math.round(max - (range * i) / 4)
  )

  return (
    <div className="relative h-64">
      {/* Y Axis */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-neutral-500">
        {yLabels.map((label, i) => (
          <span key={i}>¥{label}</span>
        ))}
      </div>

      {/* Chart Area */}
      <div className="ml-12 h-56 relative">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {yLabels.map((_, i) => (
            <div key={i} className="border-t border-neutral-100 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-px px-1">
          {history.map((value, index) => {
            const height = ((value - min) / range) * 80 + 10
            const isLast = index === history.length - 1
            const isUp = history.length > 1 && value >= history[history.length - 2]

            return (
              <div
                key={index}
                className={`flex-1 rounded-t-sm transition-all ${
                  isLast
                    ? isUp
                      ? 'bg-danger-400'
                      : 'bg-info-400'
                    : 'bg-primary-300 hover:bg-primary-400'
                }`}
                style={{ height: `${height}%` }}
                title={`¥${value}`}
              />
            )
          })}
        </div>
      </div>

      {/* X Axis */}
      <div className="ml-12 flex justify-between text-xs text-neutral-500 pt-2">
        <span>30日前</span>
        <span>20日前</span>
        <span>10日前</span>
        <span>今日</span>
      </div>
    </div>
  )
}
