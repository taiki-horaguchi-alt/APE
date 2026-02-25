'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  Trash2,
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

interface BuyerForm {
  name: string
  type: string
  demandCrops: string[]
  priceLevel: string
  contact: string
  description: string
  distance: string
  monthlyVolume: string
}

export default function BuyerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<BuyerForm>({
    name: '',
    type: '',
    demandCrops: [],
    priceLevel: '',
    contact: '',
    description: '',
    distance: '',
    monthlyVolume: '',
  })

  useEffect(() => {
    async function loadBuyer() {
      try {
        const { data, error: fetchError } = await supabase
          .from('buyers')
          .select('*')
          .eq('id', id)
          .is('deleted_at', null)
          .single()

        if (fetchError) throw fetchError

        setForm({
          name: data.name ?? '',
          type: data.type ?? '',
          demandCrops: data.demand_crops ?? [],
          priceLevel: data.price_level ?? '',
          contact: data.contact ?? '',
          description: data.description ?? '',
          distance: data.distance ?? '',
          monthlyVolume: data.monthly_volume?.toString() ?? '',
        })
      } catch (err) {
        setError('取引先が見つかりません')
      } finally {
        setLoading(false)
      }
    }

    loadBuyer()
  }, [id])

  function toggleCrop(crop: string) {
    setForm((prev) => ({
      ...prev,
      demandCrops: prev.demandCrops.includes(crop)
        ? prev.demandCrops.filter((c) => c !== crop)
        : [...prev.demandCrops, crop],
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('buyers')
        .update({
          name: form.name,
          type: form.type || null,
          demand_crops: form.demandCrops,
          price_level: form.priceLevel || null,
          contact: form.contact || null,
          description: form.description || null,
          distance: form.distance || null,
          monthly_volume: form.monthlyVolume ? parseInt(form.monthlyVolume, 10) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('この取引先を削除しますか？')) return
    setDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('buyers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (deleteError) throw deleteError

      router.push('/dashboard/listings')
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="取引先編集"
        description={form.name || '取引先情報を編集'}
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* Back Button */}
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">取引先名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">種別</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {BUYER_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setForm({ ...form, type: type.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          form.type === type.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
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
                    value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    placeholder="例：5km"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">月間取扱量 (kg)</label>
                  <input
                    type="number"
                    value={form.monthlyVolume}
                    onChange={(e) => setForm({ ...form, monthlyVolume: e.target.value })}
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
                      onClick={() => setForm({ ...form, priceLevel: pl.value })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.priceLevel === pl.value
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
                    const selected = form.demandCrops.includes(crop)
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

        {/* Contact & Notes */}
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
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="例：毎朝9時までに納品"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">メモ</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="自由メモ"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            保存しました
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            削除
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            保存する
          </button>
        </div>
      </div>
    </div>
  )
}
