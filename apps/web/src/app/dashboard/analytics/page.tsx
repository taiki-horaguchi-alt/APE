'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Receipt,
  Store,
} from 'lucide-react'

// ---- Types ----

type Period = 'monthly' | 'quarterly' | 'yearly'

interface MonthlySummary {
  month: string
  revenue: number
  cost: number
  profit: number
  shipments: number
}

interface CropSalesData {
  crop: string
  revenue: number
  volume: string
  ratio: number
  trend: 'up' | 'down' | 'flat'
}

interface BuyerSalesData {
  buyer: string
  type: string
  revenue: number
  ratio: number
}

// ---- Demo Data ----

const MONTHLY_DATA: MonthlySummary[] = [
  { month: '2025-01', revenue: 120000, cost: 45000, profit: 75000, shipments: 12 },
  { month: '2025-02', revenue: 95000, cost: 38000, profit: 57000, shipments: 10 },
  { month: '2025-03', revenue: 180000, cost: 62000, profit: 118000, shipments: 18 },
  { month: '2025-04', revenue: 250000, cost: 85000, profit: 165000, shipments: 25 },
  { month: '2025-05', revenue: 310000, cost: 95000, profit: 215000, shipments: 30 },
]

const CROP_SALES: CropSalesData[] = [
  { crop: 'トマト', revenue: 185000, volume: '370kg', ratio: 38, trend: 'up' },
  { crop: 'きゅうり', revenue: 112000, volume: '320kg', ratio: 23, trend: 'up' },
  { crop: 'ほうれん草', revenue: 78000, volume: '130kg', ratio: 16, trend: 'flat' },
  { crop: 'なす', revenue: 62000, volume: '155kg', ratio: 13, trend: 'down' },
  { crop: 'ブロッコリー', revenue: 48000, volume: '107kg', ratio: 10, trend: 'up' },
]

const BUYER_SALES: BuyerSalesData[] = [
  { buyer: 'ホテルグリーンパレス', type: 'hotel', revenue: 180000, ratio: 37 },
  { buyer: 'JA大阪', type: 'ja', revenue: 125000, ratio: 26 },
  { buyer: '和食ダイニング 山田', type: 'restaurant', revenue: 85000, ratio: 17 },
  { buyer: '道の駅あおぞら', type: 'direct_sales', revenue: 55000, ratio: 11 },
  { buyer: 'その他', type: 'other', revenue: 40000, ratio: 9 },
]

const COST_BREAKDOWN = [
  { category: '肥料・農薬', amount: 35000, ratio: 37 },
  { category: '種苗', amount: 18000, ratio: 19 },
  { category: '人件費', amount: 22000, ratio: 23 },
  { category: '配送費', amount: 12000, ratio: 13 },
  { category: 'その他', amount: 8000, ratio: 8 },
]

const COLORS = [
  'bg-primary-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
]

