'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Leaf,
  Bug,
  Droplets,
  Scissors,
  Truck,
  Wrench,
  Calendar as CalendarIcon,
  CheckSquare,
  ClipboardList,
  Loader2,
} from 'lucide-react'

// ---- Types ----

type EventCategory = 'planting' | 'pesticide' | 'fertilizer' | 'harvest' | 'shipping' | 'maintenance' | 'other'

interface CalendarEvent {
  id: string
  date: string
  title: string
  category: EventCategory
  field?: string
  crop?: string
  time?: string
}

const CATEGORY_CONFIG: Record<EventCategory, { label: string; icon: typeof Leaf; color: string; bgColor: string }> = {
  planting: { label: '定植', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-100' },
  pesticide: { label: '農薬', icon: Bug, color: 'text-red-600', bgColor: 'bg-red-100' },
  fertilizer: { label: '施肥', icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  harvest: { label: '収穫', icon: Scissors, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  shipping: { label: '出荷', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  maintenance: { label: '整備', icon: Wrench, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  other: { label: 'その他', icon: CalendarIcon, color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
}

// 2025年5月のデモイベント
const DEMO_EVENTS: CalendarEvent[] = [
  { id: 'e1', date: '2025-05-01', title: '有機配合肥料 施肥', category: 'fertilizer', field: '第3圃場', crop: 'ほうれん草' },
  { id: 'e2', date: '2025-05-05', title: 'ほうれん草 収穫', category: 'harvest', field: '第3圃場', crop: 'ほうれん草', time: '06:00' },
  { id: 'e3', date: '2025-05-05', title: 'JA出荷 70kg', category: 'shipping', time: '09:00' },
  { id: 'e4', date: '2025-05-08', title: 'アファーム乳剤 散布', category: 'pesticide', field: '第1圃場', crop: 'なす' },
  { id: 'e5', date: '2025-05-10', title: 'NK化成 追肥', category: 'fertilizer', field: '第2圃場', crop: 'きゅうり' },
  { id: 'e6', date: '2025-05-13', title: 'ブロッコリー 定植', category: 'planting', field: '第2圃場', crop: 'ブロッコリー' },
  { id: 'e7', date: '2025-05-14', title: 'ダコニール1000 散布', category: 'pesticide', field: '第1圃場', crop: 'なす' },
  { id: 'e8', date: '2025-05-15', title: 'トマト 大玉 定植', category: 'planting', field: '第1圃場', crop: 'トマト', time: '08:00' },
  { id: 'e9', date: '2025-05-15', title: '和食ダイニング山田 配送', category: 'shipping', time: '14:00' },
  { id: 'e10', date: '2025-05-16', title: 'きゅうり 収穫', category: 'harvest', field: '第2圃場', crop: 'きゅうり', time: '06:00' },
  { id: 'e11', date: '2025-05-17', title: '和食ダイニング山田 配送', category: 'shipping', time: '14:00' },
  { id: 'e12', date: '2025-05-18', title: '潅水設備 点検', category: 'maintenance', field: '第1圃場' },
  { id: 'e13', date: '2025-05-20', title: 'トマト 追肥', category: 'fertilizer', field: '第1圃場', crop: 'トマト' },
  { id: 'e14', date: '2025-05-22', title: 'ほうれん草 播種', category: 'planting', field: '第3圃場', crop: 'ほうれん草' },
  { id: 'e15', date: '2025-05-24', title: 'トマト 収穫開始', category: 'harvest', field: '第1圃場', crop: 'トマト', time: '06:00' },
  { id: 'e16', date: '2025-05-25', title: 'ホテル グリーンパレス 配送', category: 'shipping', time: '10:00' },
  { id: 'e17', date: '2025-05-28', title: 'きゅうり 追肥', category: 'fertilizer', field: '第2圃場', crop: 'きゅうり' },
  { id: 'e18', date: '2025-05-31', title: '5月分 経理処理', category: 'other' },
]

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarPage() {
  const supabase = createClient()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [organizationId, setOrganizationId] = useState('')

  // Load events from Supabase
  useEffect(() => {
    async function loadEvents() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('ログインが必要です')

        const { data: userProfile } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (userProfile?.organization_id) {
          setOrganizationId(userProfile.organization_id)

          // Get start and end dates for the current month
          const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
          const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

          const { data: eventList, error: err } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('organization_id', userProfile.organization_id)
            .gte('event_date', startDate)
            .lte('event_date', endDate)
            .is('deleted_at', null)
            .order('event_date', { ascending: true })

          if (err) throw err
          setEvents(eventList ?? [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [currentYear, currentMonth])

  // Calendar grid generation
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate()

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []

  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const m = currentMonth - 1 < 1 ? 12 : currentMonth - 1
    const y = currentMonth - 1 < 1 ? currentYear - 1 : currentYear
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      dateStr: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  // Next month's leading days
  const remaining = 42 - calendarDays.length
  for (let day = 1; day <= remaining; day++) {
    const m = currentMonth + 1 > 12 ? 1 : currentMonth + 1
    const y = currentMonth + 1 > 12 ? currentYear + 1 : currentYear
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  function getEventsForDate(dateStr: string): any[] {
    return events
      .filter(e => e.event_date === dateStr)
      .filter(e => filterCategory === 'all' || (e.type as EventCategory) === filterCategory)
  }

  function goToPrevMonth() {
    if (currentMonth === 1) {
      setCurrentYear(prev => prev - 1)
      setCurrentMonth(12)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
    setSelectedDate(null)
  }

  function goToNextMonth() {
    if (currentMonth === 12) {
      setCurrentYear(prev => prev + 1)
      setCurrentMonth(1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
    setSelectedDate(null)
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Event counts by category for the month
  const monthEvents = events

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="カレンダー"
        description="栽培スケジュール・作業予定"
      />

      <div className="p-6">
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
        <div className="grid grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="col-span-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-600" />
                </button>
                <h2 className="text-xl font-bold text-neutral-800">
                  {currentYear}年{currentMonth}月
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filterCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  全て
                </button>
                {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      filterCategory === key ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-0">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-neutral-200">
                  {WEEKDAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={`py-3 text-center text-sm font-medium ${
                        idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-neutral-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((cell, idx) => {
                    const events = getEventsForDate(cell.dateStr)
                    const isSelected = selectedDate === cell.dateStr
                    const isToday = cell.dateStr === new Date().toISOString().split('T')[0]
                    const dayOfWeek = idx % 7

                    return (
                      <button
                        key={`${cell.dateStr}-${idx}`}
                        onClick={() => setSelectedDate(cell.dateStr)}
                        className={`min-h-[100px] p-1 border-b border-r border-neutral-100 text-left transition-colors ${
                          isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'
                        } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 px-1 ${
                          isToday
                            ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                            : dayOfWeek === 0
                              ? 'text-red-500'
                              : dayOfWeek === 6
                                ? 'text-blue-500'
                                : 'text-neutral-700'
                        }`}>
                          {cell.day}
                        </div>

                        {/* Event dots */}
                        <div className="space-y-0.5">
                          {events.slice(0, 3).map(event => {
                            const config = CATEGORY_CONFIG[event.type as EventCategory]
                            return (
                              <div
                                key={event.id}
                                className={`text-[10px] px-1 py-0.5 rounded truncate ${config.bgColor} ${config.color}`}
                              >
                                {event.title}
                              </div>
                            )
                          })}
                          {events.length > 3 && (
                            <div className="text-[10px] text-neutral-400 px-1">
                              +{events.length - 3}件
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Date Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate
                    ? `${selectedDate.replace(`${currentYear}-`, '').replace('-', '/')}の予定`
                    : '日付を選択'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate && selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map(event => {
                      const config = CATEGORY_CONFIG[event.type as EventCategory]
                      const Icon = config.icon
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{event.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {event.start_time && (
                                <span className="text-xs text-neutral-500">{event.start_time}</span>
                              )}
                              {event.location && (
                                <span className="text-xs text-neutral-400">{event.location}</span>
                              )}
                              {event.description && (
                                <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                                  {event.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">予定なし</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">カレンダーの日付をクリック</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{currentMonth}月のサマリー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][]).map(([key, config]) => {
                    const count = monthEvents.filter(e => (e.type as EventCategory) === key).length
                    if (count === 0) return null
                    const Icon = config.icon
                    return (
                      <div key={key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="text-sm text-neutral-700">{config.label}</span>
                        </div>
                        <span className="text-sm font-medium text-neutral-800">{count}件</span>
                      </div>
                    )
                  })}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">合計</span>
                    <span className="text-sm font-bold text-neutral-800">{monthEvents.length}件</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              予定を追加
            </Button>

            {/* Related Pages */}
            <div className="space-y-2">
              <Link href="/dashboard/tasks" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  タスク管理
                </Button>
              </Link>
              <Link href="/dashboard/records" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  栽培記録
                </Button>
              </Link>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
