'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  MapPin,
  Map,
  BarChart3,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Store,
  MessageCircle,
  ClipboardList,
  CheckSquare,
  FileText,
  Receipt,
  PieChart,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { createClient } from '@/lib/supabase/client'
import { useSidebarConfig } from '@/hooks/useSidebarConfig'
import { SidebarCustomizeModal } from './SidebarCustomizeModal'

interface NavItem {
  href: string
  icon: typeof Home
  label: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const allNavSections: NavSection[] = [
  {
    items: [
      { href: '/dashboard', icon: Home, label: 'ホーム' },
      { href: '/dashboard/calendar', icon: Calendar, label: 'カレンダー' },
    ],
  },
  {
    title: '栽培',
    items: [
      { href: '/dashboard/land-match', icon: MapPin, label: '土地診断' },
      { href: '/dashboard/map', icon: Map, label: 'マップ' },
      { href: '/dashboard/simulator', icon: BarChart3, label: 'シミュレーター' },
      { href: '/dashboard/market', icon: TrendingUp, label: 'マーケット' },
      { href: '/dashboard/records', icon: ClipboardList, label: '栽培記録' },
    ],
  },
  {
    title: '取引・経営',
    items: [
      { href: '/dashboard/listings', icon: Store, label: '取引先管理' },
      { href: '/dashboard/proposals', icon: FileText, label: '提案書' },
      { href: '/dashboard/invoices', icon: Receipt, label: '請求・納品' },
      { href: '/dashboard/analytics', icon: PieChart, label: '経営分析' },
    ],
  },
  {
    title: '管理',
    items: [
      { href: '/dashboard/tasks', icon: CheckSquare, label: 'タスク管理' },
      { href: '/dashboard/chat', icon: MessageCircle, label: 'メッセージ' },
    ],
  },
]

const bottomNavItems = [
  { href: '/dashboard/settings', icon: Settings, label: '設定' },
  { href: '/help', icon: HelpCircle, label: 'ヘルプ' },
]

interface SidebarProps {
  userInfo: {
    farmName: string
    email: string
  }
  unreadCount?: number
}

export function Sidebar({ userInfo, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const { isEnabled, isAlwaysVisible, toggle, resetToDefault, loaded } = useSidebarConfig()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // フィルタ: 有効なアイテムだけ残し、空セクションは除外
  const filteredSections = allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => loaded ? isEnabled(item.href) : ['/dashboard', '/dashboard/calendar', '/dashboard/records', '/dashboard/listings', '/dashboard/tasks'].includes(item.href)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <>
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0">
        {/* Logo + Customize */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-primary-600">APE</span>
          </Link>
          <button
            onClick={() => setCustomizeOpen(true)}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            title="メニューをカスタマイズ"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredSections.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? 'mt-4' : ''}>
              {section.title && (
                <p className="px-4 mb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        )}
                      >
                        <item.icon className="w-4.5 h-4.5" />
                        <span className="flex-1">{item.label}</span>
                        {item.href === '/dashboard/chat' && unreadCount > 0 && (
                          <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-neutral-100">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                ログアウト
              </button>
            </li>
          </ul>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary-600">
                {userInfo.farmName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">{userInfo.farmName}</p>
              <p className="text-sm text-neutral-500 truncate">{userInfo.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <SidebarCustomizeModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        sections={allNavSections}
        isEnabled={isEnabled}
        isAlwaysVisible={isAlwaysVisible}
        onToggle={toggle}
        onReset={resetToDefault}
      />
    </>
  )
}
