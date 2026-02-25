'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Plus,
  Download,
  Eye,
  Send,
  Check,
  Clock,
  AlertCircle,
  Package,
  Printer,
  Copy,
  Store,
  PieChart,
  Loader2,
} from 'lucide-react'

// ---- Types ----

type InvoiceType = 'invoice' | 'delivery_note'
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

interface InvoiceItem {
  name: string
  quantity: string
  unit: string
  unitPrice: number
  amount: number
}

interface Invoice {
  id: string
  type: InvoiceType
  number: string
  buyerName: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
}

const TYPE_CONFIG: Record<InvoiceType, { label: string }> = {
  invoice: { label: '請求書' },
  delivery_note: { label: '納品書' },
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: typeof Check }> = {
  draft: { label: '下書き', color: 'bg-neutral-100 text-neutral-600', icon: FileText },
  sent: { label: '送付済み', color: 'bg-blue-100 text-blue-600', icon: Send },
  paid: { label: '入金済み', color: 'bg-green-100 text-green-600', icon: Check },
  overdue: { label: '期限超過', color: 'bg-red-100 text-red-600', icon: AlertCircle },
}

const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    type: 'invoice',
    number: 'INV-2025-001',
    buyerName: '和食ダイニング 山田',
    issueDate: '2025-05-01',
    dueDate: '2025-05-31',
    status: 'sent',
    items: [
      { name: 'トマト（桃太郎）', quantity: '10', unit: 'kg', unitPrice: 500, amount: 5000 },
      { name: 'きゅうり', quantity: '8', unit: 'kg', unitPrice: 350, amount: 2800 },
      { name: 'なす（千両二号）', quantity: '6', unit: 'kg', unitPrice: 400, amount: 2400 },
    ],
    subtotal: 10200,
    tax: 816,
    total: 11016,
    notes: '5月分 野菜納品代',
  },
  {
    id: 'inv2',
    type: 'invoice',
    number: 'INV-2025-002',
    buyerName: 'ホテルグリーンパレス',
    issueDate: '2025-05-01',
    dueDate: '2025-05-31',
    status: 'paid',
    items: [
      { name: 'トマト（桃太郎）', quantity: '30', unit: 'kg', unitPrice: 480, amount: 14400 },
      { name: 'ほうれん草', quantity: '15', unit: 'kg', unitPrice: 600, amount: 9000 },
      { name: 'ブロッコリー', quantity: '20', unit: 'kg', unitPrice: 450, amount: 9000 },
    ],
    subtotal: 32400,
    tax: 2592,
    total: 34992,
    notes: '5月分 契約野菜納品代',
  },
  {
    id: 'inv3',
    type: 'delivery_note',
    number: 'DN-2025-015',
    buyerName: '和食ダイニング 山田',
    issueDate: '2025-05-15',
    dueDate: '',
    status: 'sent',
    items: [
      { name: 'トマト（桃太郎）', quantity: '5', unit: 'kg', unitPrice: 500, amount: 2500 },
      { name: 'きゅうり', quantity: '3', unit: 'kg', unitPrice: 350, amount: 1050 },
    ],
    subtotal: 3550,
    tax: 284,
    total: 3834,
    notes: '5/15配送分',
  },
  {
    id: 'inv4',
    type: 'invoice',
    number: 'INV-2025-003',
    buyerName: 'JA大阪',
    issueDate: '2025-04-30',
    dueDate: '2025-05-15',
    status: 'overdue',
    items: [
      { name: 'トマト', quantity: '100', unit: 'kg', unitPrice: 350, amount: 35000 },
      { name: 'きゅうり', quantity: '80', unit: 'kg', unitPrice: 280, amount: 22400 },
    ],
    subtotal: 57400,
    tax: 4592,
    total: 61992,
    notes: '4月分 JA出荷精算',
  },
]

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<InvoiceType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all')
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null)

  // Load invoices from Supabase
  useEffect(() => {
    async function loadInvoices() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('ログインが必要です')

        const { data: userProfile } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!userProfile?.organization_id) throw new Error('組織情報がありません')

        const { data: invoiceList, error: err } = await supabase
          .from('invoices')
          .select('*, buyer:buyers(name)')
          .eq('organization_id', userProfile.organization_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (err) throw err

        const mappedInvoices = (invoiceList ?? []).map(inv => ({
          id: inv.id,
          type: inv.type as InvoiceType,
          number: inv.number,
          buyerName: inv.buyer?.name || 'Unknown',
          issueDate: inv.issue_date,
          dueDate: inv.due_date || '',
          status: inv.status as InvoiceStatus,
          items: inv.items || [],
          subtotal: inv.subtotal || 0,
          tax: inv.tax || 0,
          total: inv.total || 0,
          notes: inv.notes || '',
        }))

        setInvoices(mappedInvoices)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadInvoices()
  }, [])

  const filtered = invoices
    .filter(inv => filterType === 'all' || inv.type === filterType)
    .filter(inv => filterStatus === 'all' || inv.status === filterStatus)

  const totalRevenue = invoices
    .filter(inv => inv.type === 'invoice')
    .reduce((sum, inv) => sum + inv.total, 0)

  const paidAmount = invoices
    .filter(inv => inv.type === 'invoice' && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader
          title="請求・納品"
          description="請求書と納品書を管理"
        />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (previewInvoice) {
    return (
      <div className="min-h-screen">
        <DashboardHeader
          title={`${TYPE_CONFIG[previewInvoice.type as InvoiceType].label} ${previewInvoice.number}`}
          description={previewInvoice.buyerName}
        />
        <div className="p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
              戻る
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-1" />
                印刷
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button size="sm">
                <Send className="w-4 h-4 mr-1" />
                送付
              </Button>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="bg-white border border-neutral-200 rounded-lg p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">
                  {TYPE_CONFIG[previewInvoice.type as InvoiceType].label}
                </h2>
                <p className="text-neutral-500 mt-1">{previewInvoice.number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">発行日</p>
                <p className="font-medium">{previewInvoice.issueDate}</p>
                {previewInvoice.dueDate && (
                  <>
                    <p className="text-xs text-neutral-500 mt-2">支払期限</p>
                    <p className="font-medium">{previewInvoice.dueDate}</p>
                  </>
                )}
              </div>
            </div>

            {/* To / From */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-neutral-500 mb-1">宛先</p>
                <p className="text-lg font-semibold">{previewInvoice.buyerName} 御中</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 mb-1">発行元</p>
                <p className="font-semibold">〇〇農園</p>
                <p className="text-sm text-neutral-500">大阪府南河内郡</p>
                <p className="text-sm text-neutral-500">TEL: 072-XXX-XXXX</p>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-primary-600 mb-1">ご請求金額（税込）</p>
              <p className="text-3xl font-bold text-primary-700">
                ¥{previewInvoice.total.toLocaleString()}
              </p>
            </div>

            {/* Items */}
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-2 px-2 font-medium text-neutral-600">品名</th>
                  <th className="text-right py-2 px-2 font-medium text-neutral-600">数量</th>
                  <th className="text-right py-2 px-2 font-medium text-neutral-600">単価</th>
                  <th className="text-right py-2 px-2 font-medium text-neutral-600">金額</th>
                </tr>
              </thead>
              <tbody>
                {(previewInvoice.items as InvoiceItem[]).map((item, idx) => (
                  <tr key={idx} className="border-b border-neutral-100">
                    <td className="py-3 px-2">{item.name}</td>
                    <td className="py-3 px-2 text-right">{item.quantity}{item.unit}</td>
                    <td className="py-3 px-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-medium">¥{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-neutral-600">小計</span>
                  <span>¥{previewInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-neutral-600">消費税（8%）</span>
                  <span>¥{previewInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-neutral-800">
                  <span>合計</span>
                  <span>¥{previewInvoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {previewInvoice.notes && (
              <div className="mt-8 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1">備考</p>
                <p className="text-sm text-neutral-600">{previewInvoice.notes}</p>
              </div>
            )}

            {/* Bank Info */}
            {previewInvoice.type === 'invoice' && (
              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-500 mb-2">お振込先</p>
                <p className="text-sm">〇〇銀行 △△支店 普通 1234567</p>
                <p className="text-sm">口座名義: 〇〇農園</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="請求・納品管理"
        description="請求書・納品書の作成・管理"
      />

      <div className="p-6 max-w-5xl">
        {/* Related Pages */}
        <div className="flex gap-2 mb-4">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              <Store className="w-4 h-4 mr-1" />
              取引先管理
            </Button>
          </Link>
          <Link href="/dashboard/proposals">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-1" />
              提案書
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline" size="sm">
              <PieChart className="w-4 h-4 mr-1" />
              経営分析
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">今月の売上</p>
              <p className="text-xl font-bold text-neutral-800">¥{totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">入金済み</p>
              <p className="text-xl font-bold text-green-600">¥{paidAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">未入金</p>
              <p className="text-xl font-bold text-blue-600">¥{(totalRevenue - paidAmount).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-neutral-500 mb-1">期限超過</p>
              <p className="text-xl font-bold text-red-600">¥{overdueAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <div className="flex gap-1">
              {(['all', 'invoice', 'delivery_note'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'all' ? 'すべて' : TYPE_CONFIG[type].label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status === 'all' ? '全ステータス' : STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-1" />
              納品書
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              請求書
            </Button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {filtered.map(invoice => {
            const statusConfig = STATUS_CONFIG[invoice.status as InvoiceStatus]
            const StatusIcon = statusConfig.icon
            return (
              <Card
                key={invoice.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setPreviewInvoice(invoice)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            {TYPE_CONFIG[invoice.type as InvoiceType].label}
                          </span>
                          <span className="font-medium text-neutral-800">{invoice.number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">{invoice.buyerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-800">¥{invoice.total.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400">
                        {invoice.issueDate}
                        {invoice.dueDate && ` / 期限: ${invoice.dueDate}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-600 mb-2">書類がありません</h3>
                <p className="text-neutral-400 mb-6">請求書・納品書を作成しましょう</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  最初の請求書を作成
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
