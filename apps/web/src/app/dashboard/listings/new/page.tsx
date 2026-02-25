'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  ArrowLeft,
  Loader2,
  Check,
  Store,
  Building2,
  UtensilsCrossed,
  Warehouse,
  ShoppingBag,
  MapPin,
} from 'lucide-react'

const BUYER_TYPES = [
  { value: 'restaurant', label: 'レストラン', icon: UtensilsCrossed },
  { value: 'hotel', label: 'ホテル', icon: Building2 },
  { value: 'direct_sales', label: '直売所', icon: Store },
  { value: 'ja', label: 'JA', icon: Warehouse },
  { value: 'market', label: '市場', icon: ShoppingBag },
  { value: 'supermarket', label: 'スーパー', icon: ShoppingBag },
  { value: 'chain_hq', label: 'チェーン本部', icon: Building2 },
]

const PRICE_LEVELS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'medium_high', label: '中〜高' },
  { value: 'high', label: '高' },
]

const CROP_OPTIONS = [
  '飛騨ねぎ', '飛騨紅かぶ', 'ほうれん草', 'トマト', 'きゅうり',
  'なす', 'キャベツ', 'レタス', 'ブロッコリー', 'にんじん',
  'だいこん', 'いちご', '有機野菜', '地元野菜全般', '季節の山菜',
]

export default function NewBuyerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [demandCrops, setDemandCrops] = useState<string[]>([])
  const [priceLevel, setPriceLevel] = useState('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [distance, setDistance] = useState('')
  const [monthlyVolume, setMonthlyVolume] = useState('')

  function toggleCrop(crop: string) {
    setDemandCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    )
  }

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      // ユーザーのorganization_idを取得
      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      const { data, error: insertError } = await supabase
        .from('buyers')
        .insert({
          name: name.trim(),
          type: type || null,
          demand_crops: demandCrops,
          price_level: priceLevel || null,
          contact: contact || null,
          description: description || null,
          distance: distance || null,
          monthly_volume: monthlyVolume ? parseInt(monthlyVolume, 10) : null,
          organization_id: profile?.organization_id ?? user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/dashboard/listings/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <DashboardHeader
        title="取引先を追加"
        description="新しい取引先を登録"
      />

      <div className="p-6 max-w-3xl space-y-6">
        <button
          onClick={() => router.push('/dashboard/listings')}
          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧に戻る
        </button>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-500" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">取引先名 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：道の駅 飛騨古川いぶし"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">種別</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {BUYER_TYPES.map((bt) => {
                    const Icon = bt.icon
                    return (
                      <button
                        key={bt.value}
                        onClick={() => setType(bt.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          type === bt.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {bt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    距離
                  </label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="例：5km"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">月間取扱量 (kg)</label>
                  <input
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    placeholder="例：500"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demand & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>需要・価格</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">価格帯</label>
                <div className="flex gap-2">
                  {PRICE_LEVELS.map((pl) => (
                    <button
                      key={pl.value}
                      onClick={() => setPriceLevel(pl.value)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        priceLevel === pl.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {pl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">求める作物</label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map((crop) => {
                    const selected = demandCrops.includes(crop)
                    return (
                      <button
                        key={crop}
                        onClick={() => toggleCrop(crop)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {crop}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>連絡先・メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">連絡先・納品方法</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="例：毎朝9時までに納品"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">メモ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="自由メモ"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            登録する
          </button>
        </div>
      </div>
    </div>
  )
}
