export const i18n = {
  defaultLocale: 'ja',
  locales: ['vi', 'id', 'tl', 'en', 'ja'] as const,
} as const

export type Locale = (typeof i18n.locales)[number]
