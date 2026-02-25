'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag,
  ChevronDown,
  Check,
  X,
  ClipboardList,
  Filter,
  Repeat,
  Loader2,
  Trash2,
} from 'lucide-react'

type TaskStatus = 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
type TaskCategory = 'cultivation' | 'harvest' | 'shipping' | 'maintenance' | 'admin' | 'other'
type ViewMode = 'board' | 'list'

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: '未着手', icon: Circle, color: 'text-neutral-400' },
  in_progress: { label: '作業中', icon: Clock, color: 'text-blue-500' },
  done: { label: '完了', icon: CheckCircle, color: 'text-green-500' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-neutral-100 text-neutral-600' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-600' },
  high: { label: '高', color: 'bg-orange-100 text-orange-600' },
  urgent: { label: '緊急', color: 'bg-red-100 text-red-600' },
}

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string }> = {
  cultivation: { label: '栽培', color: 'bg-green-100 text-green-600' },
  harvest: { label: '収穫', color: 'bg-yellow-100 text-yellow-600' },
  shipping: { label: '出荷', color: 'bg-purple-100 text-purple-600' },
  maintenance: { label: '設備', color: 'bg-orange-100 text-orange-600' },
  admin: { label: '事務', color: 'bg-blue-100 text-blue-600' },
  other: { label: 'その他', color: 'bg-neutral-100 text-neutral-600' },
}

export default function TasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all')
  const [organizationId, setOrganizationId] = useState('')

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium')
  const [formCategory, setFormCategory] = useState<TaskCategory>('cultivation')
  const [formDueDate, setFormDueDate] = useState('')
  const [formField, setFormField] = useState('')
  const [formCrop, setFormCrop] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load organization and tasks
  useEffect(() => {
    async function loadData() {
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
          const { data: taskList, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('organization_id', userProfile.organization_id)
            .is('deleted_at', null)
            .order('due_date', { ascending: true })

          if (error) throw error
          setTasks(taskList ?? [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category === filterCategory)

  const todoTasks = filteredTasks.filter(t => t.status === 'todo')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  async function handleStatusChange(taskId: string, currentStatus: TaskStatus) {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length]

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!window.confirm('このタスクを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  async function handleAddTask() {
    if (!formTitle.trim() || !organizationId) return

    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          organization_id: organizationId,
          created_by_id: user.id,
          title: formTitle,
          description: formDescription || null,
          priority: formPriority,
          category: formCategory,
          status: 'todo',
          due_date: formDueDate || null,
          field_id: formField || null,
          crop_id: formCrop || null,
          is_recurring: false,
        })
        .select()

      if (error) throw error

      if (newTask?.[0]) {
        setTasks(prev => [newTask[0], ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setShowForm(false)
    setFormTitle('')
    setFormDescription('')
    setFormPriority('medium')
    setFormCategory('cultivation')
    setFormDueDate('')
    setFormField('')
    setFormCrop('')
  }

  function getDueDateColor(dueDate: string | null, status: TaskStatus): string {
    if (status === 'done' || !dueDate) return 'text-neutral-400'
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 1) return 'text-orange-600'
    if (diffDays <= 3) return 'text-yellow-600'
    return 'text-neutral-500'
  }

  function getDueDateLabel(dueDate: string | null): string {
    if (!dueDate) return ''
    const today = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) return `${Math.abs(diffDays)}日超過`
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '明日'
    return dueDate
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const stats = {
    total: tasks.length,
    overdue: tasks.filter(t => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardHeader
        title="タスク管理"
        description="農作業の進捗管理"
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Related Pages */}
        <div className="flex gap-2 mb-6">
          <Link href="/dashboard/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              カレンダー
            </Button>
          </Link>
          <Link href="/dashboard/records">
            <Button variant="outline" size="sm">
              <ClipboardList className="w-4 h-4 mr-1" />
              栽培記録
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-sm text-neutral-500 mt-1">全タスク</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-sm text-neutral-500 mt-1">期限超過</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-sm text-neutral-500 mt-1">作業中</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-neutral-500 mt-1">完了</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'board' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
                }`}
              >
                ボード
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
                }`}
              >
                リスト
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
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, { label: string; color: string }][]).map(([key, config]) => (
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

          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            タスクを追加
          </Button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>新しいタスク</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">タスク名</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="例: トマト追肥"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">説明</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="詳細な説明"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">優先度</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string; color: string }][]).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">カテゴリ</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, { label: string; color: string }][]).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">期限</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">品目</label>
                  <input
                    type="text"
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    placeholder="例: トマト"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm} disabled={submitting}>
                  キャンセル
                </Button>
                <Button onClick={handleAddTask} disabled={submitting || !formTitle.trim()}>
                  {submitting ? '作成中...' : '作成'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Board View */}
        {viewMode === 'board' && (
          <div className="grid grid-cols-3 gap-6">
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(status => {
              const statusConfig = STATUS_CONFIG[status]
              const statusTasks = filteredTasks.filter(t => t.status === status)

              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-4">
                    <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
                    <h3 className="font-semibold text-neutral-900">{statusConfig.label}</h3>
                    <span className="text-sm text-neutral-500">({statusTasks.length})</span>
                  </div>

                  <div className="space-y-3">
                    {statusTasks.map(task => {
                      const priorityConfig = PRIORITY_CONFIG[task.priority as TaskPriority]
                      const categoryConfig = CATEGORY_CONFIG[task.category as TaskCategory]

                      return (
                        <Card
                          key={task.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-neutral-900 flex-1">{task.title}</h4>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-neutral-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <p className="text-sm text-neutral-500 line-clamp-2">{task.description}</p>

                              <div className="flex gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${categoryConfig.color}`}>
                                  {categoryConfig.label}
                                </span>
                              </div>

                              {task.due_date && (
                                <div className={`text-xs ${getDueDateColor(task.due_date, status)}`}>
                                  {getDueDateLabel(task.due_date)}
                                </div>
                              )}

                              <button
                                onClick={() => handleStatusChange(task.id, status)}
                                className="w-full mt-2 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              >
                                → 次へ進める
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                    {statusTasks.length === 0 && (
                      <div className="text-center py-8 text-neutral-400">
                        タスクなし
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                タスクがありません
              </div>
            ) : (
              filteredTasks.map(task => {
                const statusConfig = STATUS_CONFIG[task.status as TaskStatus]
                const priorityConfig = PRIORITY_CONFIG[task.priority as TaskPriority]
                const categoryConfig = CATEGORY_CONFIG[task.category as TaskCategory]

                return (
                  <Card key={task.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleStatusChange(task.id, task.status)}
                          className="flex-shrink-0"
                        >
                          <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
                        </button>

                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{task.title}</p>
                          <p className="text-sm text-neutral-500">{task.description}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.color}`}>
                              {priorityConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.color}`}>
                              {categoryConfig.label}
                            </span>
                            {task.due_date && (
                              <span className={`px-2 py-0.5 rounded text-xs ${getDueDateColor(task.due_date, task.status)}`}>
                                {getDueDateLabel(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
