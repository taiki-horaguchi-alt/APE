import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { getCrops } from '@/lib/supabase/queries'
import { SimulatorContent } from './SimulatorContent'

const CROP_EMOJI: Record<string, string> = {
  tomato: '🍅',
  mini_tomato: '🍅',
  cucumber: '🥒',
  eggplant: '🍆',
  green_pepper: '🫑',
  summer_spinach: '🥬',
  winter_spinach: '🥬',
  edamame: '🫛',
  okra: '🌿',
  corn: '🌽',
  negi: '🧅',
  cabbage: '🥬',
  daikon: '🥕',
  carrot: '🥕',
  hakusai: '🥬',
  broccoli: '🥦',
  strawberry: '🍓',
  kabu: '🥕',
}

export default async function SimulatorPage() {
  const crops = await getCrops().catch(() => [])

  const toCropData = (crop: NonNullable<typeof crops>[number]) => ({
    id: crop.id,
    name: crop.name,
    season: crop.season,
    emoji: CROP_EMOJI[crop.id] ?? '🌱',
    revenuePerUnit: crop.revenue_per_unit ?? 0,
    costPerUnit: crop.cost_per_unit ?? 0,
    harvestMonths: crop.harvest_months ?? [],
    plantingMonths: crop.planting_months ?? [],
  })

  const summerCrops = (crops ?? [])
    .filter(c => c.season === 'summer')
    .map(toCropData)

  const winterCrops = (crops ?? [])
    .filter(c => c.season === 'winter')
    .map(toCropData)

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="収益シミュレーター"
        subtitle="作付け計画から収支をシミュレーション"
      />
      <SimulatorContent
        summerCrops={summerCrops}
        winterCrops={winterCrops}
      />
    </div>
  )
}
