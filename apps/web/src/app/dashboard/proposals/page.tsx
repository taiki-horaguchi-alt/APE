'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Download,
  Eye,
  Plus,
  Store,
  Leaf,
  TrendingUp,
  Calendar,
  Star,
  BarChart3,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Receipt,
  Loader2,
} from 'lucide-react'

// ---- Types ----

interface Proposal {
  id: string
  title: string
  buyerName: string
  buyerType: string
  createdAt: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  crops: string[]
  totalVolume: string
  totalAmount: string
}

interface ProposalTemplate {
  id: string
  name: string
  description: string
  icon: typeof FileText
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-neutral-100 text-neutral-600' },
  sent: { label: '送信済み', color: 'bg-blue-100 text-blue-600' },
  accepted: { label: '成約', color: 'bg-green-100 text-green-600' },
  rejected: { label: '不成立', color: 'bg-red-100 text-red-600' },
}

const TEMPLATES: ProposalTemplate[] = [
  { id: 'seasonal', name: '旬の野菜提案', description: '今月の旬の品目を中心に提案', icon: Leaf },
  { id: 'annual', name: '年間供給プラン', description: '年間を通じた安定供給計画を提案', icon: Calendar },
  { id: 'organic', name: '有機・特別栽培提案', description: '有機栽培・特別栽培の付加価値提案', icon: Star },
  { id: 'volume', name: '大量出荷提案', description: '大口取引先向けのボリュームディスカウント提案', icon: Package },
]

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: 'pr1',
    title: '6月旬の夏野菜セット提案',
    buyerName: '和食ダイニング 山田',
    buyerType: 'restaurant',
    createdAt: '2025-05-14',
    status: 'sent',
    crops: ['トマト', 'きゅうり', 'なす'],
    totalVolume: '月30kg',
    totalAmount: '¥45,000',
  },
  {
    id: 'pr2',
    title: '年間契約プラン 2025',
    buyerName: 'ホテルグリーンパレス',
    buyerType: 'hotel',
    createdAt: '2025-05-10',
    status: 'accepted',
    crops: ['トマト', 'ほうれん草', 'ブロッコリー', 'いちご'],
    totalVolume: '月100kg',
    totalAmount: '¥180,000',
  },
  {
    id: 'pr3',
    title: '直売所向け少量多品目プラン',
    buyerName: '道の駅あおぞら',
    buyerType: 'direct_sales',
    createdAt: '2025-05-08',
    status: 'draft',
    crops: ['きゅうり', 'なす', 'ねぎ'],
    totalVolume: '週10kg',
    totalAmount: '¥12,000',
  },
  {
    id: 'pr4',
    title: 'JA出荷計画書',
    buyerName: 'JA大阪',
    buyerType: 'ja',
    createdAt: '2025-04-28',
    status: 'accepted',
    crops: ['トマト', 'きゅうり'],
    totalVolume: '月200kg',
    totalAmount: '¥160,000',
  },
]

// ---- 生成プレビュー用のデモデータ ----

interface CropProposalItem {
  name: string
  season: string
  volume: string
  unitPrice: string
  total: string
  feature: string
}

const DEMO_PROPOSAL_ITEMS: CropProposalItem[] = [
  { name: 'トマト（桃太郎）', season: '6月〜10月', volume: '月10kg', unitPrice: '¥500/kg', total: '¥5,000', feature: '完熟収穫。糖度8以上。' },
  { name: 'きゅうり', season: '6月〜9月', volume: '月10kg', unitPrice: '¥350/kg', total: '¥3,500', feature: '朝採り。曲がり品なし。' },
  { name: 'なす（千両二号）', season: '6月〜10月', volume: '月10kg', unitPrice: '¥400/kg', total: '¥4,000', feature: '焼きなす・天ぷら向け。' },
]

