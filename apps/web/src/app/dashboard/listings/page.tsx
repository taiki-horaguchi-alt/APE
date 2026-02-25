import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getBuyers } from '@/lib/supabase/queries'
import {
  Plus,
  Star,
  Store,
  Building2,
  UtensilsCrossed,
  Warehouse,
  MapPin,
  ShoppingBag,
  FileText,
  Receipt,
  MessageCircle,
} from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Store; color: string }> = {
  restaurant: { label: 'レストラン', icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
  hotel: { label: 'ホテル', icon: Building2, color: 'text-blue-600 bg-blue-50' },
  direct_sales: { label: '直売所', icon: Store, color: 'text-green-600 bg-green-50' },
  ja: { label: 'JA', icon: Warehouse, color: 'text-yellow-600 bg-yellow-50' },
  market: { label: '市場', icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
  supermarket: { label: 'スーパー', icon: ShoppingBag, color: 'text-pink-600 bg-pink-50' },
  chain_hq: { label: 'チェーン本部', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
}

const PRICE_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  medium_high: '中〜高',
  high: '高',
}

export default async function ListingsPage() {
  const buyers = await getBuyers().catch(() => [])

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="取引先管理"
        description="取引先の一覧・登録・編集"
      />

      <div className="p-6">
        {/* Related Pages */}
        <div className="flex gap-2 mb-4">
          <Link href="/dashboard/proposals">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-1" />
              提案書
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <Receipt className="w-4 h-4 mr-1" />
              請求・納品
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              メッセージ
            </Button>
          </Link>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            {buyers.length}件の取引先
          </p>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規追加
            </Button>
          </Link>
        </div>

        {/* Buyer List */}
        {buyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buyers.map((buyer) => {
              const typeConfig = TYPE_CONFIG[buyer.type ?? ''] ?? {
                label: buyer.type ?? '不明',
                icon: MapPin,
                color: 'text-neutral-600 bg-neutral-50',
              }
              const TypeIcon = typeConfig.icon

              return (
                <Link key={buyer.id} href={`/dashboard/listings/${buyer.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800">{buyer.name}</h3>
                            <p className="text-xs text-neutral-500">{typeConfig.label}</p>
                          </div>
                        </div>
                        {buyer.match_score != null && (
                          <div className="flex items-center gap-1 bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold">{buyer.match_score}%</span>
                          </div>
                        )}
                      </div>

                      {/* Demand Crops */}
                      {buyer.demand_crops && buyer.demand_crops.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {buyer.demand_crops.slice(0, 3).map((crop: string) => (
                              <span key={crop} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                {crop}
                              </span>
                            ))}
                            {buyer.demand_crops.length > 3 && (
                              <span className="text-xs text-neutral-400">
                                +{buyer.demand_crops.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        {buyer.distance && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {buyer.distance}
                          </span>
                        )}
                        {buyer.price_level && (
                          <span>価格帯: {PRICE_LABELS[buyer.price_level] ?? buyer.price_level}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Store className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">取引先がまだありません</h3>
              <p className="text-neutral-400 mb-6">取引先を登録して販路を管理しましょう</p>
              <Link href="/dashboard/listings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  最初の取引先を追加
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
