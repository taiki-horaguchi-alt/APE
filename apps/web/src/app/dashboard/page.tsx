import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
  BarChart3,
  Leaf,
  AlertTriangle,
  Sun,
  CloudRain,
  Cloud,
  Thermometer,
  Droplets,
  Store,
  Lightbulb,
  Calendar,
  ClipboardList,
  CheckSquare,
  PieChart,
  Receipt,
  FileText,
} from 'lucide-react'
import { getCrops, getLatestMarketPrices, getCurrentUser, getUserProfile, getBuyers } from '@/lib/supabase/queries'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'おはようございます'
  if (hour < 18) return 'こんにちは'
  return 'こんばんは'
}

function getTodayString(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[now.getDay()]
  return `${month}月${day}日（${weekday}）`
}

export default async function DashboardPage() {
  const greeting = getTimeGreeting()
  const todayStr = getTodayString()

  const [crops, marketPrices, user, buyers] = await Promise.all([
    getCrops().catch(() => []),
    getLatestMarketPrices().catch(() => []),
    getCurrentUser().catch(() => null),
    getBuyers().catch(() => []),
  ])

  const profile = user ? await getUserProfile(user.id).catch(() => null) : null

  const cropNameMap = new Map(
    (crops ?? []).map(c => [c.id, c.name])
  )

  const marketTrends = marketPrices.length > 0
    ? marketPrices.slice(0, 5).map(p => ({
        name: cropNameMap.get(p.cropId) ?? p.cropId,
        price: p.price,
        change: p.change,
        trend: p.trend,
      }))
    : [
        { name: 'ネギ', price: 400, change: 5.2, trend: 'up' as const },
        { name: 'キャベツ', price: 80, change: -2.1, trend: 'down' as const },
        { name: 'トマト', price: 350, change: 3.5, trend: 'up' as const },
        { name: 'ほうれん草', price: 280, change: -1.2, trend: 'down' as const },
      ]

  const interestedCrops = profile?.interested_crops ?? []
  const recommendedCrops = (crops ?? []).slice(0, 3).map((crop, index) => ({
    id: crop.id,
    name: crop.name,
    score: Math.max(95 - index * 7, 70),
    emoji: getCropEmoji(crop.id),
    reason: getRecommendReason(crop.id, index),
  }))

  const farmName = profile?.farm_name ?? user?.user_metadata?.farm_name ?? '農園'

  const risers = marketTrends.filter(t => t.trend === 'up').slice(0, 2)
  const fallers = marketTrends.filter(t => t.trend === 'down').slice(0, 2)
  const buyerCount = buyers.length

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title={`${greeting}、${farmName}さん`}
        subtitle={todayStr}
      />

      <div className="p-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Weather */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <p className="text-sm font-medium text-neutral-600">今日の天気</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-800">28°C</p>
                  <p className="text-xs text-neutral-500">晴れ時々曇り</p>
                </div>
                <div className="text-right text-xs text-neutral-500 space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <Thermometer className="w-3 h-3" />
                    <span>最高 32° / 最低 22°</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Droplets className="w-3 h-3" />
                    <span>降水確率 10%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-neutral-100">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">明日</p>
                  <CloudRain className="w-4 h-4 text-blue-400 mx-auto my-1" />
                  <p className="text-xs font-medium">24°</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">明後日</p>
                  <Sun className="w-4 h-4 text-yellow-500 mx-auto my-1" />
                  <p className="text-xs font-medium">30°</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">3日後</p>
                  <Cloud className="w-4 h-4 text-neutral-400 mx-auto my-1" />
                  <p className="text-xs font-medium">26°</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <p className="text-sm font-medium text-neutral-600">注目の市況</p>
              </div>
              {risers.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-danger-600 font-medium mb-1">上昇中</p>
                  {risers.map(r => (
                    <div key={r.name} className="flex justify-between text-sm">
                      <span className="text-neutral-700">{r.name}</span>
                      <span className="text-danger-600 font-medium">+{r.change}%</span>
                    </div>
                  ))}
                </div>
              )}
              {fallers.length > 0 && (
                <div>
                  <p className="text-xs text-info-600 font-medium mb-1">下落中</p>
                  {fallers.map(f => (
                    <div key={f.name} className="flex justify-between text-sm">
                      <span className="text-neutral-700">{f.name}</span>
                      <span className="text-info-600 font-medium">{f.change}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm font-medium text-neutral-600">アラート</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                  <span className="text-xs">🌧️</span>
                  <p className="text-xs text-yellow-800">明日は降水確率80%。収穫作業の前倒しを検討</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                  <span className="text-xs">🌡️</span>
                  <p className="text-xs text-red-800">今週末、最高気温35°予報。遮光対策の確認を</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <p className="text-sm font-medium text-neutral-600 mb-3">クイックアクション</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/records">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    栽培記録
                  </Button>
                </Link>
                <Link href="/dashboard/tasks">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    タスク管理
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <PieChart className="w-4 h-4 mr-1" />
                    経営分析
                  </Button>
                </Link>
                <Link href="/dashboard/calendar">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Calendar className="w-4 h-4 mr-1" />
                    カレンダー
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  注目の情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <span className="text-2xl">🥦</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">ブロッコリーの作付面積が全国で+3.2%増加</p>
                      <p className="text-sm text-neutral-500">指定野菜への追加で需要拡大中。新規就農者にもおすすめ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <span className="text-2xl">📊</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">有機野菜の需要が前年比+12%</p>
                      <p className="text-sm text-neutral-500">スーパー・生協向けの有機認証取得が差別化のカギ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <span className="text-2xl">🌾</span>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800">飛騨地方：今年の降水量は平年比105%</p>
                      <p className="text-sm text-neutral-500">排水対策を重点的に。根腐れリスクに注意</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>市況トレンド</CardTitle>
                <Link href="/dashboard/market">
                  <Button variant="ghost" size="sm" className="text-primary-600">
                    詳細を見る
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-neutral-500 border-b border-neutral-100">
                        <th className="pb-3 font-medium">品目</th>
                        <th className="pb-3 font-medium text-right">価格</th>
                        <th className="pb-3 font-medium text-right">変動</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketTrends.map((item) => (
                        <tr key={item.name} className="border-b border-neutral-50 last:border-0">
                          <td className="py-3 font-medium text-neutral-800">
                            {item.name}
                            {interestedCrops.includes(item.name) && (
                              <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">MY</span>
                            )}
                          </td>
                          <td className="py-3 text-right text-neutral-800">¥{item.price}/kg</td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
                              item.trend === 'up' ? 'bg-danger-50 text-danger-600' : 'bg-info-50 text-info-600'
                            }`}>
                              {item.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary-500" />
                  今後の作業
                </CardTitle>
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" size="sm" className="text-primary-600">
                    すべて見る
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <TaskItem title="トマトの追肥" date="明日" priority="high" />
                  <TaskItem title="きゅうりの収穫" date="3日後" priority="medium" />
                  <TaskItem title="土壌pH測定" date="1週間後" priority="low" />
                </div>
                <Link href="/dashboard/tasks">
                  <Button variant="outline" className="w-full mt-4">タスク管理を開く</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recommended Crops */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  今おすすめの品目
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedCrops.length > 0 ? (
                    recommendedCrops.map((crop, index) => (
                      <div key={crop.id} className={`p-3 rounded-lg ${index === 0 ? 'bg-primary-50 border border-primary-100' : 'bg-neutral-50'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{crop.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-neutral-800">{crop.name}</p>
                              <span className="text-xs font-bold text-primary-600">適合度 {crop.score}%</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">{crop.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 text-center py-4">プロフィールを設定すると提案が表示されます</p>
                  )}
                </div>
                <Link href="/dashboard/simulator">
                  <Button variant="secondary" className="w-full mt-4">シミュレーションで検証</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Sales Channel Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary-500" />
                  販路サマリー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold text-neutral-800">{buyerCount}</p>
                  <p className="text-sm text-neutral-500">登録済みの取引先</p>
                </div>
                {buyers.slice(0, 3).map(buyer => (
                  <div key={buyer.id} className="flex items-center justify-between py-2 border-t border-neutral-100">
                    <span className="text-sm font-medium text-neutral-700">{buyer.name}</span>
                    {buyer.match_score != null && (
                      <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">{buyer.match_score}%</span>
                    )}
                  </div>
                ))}
                <Link href="/dashboard/listings">
                  <Button variant="outline" className="w-full mt-3">
                    取引先を管理
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskItem({ title, date, priority }: { title: string; date: string; priority: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${
        priority === 'high' ? 'bg-danger-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-neutral-300'
      }`} />
      <div className="flex-1">
        <p className="font-medium text-neutral-800 text-sm">{title}</p>
        <p className="text-xs text-neutral-500">{date}</p>
      </div>
    </div>
  )
}

function getCropEmoji(cropId: string): string {
  const emojiMap: Record<string, string> = {
    tomato: '🍅', mini_tomato: '🍅', cucumber: '🥒', eggplant: '🍆',
    green_pepper: '🫑', summer_spinach: '🥬', winter_spinach: '🥬',
    edamame: '🫛', okra: '🌿', corn: '🌽', negi: '🧅', cabbage: '🥬',
    daikon: '🥕', carrot: '🥕', hakusai: '🥬', broccoli: '🥦',
    strawberry: '🍓', kabu: '🥕',
  }
  return emojiMap[cropId] ?? '🌱'
}

function getRecommendReason(cropId: string, index: number): string {
  const reasons: Record<string, string> = {
    tomato: '市場価格上昇中・需要安定',
    broccoli: '指定野菜追加で作付面積増・高収益',
    negi: '飛騨の気候に最適・販路豊富',
    cucumber: '夏場の回転率が高い',
    eggplant: '直売所で人気・差別化しやすい',
    strawberry: '高単価・観光農園との相性良い',
    cabbage: '大量出荷可能・市場需要安定',
  }
  return reasons[cropId] ?? ['土壌適合度が高い', '気候条件に適合', '需要が安定している'][index % 3]
}
