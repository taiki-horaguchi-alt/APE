import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getConversations } from '@/lib/supabase/queries'
import {
  MessageCircle,
  Store,
  Building2,
  UtensilsCrossed,
  Warehouse,
  ShoppingBag,
  MapPin,
  Plus,
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

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default async function ChatPage() {
  const conversations = await getConversations().catch(() => [])

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="メッセージ"
        description="取引先とのやり取り"
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            {conversations.length}件の取引先
          </p>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              取引先を追加
            </Button>
          </Link>
        </div>

        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const typeConfig = TYPE_CONFIG[conv.buyerType ?? ''] ?? {
                label: conv.buyerType ?? '',
                icon: MapPin,
                color: 'text-neutral-600 bg-neutral-50',
              }
              const TypeIcon = typeConfig.icon

              return (
                <Link key={conv.buyerId} href={`/dashboard/chat/${conv.buyerId}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-neutral-800 truncate">
                              {conv.buyerName}
                            </h3>
                            {conv.lastMessageAt && (
                              <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-500 truncate">
                              {conv.lastMessage ?? 'メッセージはまだありません'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="flex-shrink-0 ml-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
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
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">メッセージはありません</h3>
              <p className="text-neutral-400 mb-6">取引先を追加してメッセージを始めましょう</p>
              <Link href="/dashboard/listings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  取引先を追加
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
