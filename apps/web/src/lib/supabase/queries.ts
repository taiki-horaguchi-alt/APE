import { createClient } from './server'

/**
 * 全作物を取得
 */
export async function getCrops() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

/**
 * 市場ごとの最新価格を取得
 */
export async function getLatestMarketPrices(marketId = 'osaka_honba') {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // 今日の価格
  const { data: todayPrices, error: todayError } = await supabase
    .from('market_prices')
    .select('crop_id, price')
    .eq('market_id', marketId)
    .eq('price_date', today)

  if (todayError) throw todayError

  // 昨日の価格（変動計算用）
  const { data: yesterdayPrices, error: yesterdayError } = await supabase
    .from('market_prices')
    .select('crop_id, price')
    .eq('market_id', marketId)
    .eq('price_date', yesterday)

  if (yesterdayError) throw yesterdayError

  const yesterdayMap = new Map(
    (yesterdayPrices ?? []).map(p => [p.crop_id, p.price])
  )

  return (todayPrices ?? []).map(p => {
    const prevPrice = yesterdayMap.get(p.crop_id) ?? p.price
    const change = prevPrice > 0
      ? ((p.price - prevPrice) / prevPrice) * 100
      : 0

    return {
      cropId: p.crop_id,
      price: p.price,
      change: Math.round(change * 10) / 10,
      trend: change >= 0 ? 'up' as const : 'down' as const,
    }
  })
}

/**
 * ログイン中のユーザー情報を取得
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * ユーザープロフィールを取得（usersテーブルから）
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, farm_name, avatar_url, labor_type, work_hours, interested_crops, role, onboarding_completed')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * ユーザープロフィールを作成/更新
 */
