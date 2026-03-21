'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

export default function ReportsPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 mt-4">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-300 text-sm mb-2 inline-block"
          >
            ← {t('common.back')}
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {t('reports.title')}
          </h1>
        </div>

        {/* Action Button */}
        <Link href="/dashboard/reports/new" className="mb-6">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus size={20} />
            {t('reports.submitReport')}
          </button>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="text-slate-400 text-xs mb-1">This Week</div>
            <div className="text-white text-xl font-bold">5</div>
            <div className="text-slate-500 text-xs">Reports</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="text-slate-400 text-xs mb-1">This Month</div>
            <div className="text-white text-xl font-bold">18</div>
            <div className="text-slate-500 text-xs">Reports</div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-6">
          <h2 className="text-slate-300 font-semibold mb-3 text-sm">
            Recent Reports
          </h2>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-700 rounded-lg p-3 border border-slate-600"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {`2026-03-0${4 - i}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {i * 2} hours worked
                    </p>
                  </div>
                  <TrendingUp className="text-green-400" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
