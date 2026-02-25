import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CropPlan {
  cropId: string
  area: number // 面積 (a)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const plans: CropPlan[] = body.plans ?? []
    const riskLevel: string = body.riskLevel ?? 'normal'

    if (plans.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No crop plans provided' },
        { status: 400 }
      )
    }

    // 作物データを取得
    const cropIds = plans.map(p => p.cropId)
    const { data: crops, error } = await supabase
      .from('crops')
      .select('id, name, revenue_per_unit, cost_per_unit, harvest_months, planting_months')
      .in('id', cropIds)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const cropMap = new Map(
      (crops ?? []).map(c => [c.id, c])
    )

    // リスク係数
    const riskMultiplier = riskLevel === 'optimistic' ? 1.15
      : riskLevel === 'pessimistic' ? 0.75
      : 1.0

    // 各作物の収支計算
    const results = plans.map(plan => {
      const crop = cropMap.get(plan.cropId)
      if (!crop) {
        return {
          cropId: plan.cropId,
          cropName: plan.cropId,
          area: plan.area,
          revenue: 0,
          cost: 0,
          profit: 0,
        }
      }

      const revenue = Math.round((crop.revenue_per_unit ?? 0) * plan.area * riskMultiplier)
      const cost = Math.round((crop.cost_per_unit ?? 0) * plan.area)
      const profit = revenue - cost

      return {
        cropId: crop.id,
        cropName: crop.name,
        area: plan.area,
        revenue,
        cost,
        profit,
        harvestMonths: crop.harvest_months ?? [],
      }
    })

    const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0)
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0)
    const totalProfit = totalRevenue - totalCost

    // 月別キャッシュフロー
    const monthlyCashFlow = Array.from({ length: 12 }, (_, month) => {
      const monthRevenue = results.reduce((sum, r) => {
        const harvestMonths: number[] = r.harvestMonths ?? []
        if (harvestMonths.includes(month + 1)) {
          return sum + Math.round(r.revenue / harvestMonths.length)
        }
        return sum
      }, 0)

      const monthCost = Math.round(totalCost / 12)

      return {
        month: month + 1,
        revenue: monthRevenue,
        cost: monthCost,
        profit: monthRevenue - monthCost,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        crops: results,
        summary: {
          totalRevenue,
          totalCost,
          totalProfit,
          riskLevel,
        },
        monthlyCashFlow,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
