import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Filter,
  Star,
  Phone,
  ExternalLink,
  Building2,
  Store,
  UtensilsCrossed,
  Warehouse,
} from 'lucide-react'

const buyerTypes = [
  { id: 'all', label: 'すべて', icon: null },
  { id: 'restaurant', label: 'レストラン', icon: UtensilsCrossed },
  { id: 'direct_sales', label: '直売所', icon: Store },
  { id: 'hotel', label: 'ホテル', icon: Building2 },
  { id: 'ja', label: 'JA', icon: Warehouse },
]

const buyers = [
  {
    id: '1',
    name: '道の駅 飛騨古川いぶし',
    type: 'direct_sales',
    distance: '3km',
    demandCrops: ['飛騨ねぎ', '飛騨紅かぶ', 'ほうれん草'],
    priceLevel: '中〜高',
    matchScore: 92,
    contact: '登録制・毎朝9時までに納品',
  },
  {
    id: '2',
    name: '高山グリーンホテル',
    type: 'hotel',
    distance: '12km',
    demandCrops: ['地元野菜全般', '季節の山菜'],
    priceLevel: '高',
    matchScore: 88,
    contact: '仕入れ担当: 料理長直通',
  },
  {
    id: '3',
    name: '飛騨高山まちの博物館カフェ',
    type: 'restaurant',
    distance: '10km',
    demandCrops: ['有機野菜', '珍しい品種'],
    priceLevel: '高',
    matchScore: 85,
    contact: '週1回のサンプル持ち込みOK',
  },
  {
    id: '4',
    name: 'JA飛騨 野菜集荷場',
    type: 'ja',
    distance: '8km',
    demandCrops: ['規格品全般'],
    priceLevel: '中',
    matchScore: 75,
    contact: '組合員登録が必要',
  },
  {
    id: '5',
    name: '飛騨高山宮川朝市',
    type: 'direct_sales',
    distance: '11km',
    demandCrops: ['観光客向け野菜', '加工品'],
    priceLevel: '中〜高',
    matchScore: 82,
    contact: '出店登録制・観光シーズン有利',
  },
]

function getTypeIcon(type: string) {
  switch (type) {
    case 'restaurant':
      return <UtensilsCrossed className="w-4 h-4" />
    case 'direct_sales':
      return <Store className="w-4 h-4" />
    case 'hotel':
      return <Building2 className="w-4 h-4" />
    case 'ja':
      return <Warehouse className="w-4 h-4" />
    default:
      return <MapPin className="w-4 h-4" />
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'restaurant':
      return 'レストラン'
    case 'direct_sales':
      return '直売所'
    case 'hotel':
      return 'ホテル'
    case 'ja':
      return 'JA'
    default:
      return type
  }
}

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="販路マップ"
        subtitle="近隣の取引先を探す"
      />

      <div className="p-6">
        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-neutral-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">フィルター:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {buyerTypes.map((type) => (
                  <button
                    key={type.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      type.id === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {type.icon && <type.icon className="w-4 h-4 inline mr-1" />}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-0 h-full min-h-[500px]">
                <div className="relative h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-primary-700 font-medium">
                      インタラクティブマップ
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      取引先の位置を表示
                    </p>
                  </div>

                  {/* Map Markers (Simulated) */}
                  <div className="absolute top-1/4 left-1/3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2">
                    <div className="w-8 h-8 bg-info-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="absolute bottom-1/3 right-1/3">
                    <div className="w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Current Location */}
                  <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-danger-500 rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      現在地
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buyer List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-800">
                取引先一覧 ({buyers.length}件)
              </h3>
              <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5">
                <option>マッチ度順</option>
                <option>距離順</option>
                <option>価格レベル順</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {buyers.map((buyer) => (
                <Card
                  key={buyer.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                          {getTypeIcon(buyer.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-800">
                            {buyer.name}
                          </h4>
                          <p className="text-xs text-neutral-500">
                            {getTypeLabel(buyer.type)} • {buyer.distance}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">
                          {buyer.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-neutral-500 mb-1">求める作物</p>
                      <div className="flex flex-wrap gap-1">
                        {buyer.demandCrops.map((crop) => (
                          <span
                            key={crop}
                            className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">
                        価格帯:{' '}
                        <span className="font-medium">{buyer.priceLevel}</span>
                      </span>
                      <div className="flex gap-2">
                        <button className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
