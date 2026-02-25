'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { User, Save, Bell, Check, Loader2 } from 'lucide-react'

const CROP_OPTIONS = [
  'トマト', 'きゅうり', 'なす', 'ピーマン', 'キャベツ',
  'レタス', 'にんじん', 'だいこん', 'ほうれん草', 'ブロッコリー',
  'いちご', 'ぶどう', 'みかん', 'りんご', '米',
]

const LABOR_TYPES = [
  { value: 'solo', label: '個人経営' },
  { value: 'partner', label: 'パートナー経営' },
  { value: 'family_employees', label: '家族・従業員あり' },
]

const WORK_HOURS = [
  { value: 'full_time', label: '専業' },
  { value: 'part_time', label: '兼業' },
]

interface ProfileState {
  farmName: string
  laborType: string
  workHours: string
  interestedCrops: string[]
}

interface NotificationState {
  priceAlert: boolean
  weatherAlert: boolean
  marketNews: boolean
  systemUpdate: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  const [profile, setProfile] = useState<ProfileState>({
    farmName: '',
    laborType: '',
    workHours: '',
    interestedCrops: [],
  })

  const [notifications, setNotifications] = useState<NotificationState>({
    priceAlert: true,
    weatherAlert: true,
    marketNews: false,
    systemUpdate: true,
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setEmail(user.email ?? '')

        const { data } = await supabase
          .from('users')
          .select('farm_name, labor_type, work_hours, interested_crops')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile({
            farmName: data.farm_name ?? '',
            laborType: data.labor_type ?? '',
            workHours: data.work_hours ?? '',
            interestedCrops: data.interested_crops ?? [],
          })
        }
      } catch (err) {
        setError('プロフィールの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  function toggleCrop(crop: string) {
    setProfile((prev) => ({
      ...prev,
      interestedCrops: prev.interestedCrops.includes(crop)
        ? prev.interestedCrops.filter((c) => c !== crop)
        : [...prev.interestedCrops, crop],
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error: updateError } = await supabase
        .from('users')
        .update({
          farm_name: profile.farmName,
          labor_type: profile.laborType,
          work_hours: profile.workHours,
          interested_crops: profile.interestedCrops,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="設定"
        description="プロフィールと通知設定を管理します"
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              プロフィール
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
                />
              </div>

              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  農園名
                </label>
                <input
                  type="text"
                  value={profile.farmName}
                  onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
                  placeholder="例：山田農園"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>

              {/* Labor Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  経営形態
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LABOR_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setProfile({ ...profile, laborType: type.value })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        profile.laborType === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Hours */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  勤務形態
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_HOURS.map((wh) => (
                    <button
                      key={wh.value}
                      onClick={() => setProfile({ ...profile, workHours: wh.value })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        profile.workHours === wh.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {wh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interested Crops */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  興味のある作物
                </label>
                <div className="flex flex-wrap gap-2">
                  {CROP_OPTIONS.map((crop) => {
                    const selected = profile.interestedCrops.includes(crop)
                    return (
                      <button
                        key={crop}
                        onClick={() => toggleCrop(crop)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {crop}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'priceAlert' as const, label: '価格アラート', desc: '登録作物の価格が大きく変動した時に通知' },
                { key: 'weatherAlert' as const, label: '気象アラート', desc: '悪天候・霜注意報などの気象警報' },
                { key: 'marketNews' as const, label: 'マーケットニュース', desc: '市場動向や農業関連ニュースの配信' },
                { key: 'systemUpdate' as const, label: 'システム更新', desc: 'APEの新機能やメンテナンス情報' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="font-medium text-neutral-900">{item.label}</p>
                    <p className="text-sm text-neutral-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications[item.key] ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error / Success */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            設定を保存しました
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !profile.farmName.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          保存する
        </button>
      </div>
    </div>
  )
}
