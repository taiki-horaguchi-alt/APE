'use client'

import { Bell, Search } from 'lucide-react'

export interface DashboardHeaderProps {
  title: string
  subtitle?: string
  description?: string
}

export function DashboardHeader({ title, subtitle, description }: DashboardHeaderProps) {
  const sub = subtitle ?? description
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {sub && (
          <p className="text-sm text-neutral-500">{sub}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="検索..."
            className="pl-10 pr-4 py-2 w-64 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
