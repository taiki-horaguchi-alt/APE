import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'APE - 農業経営支援プラットフォーム',
  description:
    'APE（Agri-Tech Planning Engine）は、農家の皆様の経営判断をサポートする農業支援プラットフォームです。土壌分析、収益シミュレーション、販路マッチングなどの機能を提供します。',
  keywords: ['農業', '経営支援', '土壌分析', 'シミュレーション', 'AgriTech'],
  openGraph: {
    title: 'APE - 農業経営支援プラットフォーム',
    description: '農家の経営判断をサポートする農業支援プラットフォーム',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
