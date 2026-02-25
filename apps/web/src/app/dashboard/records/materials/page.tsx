'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Bug,
  Droplets,
  Plus,
  Search,
  AlertTriangle,
  Shield,
  ChevronLeft,
  Beaker,
  Leaf,
  Clock,
  Hash,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ---- 農薬データベース ----

interface Pesticide {
  id: string
  name: string
  activeIngredient: string
  type: 'insecticide' | 'fungicide' | 'herbicide' | 'acaricide'
  targetPests: string[]
  applicableCrops: { crop: string; maxCount: number; safetyDays: number }[]
  dilution: string
  precautions: string
}

const PESTICIDE_TYPES: Record<string, { label: string; color: string }> = {
  insecticide: { label: '殺虫剤', color: 'text-red-600 bg-red-50' },
  fungicide: { label: '殺菌剤', color: 'text-purple-600 bg-purple-50' },
  herbicide: { label: '除草剤', color: 'text-orange-600 bg-orange-50' },
  acaricide: { label: '殺ダニ剤', color: 'text-yellow-600 bg-yellow-50' },
}

const DEMO_PESTICIDES: Pesticide[] = [
  {
    id: 'p1',
    name: 'アファーム乳剤',
    activeIngredient: 'エマメクチン安息香酸塩',
    type: 'insecticide',
    targetPests: ['コナジラミ', 'アザミウマ', 'ハモグリバエ'],
    applicableCrops: [
      { crop: 'トマト', maxCount: 2, safetyDays: 3 },
      { crop: 'きゅうり', maxCount: 2, safetyDays: 1 },
      { crop: 'なす', maxCount: 3, safetyDays: 3 },
    ],
    dilution: '1000〜2000倍',
    precautions: 'ミツバチに影響あり。散布後は訪花昆虫に注意。',
  },
  {
    id: 'p2',
    name: 'ダコニール1000',
    activeIngredient: 'TPN（クロロタロニル）',
    type: 'fungicide',
    targetPests: ['疫病', 'べと病', '灰色かび病', '炭疽病'],
    applicableCrops: [
      { crop: 'トマト', maxCount: 4, safetyDays: 3 },
      { crop: 'きゅうり', maxCount: 5, safetyDays: 7 },
      { crop: 'キャベツ', maxCount: 5, safetyDays: 14 },
    ],
    dilution: '1000倍',
    precautions: '高温時の散布は薬害の恐れあり。',
  },
  {
    id: 'p3',
    name: 'ベストガード粒剤',
    activeIngredient: 'ニテンピラム',
    type: 'insecticide',
    targetPests: ['アブラムシ', 'コナジラミ'],
    applicableCrops: [
      { crop: 'トマト', maxCount: 1, safetyDays: 3 },
      { crop: 'きゅうり', maxCount: 1, safetyDays: 1 },
      { crop: 'ほうれん草', maxCount: 1, safetyDays: 14 },
    ],
    dilution: '株元処理 1g/株',
    precautions: '定植時処理。他のネオニコチノイド系との連用注意。',
  },
  {
    id: 'p4',
    name: 'ラウンドアップマックスロード',
    activeIngredient: 'グリホサートカリウム塩',
    type: 'herbicide',
    targetPests: ['一年生雑草', '多年生雑草'],
    applicableCrops: [
      { crop: '非選択性（全作物間）', maxCount: 3, safetyDays: 0 },
    ],
    dilution: '25〜100倍',
    precautions: '作物にかからないよう注意。',
  },
]

// ---- 肥料データベース ----

interface Fertilizer {
  id: string
  name: string
  type: 'chemical' | 'organic' | 'compound' | 'liquid'
  npk: { n: number; p: number; k: number }
  applicationRate: string
  timing: string
  notes: string
}

const FERTILIZER_TYPES: Record<string, { label: string; color: string }> = {
  chemical: { label: '化成肥料', color: 'text-blue-600 bg-blue-50' },
  organic: { label: '有機肥料', color: 'text-green-600 bg-green-50' },
  compound: { label: '配合肥料', color: 'text-indigo-600 bg-indigo-50' },
  liquid: { label: '液肥', color: 'text-cyan-600 bg-cyan-50' },
}

const DEMO_FERTILIZERS: Fertilizer[] = [
  {
    id: 'f1',
    name: 'NK化成 S604',
    type: 'chemical',
    npk: { n: 16, p: 0, k: 14 },
    applicationRate: '10〜20kg/10a',
    timing: '追肥（生育中期）',
    notes: '速効性。窒素・カリ補給に。',
  },
  {
    id: 'f2',
    name: '有機入り配合 8-8-8',
    type: 'compound',
    npk: { n: 8, p: 8, k: 8 },
    applicationRate: '80〜120kg/10a',
    timing: '元肥',
    notes: '有機質30%以上。土づくりにも効果。',
  },
  {
    id: 'f3',
    name: '発酵鶏糞',
    type: 'organic',
    npk: { n: 3, p: 6, k: 3 },
    applicationRate: '100〜200kg/10a',
    timing: '元肥（定植2週間前）',
    notes: '完熟品を使用。未熟品はガス障害の恐れ。',
  },
  {
    id: 'f4',
    name: 'ハイポネックス原液',
    type: 'liquid',
    npk: { n: 6, p: 10, k: 5 },
    applicationRate: '500〜1000倍希釈',
    timing: '追肥（週1回）',
    notes: '葉面散布も可能。',
  },
]

