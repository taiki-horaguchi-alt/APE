'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Leaf,
  Bug,
  Droplets,
  Calendar,
  Camera,
  Mic,
  ChevronDown,
  Check,
  FileText,
  Scissors,
  Beaker,
  Loader2,
} from 'lucide-react'

type RecordType = 'planting' | 'fertilizer' | 'pesticide' | 'harvest' | 'other'

const RECORD_TYPES: { value: RecordType; label: string; icon: typeof Leaf; color: string }[] = [
  { value: 'planting', label: '定植・播種', icon: Leaf, color: 'text-green-600 bg-green-50' },
  { value: 'fertilizer', label: '追肥・施肥', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
  { value: 'pesticide', label: '農薬散布', icon: Bug, color: 'text-red-600 bg-red-50' },
  { value: 'harvest', label: '収穫', icon: Scissors, color: 'text-yellow-600 bg-yellow-50' },
  { value: 'other', label: 'その他', icon: FileText, color: 'text-neutral-600 bg-neutral-50' },
]

const CROP_OPTIONS = [
  'トマト', 'きゅうり', 'なす', 'ほうれん草', 'ねぎ',
  'キャベツ', 'ブロッコリー', 'だいこん', 'にんじん', 'いちご',
]

interface CultivationRecord {
  id: string
  date: string
  type: RecordType
  crop: string
  field: string
  content: string
  pesticide?: string
  pesticideCount?: number
  quantity?: string
  photo?: string
}

// デモデータ
const DEMO_RECORDS: CultivationRecord[] = [
  { id: '1', date: '2025-05-15', type: 'planting', crop: 'トマト', field: '第1圃場', content: '大玉トマト 桃太郎 200株定植。マルチ敷設済み。' },
  { id: '2', date: '2025-05-10', type: 'fertilizer', crop: 'きゅうり', field: '第2圃場', content: '追肥 NK化成 10kg/10a。生育良好。' },
  { id: '3', date: '2025-05-08', type: 'pesticide', crop: 'なす', field: '第1圃場', content: 'アファーム乳剤 1000倍 散布', pesticide: 'アファーム乳剤', pesticideCount: 1 },
  { id: '4', date: '2025-05-05', type: 'harvest', crop: 'ほうれん草', field: '第3圃場', content: '収穫 150kg。品質良好。直売所へ80kg、JA出荷70kg。', quantity: '150kg' },
]

export default function RecordsPage() {
  const supabase = createClient()
  const [records, setRecords] = useState<CultivationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<RecordType>('planting')
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formCrop, setFormCrop] = useState('')
  const [formField, setFormField] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPesticide, setFormPesticide] = useState('')
  const [formQuantity, setFormQuantity] = useState('')
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all')
  const [organizationId, setOrganizationId] = useState('')

  // Load records from Supabase
  useEffect(() => {
    async function loadRecords() {
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

          const { data: recordList, error: err } = await supabase
            .from('cultivation_records')
            .select('*')
            .eq('organization_id', userProfile.organization_id)
            .is('deleted_at', null)
            .order('record_date', { ascending: false })

          if (err) throw err

          // Map Supabase records to component format
          const mappedRecords: CultivationRecord[] = (recordList ?? []).map(r => ({
            id: r.id,
            date: r.record_date,
            type: r.type as RecordType,
            crop: r.crop_id || 'Unknown',
            field: r.field_id || 'Unknown',
            content: r.description || '',
            pesticide: r.pesticide_name,
            pesticideCount: r.pesticide_usage_count,
            quantity: r.harvest_quantity ? `${r.harvest_quantity}${r.harvest_unit || ''}` : undefined,
          }))

          setRecords(mappedRecords)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const filteredRecords = filterType === 'all'
    ? records
    : records.filter(r => r.type === filterType)

  async function handleSubmit() {
    if (!organizationId) {
      setError('組織情報がありません')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      // Parse harvest quantity if present
      let harvestQuantity: number | null = null
      let harvestUnit: string | null = null
      if (formType === 'harvest' && formQuantity) {
        const match = formQuantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
        if (match) {
          harvestQuantity = parseFloat(match[1])
          harvestUnit = match[2] || 'kg'
        }
      }

      // Parse fertilizer quantity if present (from formQuantity in fertilizer case)
      let fertilizerQuantity: number | null = null
      let fertilizerName: string | null = null
      if (formType === 'fertilizer' && formQuantity) {
        const match = formQuantity.match(/^([^\d]+)\s*(\d+(?:\.\d+)?)\s*(.*)$/)
        if (match) {
          fertilizerName = match[1].trim()
          fertilizerQuantity = parseFloat(match[2])
        }
      }

      const { error: insertError } = await supabase
        .from('cultivation_records')
        .insert({
          organization_id: organizationId,
          type: formType,
          record_date: formDate,
          title: `${formCrop} ${RECORD_TYPES.find(rt => rt.value === formType)?.label}`,
          description: formContent,
          pesticide_name: formType === 'pesticide' ? formPesticide : null,
          pesticide_usage_count: formType === 'pesticide' ? (parseInt(formQuantity) || 1) : null,
          fertilizer_name: fertilizerName,
          fertilizer_quantity: fertilizerQuantity,
          harvest_quantity: harvestQuantity,
          harvest_unit: harvestUnit,
          field_id: null, // Would need field selection from database
          crop_id: null, // Would need crop selection from database
        })

      if (insertError) throw insertError

      // Reload records
      const { data: recordList, error: loadErr } = await supabase
        .from('cultivation_records')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('record_date', { ascending: false })

      if (loadErr) throw loadErr

      const mappedRecords: CultivationRecord[] = (recordList ?? []).map(r => ({
        id: r.id,
        date: r.record_date,
        type: r.type as RecordType,
        crop: r.crop_id || 'Unknown',
        field: r.field_id || 'Unknown',
        content: r.description || '',
        pesticide: r.pesticide_name,
        pesticideCount: r.pesticide_usage_count,
        quantity: r.harvest_quantity ? `${r.harvest_quantity}${r.harvest_unit || ''}` : undefined,
      }))

      setRecords(mappedRecords)
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormType('planting')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormCrop('')
    setFormField('')
    setFormContent('')
    setFormPesticide('')
    setFormQuantity('')
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="栽培記録"
        description="作業の記録・農薬管理"
      />

      <div className="p-6 max-w-4xl">
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
        <>
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === 'all' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              すべて
            </button>
            {RECORD_TYPES.map(rt => (
              <button
                key={rt.value}
                onClick={() => setFilterType(rt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterType === rt.value ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/calendar">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                カレンダー
              </Button>
            </Link>
            <Link href="/dashboard/records/materials">
              <Button variant="outline">
                <Beaker className="w-4 h-4 mr-2" />
                資材管理
              </Button>
            </Link>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              記録を追加
            </Button>
          </div>
        </div>

        {/* New Record Form */}
        {showForm && (
          <Card className="mb-6 border-primary-200">
            <CardHeader>
              <CardTitle>新しい記録</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Record Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">種類</label>
                  <div className="flex flex-wrap gap-2">
                    {RECORD_TYPES.map(rt => {
                      const Icon = rt.icon
                      return (
                        <button
                          key={rt.value}
                          onClick={() => setFormType(rt.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                            formType === rt.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {rt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Date & Crop */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      日付
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">品目</label>
                    <select
                      value={formCrop}
                      onChange={e => setFormCrop(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">選択してください</option>
                      {CROP_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">圃場</label>
                  <input
                    type="text"
                    value={formField}
                    onChange={e => setFormField(e.target.value)}
                    placeholder="例：第1圃場"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                {/* Pesticide specific */}
                {formType === 'pesticide' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">農薬名</label>
                      <input
                        type="text"
                        value={formPesticide}
                        onChange={e => setFormPesticide(e.target.value)}
                        placeholder="例：アファーム乳剤"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">使用回数（今回で何回目）</label>
                      <input
                        type="number"
                        placeholder="例：1"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Harvest specific */}
                {formType === 'harvest' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">収穫量</label>
                    <input
                      type="text"
                      value={formQuantity}
                      onChange={e => setFormQuantity(e.target.value)}
                      placeholder="例：150kg"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">内容・メモ</label>
                  <textarea
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    rows={3}
                    placeholder="作業内容を入力..."
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  />
                </div>

                {/* Photo & Voice */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    写真を追加
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="w-4 h-4 mr-2" />
                    音声入力
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }} disabled={submitting}>
                    キャンセル
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {submitting ? '保存中...' : '記録する'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        <div className="space-y-3">
          {filteredRecords.map(record => {
            const typeConfig = RECORD_TYPES.find(rt => rt.value === record.type)
            const Icon = typeConfig?.icon ?? FileText

            return (
              <Card key={record.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig?.color ?? 'text-neutral-600 bg-neutral-50'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-800">{record.crop}</span>
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{typeConfig?.label}</span>
                        </div>
                        <span className="text-sm text-neutral-500">{record.date}</span>
                      </div>
                      <p className="text-sm text-neutral-600">{record.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-neutral-400">{record.field}</span>
                        {record.quantity && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">{record.quantity}</span>
                        )}
                        {record.pesticide && (
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                            {record.pesticide} ({record.pesticideCount}回目)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">記録がありません</h3>
              <p className="text-neutral-400 mb-6">栽培記録を追加して管理を始めましょう</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                最初の記録を追加
              </Button>
            </CardContent>
          </Card>
        )}
        </>
        )}
      </div>
    </div>
  )
}
