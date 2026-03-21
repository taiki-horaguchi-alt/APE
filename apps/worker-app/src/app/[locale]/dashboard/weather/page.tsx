'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Cloud, AlertTriangle, Droplets, Wind } from 'lucide-react'

export default function WeatherPage() {
  const t = useTranslations()

  // Mock weather data
  const weather = {
    temperature: 28,
    humidity: 65,
    condition: 'Partly Cloudy',
    wbgt: 25,
    warning: 'caution',
  }

  const getWarningLevel = (wbgt: number) => {
    if (wbgt > 31) return { level: 'danger', color: 'bg-red-600', text: '危険' }
    if (wbgt > 28) return { level: 'alert', color: 'bg-orange-600', text: '警告' }
    if (wbgt > 25) return { level: 'caution', color: 'bg-yellow-600', text: '注意' }
    return { level: 'safe', color: 'bg-green-600', text: '安全' }
  }

  const warnLevel = getWarningLevel(weather.wbgt)

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
            {t('weather.title')}
          </h1>
        </div>

        {/* Main Weather Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 mb-6 border border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <Cloud className="text-white" size={40} />
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {weather.temperature}°
              </div>
              <p className="text-blue-200 text-sm">
                {weather.condition}
              </p>
            </div>
          </div>
        </div>

        {/* WBGT Warning */}
        <div className={`${warnLevel.color} rounded-lg p-4 mb-6 border border-opacity-50`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-white flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-white font-semibold text-sm">
                WBGT: {weather.wbgt}°C - {warnLevel.text}
              </p>
              <p className="text-white text-xs mt-1 opacity-90">
                {warnLevel.level === 'danger' && '休息時間を増やしてください'}
                {warnLevel.level === 'alert' && '水分補給を増やしてください'}
                {warnLevel.level === 'caution' && '定期的に休息してください'}
                {warnLevel.level === 'safe' && '通常通り作業できます'}
              </p>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Droplets className="text-blue-400" size={20} />
                <div>
                  <p className="text-slate-400 text-xs">
                    {t('weather.humidity')}
                  </p>
                  <p className="text-white font-semibold">
                    {weather.humidity}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wind className="text-cyan-400" size={20} />
                <div>
                  <p className="text-slate-400 text-xs">
                    Wind Speed
                  </p>
                  <p className="text-white font-semibold">
                    3.5 m/s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-6 bg-slate-700 rounded-lg p-4 border border-slate-600">
          <h3 className="text-white font-semibold text-sm mb-2">
            安全ヒント / Mẹo An Toàn
          </h3>
          <ul className="text-slate-300 text-xs space-y-1">
            <li>• 定期的に水を飲んでください</li>
            <li>• 帽子をかぶってください</li>
            <li>• 疲れたら休休止してください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
