'use client'

import { X, RotateCcw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { LucideIcon } from 'lucide-react'

interface NavItemDef {
  href: string
  icon: LucideIcon
  label: string
}

interface NavSectionDef {
  title?: string
  items: NavItemDef[]
}

interface SidebarCustomizeModalProps {
  open: boolean
  onClose: () => void
  sections: NavSectionDef[]
  isEnabled: (href: string) => boolean
  isAlwaysVisible: (href: string) => boolean
  onToggle: (href: string) => void
  onReset: () => void
}

export function SidebarCustomizeModal({
  open,
  onClose,
  sections,
  isEnabled,
  isAlwaysVisible,
  onToggle,
  onReset,
}: SidebarCustomizeModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">メニューのカスタマイズ</h2>
            <p className="text-sm text-neutral-500 mt-0.5">表示する機能を選択</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const locked = isAlwaysVisible(item.href)
                  const enabled = isEnabled(item.href)
                  const Icon = item.icon

                  return (
                    <button
                      key={item.href}
                      onClick={() => onToggle(item.href)}
                      disabled={locked}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        locked
                          ? 'cursor-default bg-neutral-50'
                          : 'hover:bg-neutral-50 cursor-pointer'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${enabled ? 'text-primary-600' : 'text-neutral-300'}`} />
                      <span className={`flex-1 text-left font-medium ${enabled ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {item.label}
                      </span>
                      {locked ? (
                        <Lock className="w-3.5 h-3.5 text-neutral-300" />
                      ) : (
                        <div
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                            enabled ? 'bg-primary-500' : 'bg-neutral-200'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            デフォルトに戻す
          </button>
          <Button onClick={onClose} size="sm">
            完了
          </Button>
        </div>
      </div>
    </div>
  )
}
