'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ape-sidebar-config'

// href をキーにして表示/非表示を管理
// ホーム (/dashboard) は常に表示・トグル不可
const ALWAYS_VISIBLE = ['/dashboard']

const DEFAULT_ENABLED = [
  '/dashboard',
  '/dashboard/calendar',
  '/dashboard/records',
  '/dashboard/listings',
  '/dashboard/tasks',
]

function loadConfig(): string[] {
  if (typeof window === 'undefined') return DEFAULT_ENABLED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ENABLED
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
      return [...new Set([...ALWAYS_VISIBLE, ...parsed])]
    }
    return DEFAULT_ENABLED
  } catch {
    return DEFAULT_ENABLED
  }
}

function saveConfig(enabled: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled))
}

export function useSidebarConfig() {
  const [enabledItems, setEnabledItems] = useState<string[]>(DEFAULT_ENABLED)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setEnabledItems(loadConfig())
    setLoaded(true)
  }, [])

  const isEnabled = useCallback(
    (href: string) => enabledItems.includes(href),
    [enabledItems],
  )

  const isAlwaysVisible = useCallback(
    (href: string) => ALWAYS_VISIBLE.includes(href),
    [],
  )

  const toggle = useCallback((href: string) => {
    if (ALWAYS_VISIBLE.includes(href)) return
    setEnabledItems((prev) => {
      const next = prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href]
      saveConfig(next)
      return next
    })
  }, [])

  const resetToDefault = useCallback(() => {
    setEnabledItems(DEFAULT_ENABLED)
    saveConfig(DEFAULT_ENABLED)
  }, [])

  return { enabledItems, isEnabled, isAlwaysVisible, toggle, resetToDefault, loaded }
}
