import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('marketId') ?? 'osaka_honba'
    const cropId = searchParams.get('cropId')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    // 特定作物の価格履歴
    if (cropId) {
      const fromDate = new Date(Date.now() - days * 86400000)
        .toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('market_prices')
        .select('price_date, price')
        .eq('market_id', marketId)
        .eq('crop_id', cropId)
        .gte('price_date', fromDate)
        .order('price_date', { ascending: true })

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    // 全作物の最新価格
    const { data: latestDate } = await supabase
      .from('market_prices')
      .select('price_date')
      .eq('market_id', marketId)
      .order('price_date', { ascending: false })
      .limit(1)
      .single()

    if (!latestDate) {
      return NextResponse.json({ success: true, data: [] })
    }

    const currentDate = latestDate.price_date
    const prevDate = new Date(new Date(currentDate).getTime() - 86400000)
      .toISOString().split('T')[0]

    const [currentRes, prevRes] = await Promise.all([
      supabase
        .from('market_prices')
        .select('crop_id, price')
        .eq('market_id', marketId)
        .eq('price_date', currentDate),
      supabase
        .from('market_prices')
        .select('crop_id, price')
        .eq('market_id', marketId)
        .eq('price_date', prevDate),
    ])

    if (currentRes.error) {
      return NextResponse.json(
        { success: false, error: currentRes.error.message },
        { status: 500 }
      )
    }

    const prevMap = new Map(
      (prevRes.data ?? []).map(p => [p.crop_id, p.price])
    )

    const prices = (currentRes.data ?? []).map(p => {
      const prevPrice = prevMap.get(p.crop_id) ?? p.price
      const change = prevPrice > 0
        ? ((p.price - prevPrice) / prevPrice) * 100
        : 0

      return {
        cropId: p.crop_id,
        price: p.price,
        change: Math.round(change * 10) / 10,
        trend: change >= 0 ? 'up' : 'down',
      }
    })

    return NextResponse.json({ success: true, data: prices })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