export async function upsertUserProfile(profile: {
  id: string
  farm_name: string
  labor_type?: string
  work_hours?: string
  interested_crops?: string[]
  onboarding_completed?: boolean
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 全市場を取得
 */
export async function getMarkets() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

/**
 * 指定市場の最新価格（直近日のデータを取得）
 */
export async function getMarketPricesWithCrops(marketId = 'osaka_honba') {
  const supabase = await createClient()

  // 直近の価格日を取得
  const { data: latestDate, error: dateError } = await supabase
    .from('market_prices')
    .select('price_date')
    .eq('market_id', marketId)
    .order('price_date', { ascending: false })
    .limit(1)
    .single()

  if (dateError || !latestDate) return []

  const currentDate = latestDate.price_date
  // 1日前の日付
  const prevDate = new Date(new Date(currentDate).getTime() - 86400000)
    .toISOString().split('T')[0]

  // 直近日の価格
  const { data: currentPrices, error: currentError } = await supabase
    .from('market_prices')
    .select('crop_id, price')
    .eq('market_id', marketId)
    .eq('price_date', currentDate)

  if (currentError) throw currentError

  // 前日の価格
  const { data: prevPrices, error: prevError } = await supabase
    .from('market_prices')
    .select('crop_id, price')
    .eq('market_id', marketId)
    .eq('price_date', prevDate)

  if (prevError) throw prevError

  const prevMap = new Map(
    (prevPrices ?? []).map(p => [p.crop_id, p.price])
  )

  return (currentPrices ?? []).map(p => {
    const prevPrice = prevMap.get(p.crop_id) ?? p.price
    const change = prevPrice > 0
      ? ((p.price - prevPrice) / prevPrice) * 100
      : 0

    return {
      cropId: p.crop_id,
      price: p.price,
      change: Math.round(change * 10) / 10,
      trend: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
    }
  })
}

/**
 * 特定作物の価格履歴（過去N日分）
 */
export async function getCropPriceHistory(
  cropId: string,
  marketId = 'osaka_honba',
  days = 30
) {
  const supabase = await createClient()
  const fromDate = new Date(Date.now() - days * 86400000)
    .toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('market_prices')
    .select('price_date, price')
    .eq('market_id', marketId)
    .eq('crop_id', cropId)
    .gte('price_date', fromDate)
    .order('price_date', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * 全市場での特定作物の最新価格比較
 */
export async function getCropPriceComparison(cropId: string) {
  const supabase = await createClient()

  // 各市場の直近価格を取得
  const { data: markets, error: marketsError } = await supabase
    .from('markets')
    .select('id, name')

  if (marketsError) throw marketsError

  const results = await Promise.all(
    (markets ?? []).map(async (market) => {
      const { data: prices } = await supabase
        .from('market_prices')
        .select('price, price_date')
        .eq('market_id', market.id)
        .eq('crop_id', cropId)
        .order('price_date', { ascending: false })
        .limit(2)

      const latest = prices?.[0]
      const previous = prices?.[1]

      const change = latest && previous && previous.price > 0
        ? ((latest.price - previous.price) / previous.price) * 100
        : 0

      return {
        marketId: market.id,
        marketName: market.name,
        price: latest?.price ?? 0,
        change: Math.round(change * 10) / 10,
      }
    })
  )

  return results.filter(r => r.price > 0)
}

/**
 * ユーザーの組織のロケーション一覧を取得
 */
export async function getLocations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .is('deleted_at', null)
    .order('name')

  if (error) throw error
  return data
}

/**
 * ユーザーの組織の土壌プロファイル一覧を取得
 */
export async function getSoilProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('soil_profiles')
    .select('*, locations(name, prefecture, city)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * 土壌pHに基づいて作物の適合度を計算
 */
export async function getCropSuitability(soilPh: number) {
  const supabase = await createClient()
  const { data: crops, error } = await supabase
    .from('crops')
    .select('id, name, suitable_soil_ph_min, suitable_soil_ph_max, frost_tolerance, water_requirement, difficulty')
    .eq('is_active', true)

  if (error) throw error

  return (crops ?? []).map(crop => {
    const phMin = crop.suitable_soil_ph_min ?? 5.5
    const phMax = crop.suitable_soil_ph_max ?? 7.5
    const phMid = (phMin + phMax) / 2
    const phRange = (phMax - phMin) / 2

    // pH適合度 (0-100)
    const phDiff = Math.abs(soilPh - phMid)
    const phScore = Math.max(0, 100 - (phDiff / phRange) * 50)

    return {
      cropId: crop.id,
      cropName: crop.name,
      suitability: Math.round(phScore),
      difficulty: crop.difficulty ?? 3,
    }
  }).sort((a, b) => b.suitability - a.suitability)
}

// ---- 取引先 (Buyers) ----

/**
 * 取引先一覧を取得
 */
export async function getBuyers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .is('deleted_at', null)
    .order('match_score', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * 取引先を1件取得
 */
export async function getBuyerById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

/**
 * 取引先を作成
 */
export async function createBuyer(buyer: {
  name: string
  type: string
  demand_crops?: string[]
  price_level?: string
  contact?: string
  description?: string
  distance?: string
  monthly_volume?: number
  organization_id: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyers')
    .insert(buyer)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 取引先を更新
 */
export async function updateBuyer(id: string, updates: {
  name?: string
  type?: string
  demand_crops?: string[]
  price_level?: string
  contact?: string
  description?: string
  distance?: string
  monthly_volume?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buyers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 取引先を削除（ソフトデリート）
 */
export async function deleteBuyer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('buyers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

// ---- メッセージ (Messages) ----

/**
 * 取引先ごとの会話一覧（最新メッセージ・未読数付き）
 */
export async function getConversations() {
  const supabase = await createClient()

  // 取引先一覧
  const { data: buyers, error: buyersError } = await supabase
    .from('buyers')
    .select('id, name, type')
    .is('deleted_at', null)
    .order('name')

  if (buyersError) throw buyersError
  if (!buyers || buyers.length === 0) return []

  // 全メッセージから各取引先の最新メッセージと未読数を取得
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('buyer_id, content, created_at, is_read, sender_id')
    .order('created_at', { ascending: false })

  if (msgError) throw msgError

  const messagesByBuyer = new Map<string, {
    lastMessage: string
    lastMessageAt: string
    lastSenderId: string
    unreadCount: number
  }>()

  for (const msg of messages ?? []) {
    const existing = messagesByBuyer.get(msg.buyer_id)
    if (!existing) {
      messagesByBuyer.set(msg.buyer_id, {
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        lastSenderId: msg.sender_id,
        unreadCount: msg.is_read ? 0 : 1,
      })
    } else {
      if (!msg.is_read) {
        messagesByBuyer.set(msg.buyer_id, {
          ...existing,
          unreadCount: existing.unreadCount + 1,
        })
      }
    }
  }

  return buyers
    .map((buyer) => {
      const msgInfo = messagesByBuyer.get(buyer.id)
      return {
        buyerId: buyer.id,
        buyerName: buyer.name,
        buyerType: buyer.type,
        lastMessage: msgInfo?.lastMessage ?? null,
        lastMessageAt: msgInfo?.lastMessageAt ?? null,
        lastSenderId: msgInfo?.lastSenderId ?? null,
        unreadCount: msgInfo?.unreadCount ?? 0,
      }
    })
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0
      if (!a.lastMessageAt) return 1
      if (!b.lastMessageAt) return -1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
}

/**
 * 特定取引先のメッセージ一覧（古い順）
 */
export async function getMessages(buyerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * 全体の未読メッセージ数
 */
export async function getUnreadCount() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

/**
 * 栽培記録一覧を取得
 */
export async function getCultivationRecords(organizationId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('cultivation_records')
    .select('*, field:fields(name), crop:crops(name)')
    .is('deleted_at', null)
    .order('record_date', { ascending: false })

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

/**
 * 特定の圃場の栽培記録を取得
 */
export async function getCultivationRecordsByField(fieldId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cultivation_records')
    .select('*, field:fields(name), crop:crops(name)')
    .eq('field_id', fieldId)
    .is('deleted_at', null)
    .order('record_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * 栽培記録を作成
 */
export async function createCultivationRecord(record: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('cultivation_records')
    .insert([{ ...record, last_modified_by: user.id }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * タスク一覧を取得
 */
export async function getTasks(organizationId?: string, status?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('tasks')
    .select('*, field:fields(name), crop:crops(name), assigned_to:users(farm_name)')
    .is('deleted_at', null)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  query = query.order('due_date', { ascending: true })

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

/**
 * タスクを作成
 */
export async function createTask(task: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, created_by_id: user.id, last_modified_by: user.id }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * タスクを更新
 */
export async function updateTask(taskId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, last_modified_by: user.id })
    .eq('id', taskId)
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * タスクを削除（ソフトデリート）
 */
export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) throw error
}

/**
 * カレンダーイベント一覧を取得
 */
export async function getCalendarEvents(organizationId?: string, startDate?: string, endDate?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('calendar_events')
    .select('*, field:fields(name), crop:crops(name)')
    .is('deleted_at', null)

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  if (startDate) {
    query = query.gte('event_date', startDate)
  }

  if (endDate) {
    query = query.lte('event_date', endDate)
  }

  query = query.order('event_date', { ascending: true })

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

/**
 * カレンダーイベントを作成
 */
export async function createCalendarEvent(event: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('calendar_events')
    .insert([{ ...event, created_by_id: user.id, last_modified_by: user.id }])
    .select()

  if (error) throw error
  return data?.[0]
}

// ============================================
// Proposals (提案書)
// ============================================

/**
 * 提案書一覧を取得
 */
export async function getProposals(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*, buyer:buyers(name, type)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * 提案書を作成
 */
export async function createProposal(proposal: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('proposals')
    .insert([{ ...proposal, created_by_id: user.id, last_modified_by: user.id }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * 提案書を更新
 */
export async function updateProposal(proposalId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('proposals')
    .update({ ...updates, last_modified_by: user.id })
    .eq('id', proposalId)
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * 提案書を削除（ソフトデリート）
 */
export async function deleteProposal(proposalId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proposals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', proposalId)

  if (error) throw error
}

// ============================================
// Invoices (請求書・納品書)
// ============================================

/**
 * 請求書一覧を取得
 */
export async function getInvoices(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, buyer:buyers(name, type)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * 請求書を作成
 */
export async function createInvoice(invoice: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('invoices')
    .insert([{ ...invoice, created_by_id: user.id, last_modified_by: user.id }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * 請求書を更新
 */
export async function updateInvoice(invoiceId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('認証が必要です')

  const { data, error } = await supabase
    .from('invoices')
    .update({ ...updates, last_modified_by: user.id })
    .eq('id', invoiceId)
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * 請求書を削除（ソフトデリート）
 */
export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', invoiceId)

  if (error) throw error
}
