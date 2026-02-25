/**
 * Format currency in Japanese Yen
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

/**
 * Format currency with unit (万円)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(0)}万`
  }
  return formatCurrency(amount)
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Format percentage as integer
 */
export function formatPercentInt(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? '+' : ''
  return `${sign}${Math.round(value)}%`
}

/**
 * Format month number to Japanese month name
 */
export function formatMonth(month: number): string {
  return `${month}月`
}

/**
 * Format date to Japanese format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date to short format
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format area in 10a (反) units
 */
export function formatArea(areaTan: number): string {
  return `${areaTan}反`
}

/**
 * Format area in 10a with explanation
 */
export function formatAreaFull(areaTan: number): string {
  return `${areaTan}反（${areaTan * 10}a）`
}

/**
 * Format distance
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

/**
 * Format weight in kg
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`
  }
  return `${kg}kg`
}

/**
 * Format price per unit
 */
export function formatPricePerUnit(price: number, unit = 'kg'): string {
  return `¥${price.toLocaleString('ja-JP')}/${unit}`
}

/**
 * Get greeting based on time of day
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'おはようございます'
  if (hour < 18) return 'こんにちは'
  return 'こんばんは'
}

/**
 * Format difficulty as stars
 */
export function formatDifficulty(level: number): string {
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}
