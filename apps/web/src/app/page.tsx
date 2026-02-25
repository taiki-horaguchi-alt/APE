import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import {
  BarChart3,
  Map,
  TrendingUp,
  Users,
  Leaf,
  Shield,
  ArrowRight,
  Check,
} from 'lucide-react'

const features = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: '土壌分析',
    description:
      '衛星データとAIを活用した土壌分析で、あなたの農地に最適な作物を提案します。',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: '収益シミュレーション',
    description:
      '作付け計画から年間の収支をシミュレーション。リスクシナリオも考慮した経営判断をサポートします。',
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: '販路マッチング',
    description:
      '近隣のレストラン、直売所、JA などの販路をマップ上で可視化。最適な取引先を見つけます。',
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: '市況情報',
    description:
      '全国の卸売市場の価格動向をリアルタイムで把握。出荷タイミングの最適化に役立ちます。',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'コミュニティ',
    description:
      '近隣農家の話題や知見を共有。地域の農業情報をいち早くキャッチできます。',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'リスク管理',
    description:
      '台風、猛暑、霜害などのリスクシナリオを想定した経営計画を立てられます。',
  },
]

const steps = [
  {
    number: '01',
    title: '農園情報を登録',
    description:
      '農園名、作業形態、興味のある作物を入力するだけで、あなた専用のダッシュボードが完成します。',
  },
  {
    number: '02',
    title: '土壌を診断',
    description:
      '農地の位置情報から衛星データを取得し、AIが土壌の特性を分析。最適な作物を提案します。',
  },
  {
    number: '03',
    title: '経営計画を立てる',
    description:
      '作物を選択して収支シミュレーション。リスクシナリオも考慮した計画を立てられます。',
  },
  {
    number: '04',
    title: '販路を見つける',
    description:
      'マップから近隣の取引先を探索。レストラン、直売所、JAなど多様な販路を見つけられます。',
  },
]

const testimonials = [
  {
    quote:
      '土壌分析の結果を見て寒締めほうれん草に切り替えたところ、収入が1.5倍になりました。',
    author: '田中 太郎',
    role: '岐阜県高山市 / 有機農家',
    avatar: '👨‍🌾',
  },
  {
    quote:
      '販路マッチングで地元のレストランと契約できました。今では安定した収入源になっています。',
    author: '鈴木 花子',
    role: '北海道長沼町 / 野菜農家',
    avatar: '👩‍🌾',
  },
  {
    quote:
      'シミュレーション機能で台風被害のリスクを事前に把握できました。おかげで融資の相談もスムーズでした。',
    author: '佐藤 健一',
    role: '新潟県 / 米農家',
    avatar: '👨‍🌾',
  },
]

const plans = [
  {
    name: 'フリー',
    price: '¥0',
    period: '永久無料',
    description: 'まずは試してみたい方に',
    features: [
      '土壌分析（月3回まで）',
      '収益シミュレーション',
      '市況情報の閲覧',
      'コミュニティ参加',
    ],
    cta: '無料で始める',
    popular: false,
  },
  {
    name: 'プロ',
    price: '¥2,980',
    period: '/月',
    description: '本格的に活用したい農家の方に',
    features: [
      '土壌分析（無制限）',
      '詳細な収益シミュレーション',
      '販路マッチング機能',
      'IoTセンサー連携',
      '優先サポート',
    ],
    cta: '14日間無料で試す',
    popular: true,
  },
  {
    name: 'エンタープライズ',
    price: 'お問い合わせ',
    period: '',
    description: '法人・組合向け',
    features: [
      'プロプランの全機能',
      '複数農地の一括管理',
      'API連携',
      '専任サポート',
      'カスタム開発',
    ],
    cta: 'お問い合わせ',
    popular: false,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
              農業経営を、
              <br />
              <span className="text-primary-600">データで変える。</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              APEは、土壌分析、収益シミュレーション、販路マッチングを
              ワンストップで提供する農業経営支援プラットフォームです。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                無料で始める
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="lg">
                デモを見る
              </Button>
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              クレジットカード不要・3分で登録完了
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="aspect-[16/9] max-w-5xl mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <span className="text-6xl mb-4 block">📊</span>
                <p className="text-primary-700 font-medium">
                  ダッシュボード画面のイメージ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              農家の経営課題を解決する機能
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              データ活用で、勘や経験だけに頼らない経営判断をサポートします。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card card-hover group"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              かんたん4ステップで始められます
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              複雑な設定は不要。すぐに使い始められます。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-primary-200" />
                )}
                <div className="relative bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              導入農家の声
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              全国の農家の皆様にご利用いただいています。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100"
              >
                <p className="text-neutral-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              無料プランから始めて、必要に応じてアップグレードできます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-8 border-2 relative ${
                  plan.popular
                    ? 'border-primary-500 shadow-lg'
                    : 'border-neutral-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    人気
                  </div>
                )}
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-neutral-500 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今すぐAPEを始めましょう
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            無料プランで全ての基本機能をお試しいただけます。
            クレジットカード不要、3分で登録完了。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-primary-50 gap-2"
            >
              無料で始める
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-primary-500"
            >
              お問い合わせ
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
