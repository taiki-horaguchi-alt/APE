'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'

const MOCK_CONTACTS = [
  {
    id: '1',
    name: '山田 農業法人 代表',
    phone: '090-1234-5678',
    type: 'manager',
    available24h: true,
  },
  {
    id: '2',
    name: '救急車',
    phone: '119',
    type: 'emergency',
    available24h: true,
  },
  {
    id: '3',
    name: '警察',
    phone: '110',
    type: 'police',
    available24h: true,
  },
]

export default function EmergencyPage() {
  const t = useTranslations()

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

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
            {t('emergency.title')}
          </h1>
        </div>

        {/* Send Location Button */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mb-6">
          <MapPin size={20} />
          {t('emergency.sendLocation')}
        </button>

        {/* Contacts List */}
        <div className="space-y-3">
          {MOCK_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-700 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-white font-semibold text-sm">
                    {contact.name}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {contact.phone}
                  </p>
                  {contact.available24h && (
                    <p className="text-green-400 text-xs mt-2">
                      24時間対応
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCall(contact.phone)}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                >
                  <Phone size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