export default function ProposalsPage() {
  const supabase = createClient()
  const [proposals, setProposals] = useState<any[]>([])
  const [buyers, setBuyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showGenerator, setShowGenerator] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [organizationId, setOrganizationId] = useState('')

  // Load proposals and buyers from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('ログインが必要です')

        const { data: userProfile } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!userProfile?.organization_id) throw new Error('組織情報がありません')
        setOrganizationId(userProfile.organization_id)

        // Load proposals
        const { data: proposalList, error: propErr } = await supabase
          .from('proposals')
          .select('*, buyer:buyers(name, type)')
          .eq('organization_id', userProfile.organization_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (propErr) throw propErr

        const mappedProposals = (proposalList ?? []).map(p => ({
          id: p.id,
          title: p.title,
          buyerName: p.buyer?.name || 'Unknown',
          buyerType: p.buyer?.type || '',
          createdAt: new Date(p.created_at).toISOString().split('T')[0],
          status: p.status,
          crops: p.crops || [],
          totalVolume: p.total_volume || '',
          totalAmount: p.total_amount ? `¥${p.total_amount.toLocaleString()}` : '¥0',
        }))

        setProposals(mappedProposals)

        // Load buyers
        const { data: buyerList, error: buyerErr } = await supabase
          .from('buyers')
          .select('id, name')
          .eq('organization_id', userProfile.organization_id)
          .is('deleted_at', null)

        if (buyerErr) throw buyerErr
        setBuyers(buyerList ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProposals = filterStatus === 'all'
    ? proposals
    : proposals.filter(p => p.status === filterStatus)

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="提案書管理"
        description="取引先への提案書を作成・管理"
      />

      <div className="p-6 max-w-5xl">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && (
        <>
        {/* Related Pages */}
        <div className="flex gap-2 mb-4">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              <Store className="w-4 h-4 mr-1" />
              取引先管理
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <Receipt className="w-4 h-4 mr-1" />
              請求・納品
            </Button>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['all', 'draft', 'sent', 'accepted'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status === 'all' ? 'すべて' : STATUS_CONFIG[status]?.label ?? status}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            提案書を作成
          </Button>
        </div>

        {/* Generator */}
        {showGenerator && !showPreview && (
          <Card className="mb-6 border-primary-200">
            <CardHeader>
              <CardTitle>提案書テンプレートを選択</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {TEMPLATES.map(tpl => {
                  const Icon = tpl.icon
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedTemplate === tpl.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <h4 className="font-medium text-neutral-800">{tpl.name}</h4>
                      </div>
                      <p className="text-sm text-neutral-500">{tpl.description}</p>
                    </button>
                  )
                })}
              </div>

              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">提案先</label>
                      <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                        <option value="">取引先を選択</option>
                        {buyers.map(buyer => (
                          <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">提案期間</label>
                      <select className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                        <option value="monthly">月次</option>
                        <option value="quarterly">四半期</option>
                        <option value="annual">年間</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setShowGenerator(false); setSelectedTemplate(null) }}>
                      キャンセル
                    </Button>
                    <Button onClick={() => setShowPreview(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      プレビュー生成
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {showPreview && (
          <Card className="mb-6 border-primary-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>提案書プレビュー</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setShowPreview(false); setShowGenerator(false); setSelectedTemplate(null) }}>
                  閉じる
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  PDF出力
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Proposal Document Preview */}
              <div className="bg-white border border-neutral-200 rounded-lg p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-2">旬の夏野菜提案書</h2>
                  <p className="text-neutral-500">2025年6月</p>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">提案先</p>
                    <p className="font-semibold text-lg">和食ダイニング 山田 様</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 mb-1">提案元</p>
                    <p className="font-semibold">〇〇農園</p>
                    <p className="text-sm text-neutral-500">大阪府南河内郡</p>
                  </div>
                </div>

                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    いつもお世話になっております。当農園の6月以降の夏野菜について、
                    以下の品目をご提案させていただきます。すべて圃場から直送で鮮度を保ち、
                    完熟収穫にこだわっております。
                  </p>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    提案品目
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-neutral-50">
                          <th className="text-left py-2 px-3 border border-neutral-200 font-medium">品目</th>
                          <th className="text-left py-2 px-3 border border-neutral-200 font-medium">出荷時期</th>
                          <th className="text-left py-2 px-3 border border-neutral-200 font-medium">数量</th>
                          <th className="text-left py-2 px-3 border border-neutral-200 font-medium">単価</th>
                          <th className="text-left py-2 px-3 border border-neutral-200 font-medium">小計</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_PROPOSAL_ITEMS.map(item => (
                          <tr key={item.name}>
                            <td className="py-2 px-3 border border-neutral-200">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-neutral-500">{item.feature}</p>
                            </td>
                            <td className="py-2 px-3 border border-neutral-200">{item.season}</td>
                            <td className="py-2 px-3 border border-neutral-200">{item.volume}</td>
                            <td className="py-2 px-3 border border-neutral-200">{item.unitPrice}</td>
                            <td className="py-2 px-3 border border-neutral-200 font-medium">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary-50">
                          <td colSpan={4} className="py-2 px-3 border border-neutral-200 font-semibold text-right">
                            月額合計
                          </td>
                          <td className="py-2 px-3 border border-neutral-200 font-bold text-primary-700">
                            ¥12,500
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Delivery */}
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    配送条件
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-500 text-xs">配送頻度</p>
                      <p className="font-medium">週2回（火・金）</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-500 text-xs">配送方法</p>
                      <p className="font-medium">自社配送（冷蔵便）</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-500 text-xs">最低注文量</p>
                      <p className="font-medium">1回5kg以上</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded">
                      <p className="text-neutral-500 text-xs">支払条件</p>
                      <p className="font-medium">月末締め翌月末払い</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    当農園の強み
                  </h3>
                  <ul className="space-y-2">
                    {[
                      '朝採り即日配送で鮮度抜群',
                      '減農薬栽培（慣行の50%以下）',
                      '土壌分析に基づく最適な栄養管理',
                      '品目の追加・変更にも柔軟に対応',
                    ].map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        {!showPreview && (
          <div className="space-y-3">
            {filteredProposals.map(proposal => {
              const statusConfig = STATUS_CONFIG[proposal.status]
              return (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-neutral-800">{proposal.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 mb-1">{proposal.buyerName}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {(proposal.crops as string[]).map((crop: string) => (
                                <span key={crop} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                  {crop}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-neutral-800">{proposal.totalAmount}</p>
                        <p className="text-xs text-neutral-500">{proposal.totalVolume}</p>
                        <p className="text-xs text-neutral-400 mt-1">{proposal.createdAt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {filteredProposals.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">提案書がありません</h3>
                  <p className="text-neutral-400 mb-6">取引先への提案書を作成しましょう</p>
                  <Button onClick={() => setShowGenerator(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    提案書を作成
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats */}
        {!showGenerator && !showPreview && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {proposals.filter(p => p.status === 'accepted').length}
                </p>
                <p className="text-sm text-neutral-500">成約</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {proposals.filter(p => p.status === 'sent').length}
                </p>
                <p className="text-sm text-neutral-500">送信済み</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-neutral-600">
                  {proposals.filter(p => p.status === 'draft').length}
                </p>
                <p className="text-sm text-neutral-500">下書き</p>
              </CardContent>
            </Card>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