// ---- 使用履歴（栽培記録と連動） ----

interface UsageRecord {
  id: string
  date: string
  pesticideName: string
  crop: string
  field: string
  currentCount: number
  maxCount: number
}

const DEMO_USAGE: UsageRecord[] = [
  { id: 'u1', date: '2025-05-08', pesticideName: 'アファーム乳剤', crop: 'なす', field: '第1圃場', currentCount: 1, maxCount: 3 },
  { id: 'u2', date: '2025-04-20', pesticideName: 'ダコニール1000', crop: 'トマト', field: '第1圃場', currentCount: 2, maxCount: 4 },
  { id: 'u3', date: '2025-04-15', pesticideName: 'ダコニール1000', crop: 'トマト', field: '第1圃場', currentCount: 1, maxCount: 4 },
  { id: 'u4', date: '2025-04-10', pesticideName: 'ベストガード粒剤', crop: 'きゅうり', field: '第2圃場', currentCount: 1, maxCount: 1 },
]

type Tab = 'pesticides' | 'fertilizers' | 'usage'

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pesticides')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageRecords()
  }, [])

  async function loadUsageRecords() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Get user profile to get organization_id
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.organization_id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('cultivation_records')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('type', 'pesticide')
        .is('deleted_at', null)
        .order('record_date', { ascending: false })

      if (error) throw error

      // Map records to usage format and group by pesticide + crop + field
      const usageMap: Record<string, UsageRecord> = {}

      ;(data ?? []).forEach((record: any) => {
        const key = `${record.pesticide_name}-${record.crop_id}-${record.field_id}`
        if (!usageMap[key]) {
          usageMap[key] = {
            id: record.id,
            date: record.record_date,
            pesticideName: record.pesticide_name || 'Unknown',
            crop: record.crop_id || 'Unknown',
            field: record.field_id || 'Unknown',
            currentCount: 1,
            maxCount: 3,
          }
        } else {
          usageMap[key].currentCount += 1
        }
      })

      setUsageRecords(Object.values(usageMap))
    } catch (err) {
      console.error('Failed to load usage records:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { value: Tab; label: string; icon: typeof Bug }[] = [
    { value: 'pesticides', label: '農薬データベース', icon: Bug },
    { value: 'fertilizers', label: '肥料データベース', icon: Droplets },
    { value: 'usage', label: '使用履歴・残回数', icon: Clock },
  ]

  const filteredPesticides = DEMO_PESTICIDES.filter(p =>
    searchQuery === '' ||
    p.name.includes(searchQuery) ||
    p.activeIngredient.includes(searchQuery) ||
    p.targetPests.some(t => t.includes(searchQuery))
  )

  const filteredFertilizers = DEMO_FERTILIZERS.filter(f =>
    searchQuery === '' ||
    f.name.includes(searchQuery) ||
    f.notes.includes(searchQuery)
  )

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="資材管理"
        description="農薬・肥料のデータベース・使用履歴"
      />

      <div className="p-6 max-w-5xl">
        {/* Back link */}
        <Link
          href="/dashboard/records"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          栽培記録に戻る
        </Link>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setSearchQuery('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        {activeTab !== 'usage' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'pesticides' ? '農薬名・成分名・対象病害虫で検索...' : '肥料名・用途で検索...'}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        )}

        {/* Pesticide Database */}
        {activeTab === 'pesticides' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{filteredPesticides.length}件の農薬</p>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                農薬を追加
              </Button>
            </div>

            {filteredPesticides.map(pesticide => (
              <PesticideCard key={pesticide.id} pesticide={pesticide} />
            ))}
          </div>
        )}

        {/* Fertilizer Database */}
        {activeTab === 'fertilizers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{filteredFertilizers.length}件の肥料</p>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                肥料を追加
              </Button>
            </div>

            {filteredFertilizers.map(fertilizer => (
              <FertilizerCard key={fertilizer.id} fertilizer={fertilizer} />
            ))}
          </div>
        )}

        {/* Usage History */}
        {activeTab === 'usage' && (
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="w-12 h-12 text-neutral-300 mx-auto mb-4 animate-spin" />
                  <p className="text-neutral-500">使用履歴を読み込み中...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Warnings */}
                <Card className="border-warning-200 bg-warning-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-warning-800 mb-1">使用回数に注意</h4>
                        <div className="space-y-1">
                          {usageRecords.filter(u => u.currentCount >= u.maxCount).map(u => (
                            <p key={u.id} className="text-sm text-warning-700">
                              {u.pesticideName}（{u.crop}）: {u.currentCount}/{u.maxCount}回 — 上限に達しています
                            </p>
                          ))}
                          {usageRecords.filter(u => u.currentCount >= u.maxCount).length === 0 && (
                            <p className="text-sm text-warning-700">現在、上限に達した農薬はありません。</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">農薬使用履歴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageRecords.length === 0 ? (
                      <p className="text-center text-neutral-500 py-8">農薬使用記録がありません</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-neutral-200">
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">日付</th>
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">農薬名</th>
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">品目</th>
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">圃場</th>
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">使用回数</th>
                              <th className="text-left py-3 px-2 font-medium text-neutral-600">状態</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usageRecords.map(record => {
                              const isAtLimit = record.currentCount >= record.maxCount
                              const isNearLimit = record.currentCount >= record.maxCount - 1
                              return (
                                <tr key={record.id} className="border-b border-neutral-100">
                                  <td className="py-3 px-2 text-neutral-600">{record.date}</td>
                                  <td className="py-3 px-2 font-medium text-neutral-800">{record.pesticideName}</td>
                                  <td className="py-3 px-2 text-neutral-600">{record.crop}</td>
                                  <td className="py-3 px-2 text-neutral-600">{record.field}</td>
                                  <td className="py-3 px-2">
                                    <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-neutral-800'}`}>
                                      {record.currentCount}/{record.maxCount}回
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    {isAtLimit ? (
                                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                        <X className="w-3 h-3" />
                                        上限到達
                                      </span>
                                    ) : isNearLimit ? (
                                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                        <AlertTriangle className="w-3 h-3" />
                                        残り1回
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        <Check className="w-3 h-3" />
                                        使用可能
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Safety Period Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">安全使用期間カレンダー</CardTitle>
              </CardHeader>
              <CardContent>
                {usageRecords.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">使用記録がありません</p>
                ) : (
                  <div className="space-y-3">
                    {usageRecords.slice(0, 5).map((record) => (
                      <SafetyPeriodRow
                        key={record.id}
                        pesticideName={record.pesticideName}
                        crop={record.crop}
                        lastApplied={record.date}
                        safetyDays={3}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Sub Components ----

function PesticideCard({ pesticide }: { pesticide: Pesticide }) {
  const [expanded, setExpanded] = useState(false)
  const typeInfo = PESTICIDE_TYPES[pesticide.type]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-800">{pesticide.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              </div>
              <p className="text-sm text-neutral-500 mb-1">有効成分: {pesticide.activeIngredient}</p>
              <div className="flex flex-wrap gap-1">
                {pesticide.targetPests.map(pest => (
                  <span key={pest} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                    {pest}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {expanded ? '閉じる' : '詳細'}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">希釈倍率</p>
                <p className="text-sm font-medium">{pesticide.dilution}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">注意事項</p>
                <p className="text-sm text-neutral-600">{pesticide.precautions}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mb-2">適用作物・使用回数制限</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-2 text-xs text-neutral-500">作物</th>
                    <th className="text-left py-2 px-2 text-xs text-neutral-500">使用回数上限</th>
                    <th className="text-left py-2 px-2 text-xs text-neutral-500">安全使用期間</th>
                  </tr>
                </thead>
                <tbody>
                  {pesticide.applicableCrops.map(ac => (
                    <tr key={ac.crop} className="border-b border-neutral-50">
                      <td className="py-2 px-2 font-medium">{ac.crop}</td>
                      <td className="py-2 px-2">{ac.maxCount}回以内</td>
                      <td className="py-2 px-2">{ac.safetyDays}日前まで</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FertilizerCard({ fertilizer }: { fertilizer: Fertilizer }) {
  const typeInfo = FERTILIZER_TYPES[fertilizer.type]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
            <Droplets className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-800">{fertilizer.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>

            {/* NPK Bar */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-blue-600 w-4">N</span>
                <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(fertilizer.npk.n * 4, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-600">{fertilizer.npk.n}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-red-600 w-4">P</span>
                <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.min(fertilizer.npk.p * 4, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-600">{fertilizer.npk.p}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-green-600 w-4">K</span>
                <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(fertilizer.npk.k * 4, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-600">{fertilizer.npk.k}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-neutral-500">施用量</p>
                <p className="font-medium">{fertilizer.applicationRate}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">時期</p>
                <p className="font-medium">{fertilizer.timing}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">備考</p>
                <p className="text-neutral-600">{fertilizer.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SafetyPeriodRow({
  pesticideName,
  crop,
  lastApplied,
  safetyDays,
}: {
  pesticideName: string
  crop: string
  lastApplied: string
  safetyDays: number
}) {
  const appliedDate = new Date(lastApplied)
  const safeDate = new Date(appliedDate.getTime() + safetyDays * 86400000)
  const today = new Date()
  const isSafe = today >= safeDate
  const daysRemaining = Math.max(0, Math.ceil((safeDate.getTime() - today.getTime()) / 86400000))

  return (
    <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isSafe ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {isSafe ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-800">
          {pesticideName} → {crop}
        </p>
        <p className="text-xs text-neutral-500">
          最終散布: {lastApplied} / 安全使用期間: {safetyDays}日
        </p>
      </div>
      <div className="text-right">
        {isSafe ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            収穫可能
          </span>
        ) : (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
            あと{daysRemaining}日
          </span>
        )}
      </div>
    </div>
  )
}