const COST_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-neutral-400',
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('monthly')

  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2]

  const revenueChange = prevMonth.revenue > 0
    ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
    : 0

  const profitChange = prevMonth.profit > 0
    ? Math.round(((currentMonth.profit - prevMonth.profit) / prevMonth.profit) * 100)
    : 0

  const costChange = prevMonth.cost > 0
    ? Math.round(((currentMonth.cost - prevMonth.cost) / prevMonth.cost) * 100)
    : 0

  const profitMargin = currentMonth.revenue > 0
    ? Math.round((currentMonth.profit / currentMonth.revenue) * 100)
    : 0

  const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue))

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="経営分析"
        description="売上・経費・利益の推移"
      />

      <div className="p-6 max-w-6xl">
        {/* Related Pages */}
        <div className="flex gap-2 mb-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <Receipt className="w-4 h-4 mr-1" />
              請求・納品
            </Button>
          </Link>
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              <Store className="w-4 h-4 mr-1" />
              取引先管理
            </Button>
          </Link>
        </div>

        {/* Period Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {([
              { value: 'monthly' as Period, label: '月次' },
              { value: 'quarterly' as Period, label: '四半期' },
              { value: 'yearly' as Period, label: '年次' },
            ]).map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            レポート出力
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KPICard
            label="今月の売上"
            value={`¥${currentMonth.revenue.toLocaleString()}`}
            change={revenueChange}
            icon={<DollarSign className="w-5 h-5" />}
            iconBg="bg-primary-50 text-primary-600"
          />
          <KPICard
            label="今月の利益"
            value={`¥${currentMonth.profit.toLocaleString()}`}
            change={profitChange}
            icon={<TrendingUp className="w-5 h-5" />}
            iconBg="bg-green-50 text-green-600"
          />
          <KPICard
            label="経費"
            value={`¥${currentMonth.cost.toLocaleString()}`}
            change={costChange}
            icon={<BarChart3 className="w-5 h-5" />}
            iconBg="bg-orange-50 text-orange-600"
          />
          <KPICard
            label="利益率"
            value={`${profitMargin}%`}
            change={profitMargin - (prevMonth.revenue > 0 ? Math.round((prevMonth.profit / prevMonth.revenue) * 100) : 0)}
            icon={<PieChart className="w-5 h-5" />}
            iconBg="bg-blue-50 text-blue-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-base">売上・経費・利益推移</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MONTHLY_DATA.map(month => {
                  const monthLabel = month.month.replace('2025-', '')
                  return (
                    <div key={month.month} className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 w-8">{monthLabel}月</span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex items-center gap-1 flex-1">
                          <div
                            className="h-6 bg-primary-400 rounded-sm"
                            style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs w-56">
                        <span className="text-primary-600 w-20 text-right">¥{(month.revenue / 1000).toFixed(0)}k</span>
                        <span className="text-orange-600 w-16 text-right">-¥{(month.cost / 1000).toFixed(0)}k</span>
                        <span className="text-green-600 w-16 text-right font-medium">¥{(month.profit / 1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-6 mt-4 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <div className="w-3 h-3 bg-primary-400 rounded-sm" />
                  売上
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                  経費
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <div className="w-3 h-3 bg-green-400 rounded-sm" />
                  利益
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">経費内訳</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Visual Pie Chart */}
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {COST_BREAKDOWN.map((item, idx) => (
                  <div
                    key={item.category}
                    className={`${COST_COLORS[idx]} transition-all`}
                    style={{ width: `${item.ratio}%` }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {COST_BREAKDOWN.map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${COST_COLORS[idx]}`} />
                      <span className="text-sm text-neutral-700">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">¥{item.amount.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400 ml-2">{item.ratio}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Crop Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">品目別売上</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Horizontal Stacked Bar */}
              <div className="flex h-6 rounded-full overflow-hidden mb-4">
                {CROP_SALES.map((crop, idx) => (
                  <div
                    key={crop.crop}
                    className={`${COLORS[idx]} transition-all`}
                    style={{ width: `${crop.ratio}%` }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {CROP_SALES.map((crop, idx) => (
                  <div key={crop.crop} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${COLORS[idx]}`} />
                      <span className="text-sm font-medium text-neutral-700">{crop.crop}</span>
                      <span className="text-xs text-neutral-400">{crop.volume}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">¥{crop.revenue.toLocaleString()}</span>
                      {crop.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                      {crop.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                      {crop.trend === 'flat' && <Minus className="w-3 h-3 text-neutral-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Buyer Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">取引先別売上</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Horizontal Stacked Bar */}
              <div className="flex h-6 rounded-full overflow-hidden mb-4">
                {BUYER_SALES.map((buyer, idx) => (
                  <div
                    key={buyer.buyer}
                    className={`${COLORS[idx]} transition-all`}
                    style={{ width: `${buyer.ratio}%` }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {BUYER_SALES.map((buyer, idx) => (
                  <div key={buyer.buyer} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${COLORS[idx]}`} />
                      <span className="text-sm font-medium text-neutral-700">{buyer.buyer}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">¥{buyer.revenue.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400 ml-2">{buyer.ratio}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year-over-Year */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">前年同月比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: '売上', current: 310000, lastYear: 240000 },
                { label: '経費', current: 95000, lastYear: 88000 },
                { label: '利益', current: 215000, lastYear: 152000 },
                { label: '出荷回数', current: 30, lastYear: 22 },
                { label: '取引先数', current: 5, lastYear: 3 },
              ].map(item => {
                const change = item.lastYear > 0
                  ? Math.round(((item.current - item.lastYear) / item.lastYear) * 100)
                  : 0
                const isPositive = item.label === '経費' ? change < 0 : change > 0
                return (
                  <div key={item.label} className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-neutral-800">
                      {typeof item.current === 'number' && item.label !== '出荷回数' && item.label !== '取引先数'
                        ? `¥${item.current.toLocaleString()}`
                        : item.current}
                    </p>
                    <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {change > 0 ? '+' : ''}{change}% vs 前年
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---- Sub Components ----

function KPICard({
  label,
  value,
  change,
  icon,
  iconBg,
}: {
  label: string
  value: string
  change: number
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-neutral-400'
          }`}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
        <p className="text-xl font-bold text-neutral-800">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

function Download({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
