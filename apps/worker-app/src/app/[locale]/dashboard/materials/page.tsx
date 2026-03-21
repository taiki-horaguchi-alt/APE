'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { QrCode, AlertTriangle } from 'lucide-react'

const MOCK_MATERIALS = [
  {
    id: '1',
    name: 'トマト用農薬A',
    productCode: 'PES-001',
    category: 'insecticide',
    safetyLevel: 'high',
  },
  {
    id: '2',
    name: 'カリウム肥料',
    productCode: 'FER-002',
    category: 'fertilizer',
    safetyLevel: 'low',
  },
]

export default function MaterialsPage() {
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
            {t('materials.title')}
          </h1>
        </div>

        {/* QR Scan Button */}
        <Link href="/dashboard/materials/scan" className="mb-6">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <QrCode size={20} />
            {t('materials.scanQR')}
          </button>
        </Link>

        {/* Materials List */}
        <div className="space-y-3">
          {MOCK_MATERIALS.map((material) => (
            <Link
              key={material.id}
              href={`/dashboard/materials/${material.id}`}
              className="block"
            >
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-white font-semibold text-sm">
                      {material.name}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      {material.productCode}
                    </p>
                  </div>
                  {material.safetyLevel === 'high' && (
                    <AlertTriangle className="text-orange-400" size={20} />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
