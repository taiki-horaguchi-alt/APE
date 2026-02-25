'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Leaf, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'

const CROP_OPTIONS = [
  'トマト', 'きゅうり', 'なす', 'ピーマン', 'キャベツ',
  'レタス', 'にんじん', 'だいこん', 'ほうれん草', 'ブロッコリー',
  'いちご', 'ぶどう', 'みかん', 'りんご', '米',
]

const LABOR_TYPES = [
  { value: 'solo', label: '個人経営', description: '1人で農業を営む' },
  { value: 'partner', label: 'パートナー経営', description: '夫婦・パートナーと共に' },
  { value: 'family_employees', label: '家族・従業員あり', description: '家族や雇用者と共に' },
]

const WORK_HOURS = [
  { value: 'full_time', label: '専業', description: '農業がメインの仕事' },
  { value: 'part_time', label: '兼業', description: '他の仕事と併行' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [farmName, setFarmName] = useState('')
  const [selectedCrops, setSelectedCrops] = useState<string[]>([])
  const [laborType, setLaborType] = useState('')
  const [workHours, setWorkHours] = useState('')

  function toggleCrop(crop: string) {
    setSelectedCrops((prev) =>
      prev.includes(crop)
        ? prev.filter((c) => c !== crop)
        : [...prev, crop]
    )
  }

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          farm_name: farmName,
          interested_crops: selectedCrops,
          labor_type: laborType,
          work_hours: workHours,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return farmName.trim().length > 0
      case 2: return selectedCrops.length > 0
      case 3: return laborType !== '' && workHours !== ''
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">ようこそ APE へ</h1>
          <p className="text-neutral-500 mt-2">はじめにプロフィールを設定しましょう</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">
          {/* Step 1: Farm Name */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">農園名を教えてください</h2>
              <p className="text-sm text-neutral-500 mb-6">ダッシュボードに表示される名前です</p>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="例：山田農園"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-lg"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Crop Selection */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">興味のある作物を選択</h2>
              <p className="text-sm text-neutral-500 mb-6">複数選択できます（後から変更可能）</p>
              <div className="flex flex-wrap gap-2">
                {CROP_OPTIONS.map((crop) => {
                  const selected = selectedCrops.includes(crop)
                  return (
                    <button
                      key={crop}
                      onClick={() => toggleCrop(crop)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      {crop}
                    </button>
                  )
                })}
              </div>
              {selectedCrops.length > 0 && (
                <p className="text-sm text-primary-600 mt-4">
                  {selectedCrops.length}件選択中
                </p>
              )}
            </div>
          )}

          {/* Step 3: Labor Type & Work Hours */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">経営スタイル</h2>
              <p className="text-sm text-neutral-500 mb-6">シミュレーションの精度向上に使います</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">経営形態</label>
                <div className="space-y-2">
                  {LABOR_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setLaborType(type.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                        laborType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="font-medium text-neutral-900">{type.label}</span>
                      <span className="block text-sm text-neutral-500">{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">勤務形態</label>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_HOURS.map((wh) => (
                    <button
                      key={wh.value}
                      onClick={() => setWorkHours(wh.value)}
                      className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                        workHours === wh.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="font-medium text-neutral-900">{wh.label}</span>
                      <span className="block text-sm text-neutral-500">{wh.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                はじめる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
