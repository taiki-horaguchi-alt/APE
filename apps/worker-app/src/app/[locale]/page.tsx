'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Briefcase, FileText, Package, AlertCircle, Cloud } from 'lucide-react'

export default function Dashboard() {
  const t = useTranslations()

  const modules = [
    {
      id: 'tasks',
      title: t('dashboard.tasks'),
      icon: Briefcase,
      href: '/dashboard/tasks',
      color: 'bg-blue-500',
    },
    {
      id: 'reports',
      title: t('dashboard.reports'),
      icon: FileText,
      href: '/dashboard/reports',
      color: 'bg-green-500',
    },
    {
      id: 'materials',
      title: t('dashboard.materials'),
      icon: Package,
      href: '/dashboard/materials',
      color: 'bg-purple-500',
    },
    {
      id: 'emergency',
      title: t('dashboard.emergency'),
      icon: AlertCircle,
      href: '/dashboard/emergency',
      color: 'bg-red-500',
    },
    {
      id: 'weather',
      title: t('dashboard.weather'),
      icon: Cloud,
      href: '/dashboard/weather',
      color: 'bg-cyan-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-slate-300 text-sm">
            {t('dashboard.title')}
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 gap-4">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.id}
                href={module.href}
                className="group"
              >
                <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors border border-slate-600 hover:border-slate-500">
                  <div className="flex items-center gap-3">
                    <div className={`${module.color} p-3 rounded-lg text-white`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-white font-semibold">
                        {module.title}
                      </h2>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* User Info (placeholder) */}
        <div className="mt-8 bg-slate-700 rounded-lg p-4 border border-slate-600">
          <p className="text-slate-300 text-xs">
            Version 0.1.0 | PWA Enabled
          </p>
        </div>
      </div>
    </div>
  )
}
