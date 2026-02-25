import Link from 'next/link'

const footerLinks = {
  product: [
    { href: '#features', label: '機能紹介' },
    { href: '#pricing', label: '料金プラン' },
    { href: '/case-studies', label: '導入事例' },
    { href: '/roadmap', label: 'ロードマップ' },
  ],
  support: [
    { href: '/help', label: 'ヘルプセンター' },
    { href: '/docs', label: 'ドキュメント' },
    { href: '/contact', label: 'お問い合わせ' },
    { href: '/status', label: 'システム状況' },
  ],
  company: [
    { href: '/about', label: '会社概要' },
    { href: '/blog', label: 'ブログ' },
    { href: '/careers', label: '採用情報' },
    { href: '/press', label: 'プレスキット' },
  ],
  legal: [
    { href: '/privacy', label: 'プライバシーポリシー' },
    { href: '/terms', label: '利用規約' },
    { href: '/law', label: '特定商取引法に基づく表記' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-white">APE</span>
            </Link>
            <p className="text-sm text-neutral-400">
              農家の経営判断をサポートする
              <br />
              農業支援プラットフォーム
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">プロダクト</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">サポート</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">企業情報</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">法務情報</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} APE Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary-400 transition-colors"
              aria-label="Twitter"
            >
              𝕏
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary-400 transition-colors"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary-400 transition-colors"
              aria-label="Instagram"
            >
              📷
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
