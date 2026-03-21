'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, Clock } from 'lucide-react'

// Mock data for MVP
const MOCK_TASKS = [
  {
    id: '1',
    title_ja: '野菜の植え替え準備',
    title_vi: 'Chuẩn bị cấy rau',
    title_id: 'Persiapan penanaman sayuran',
    title_tl: 'Paghahanda sa pagtatanim ng gulay',
    title_en: 'Vegetable planting preparation',
    category: 'planting',
    status: 'pending',
    steps: 3,
    dueDate: '2026-03-05',
  },
  {
    id: '2',
    title_ja: '農薬散布（トマト畑）',
    title_vi: 'Phun thuốc (Cà chua)',
    title_id: 'Penyemprotan pestisida (Tomat)',
    title_tl: 'Pagsisipay ng pestisidyo (Tomato)',
    title_en: 'Pesticide application (Tomato field)',
    category: 'spraying',
    status: 'completed',
    steps: 5,
    dueDate: '2026-03-04',
  },
  {
    id: '3',
    title_ja: 'かんがい・水やり',
    title_vi: 'Tưới nước',
    title_id: 'Irigasi',
    title_tl: 'Pag-irigo',
    title_en: 'Irrigation and watering',
    category: 'watering',
    status: 'in-progress',
    steps: 2,
    dueDate: '2026-03-05',
  },
]

export default function TasksPage() {
  const t = useTranslations()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in-progress':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 className="text-green-400" size={20} />
    }
    return <Clock className="text-gray-400" size={20} />
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
            {t('tasks.title')}
          </h1>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {MOCK_TASKS.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}`}
              className="block"
            >
              <div
                className={`
                  rounded-lg p-4 border border-slate-600
                  hover:border-slate-500 hover:bg-slate-600
                  transition-colors
                  ${
                    task.status === 'completed'
                      ? 'bg-slate-700/50'
                      : 'bg-slate-700'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h2 className="text-white font-semibold text-sm">
                        {task.title_ja}
                      </h2>
                    </div>

                    <p className="text-slate-300 text-xs mb-3">
                      {task.title_en}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{task.steps} {t('tasks.step')}</span>
                      <span>•</span>
                      <span>{task.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`${getStatusColor(task.status)}
                        rounded-full w-2 h-2`}
                    />
                    <ChevronRight className="text-slate-400" size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {MOCK_TASKS.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              {t('common.error')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
