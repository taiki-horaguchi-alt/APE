import type { Location, Buyer } from '../types'

export const LOCATIONS: Record<string, Location> = {
  kokufu: {
    id: 'kokufu',
    name: '飛騨高山市国府町',
    prefecture: '岐阜県',
    city: '高山市',
    area: '国府町',
    coordinates: { latitude: 36.2306, longitude: 137.2578 },
    elevation: 540,
    climateZone: '内陸性気候・積雪寒冷地',
    annualTemp: 10.5,
    annualRainfall: 1900,
    snowDays: 85,
    frostFreeDays: 150,
    soilType: '黒ボク土・褐色森林土',
    mainCrops: ['飛騨ねぎ', '飛騨紅かぶ', 'ほうれん草', 'トマト', 'りんご'],
    challenges: [
      '冬期の積雪による作業困難',
      '獣害（イノシシ・シカ）',
      '高齢化による担い手不足',
    ],
    description:
      '飛騨山脈の麓、宮川流域に広がる中山間地。寒暖差が大きく、野菜の糖度が上がりやすい。',
  },
  naganuma: {
    id: 'naganuma',
    name: '長沼町（北海道）',
    prefecture: '北海道',
    city: '夕張郡長沼町',
    area: '長沼町',
    coordinates: { latitude: 43.0111, longitude: 141.695 },
    elevation: 25,
    climateZone: '亜寒帯湿潤気候・石狩平野',
    annualTemp: 7.0,
    annualRainfall: 1100,
    snowDays: 130,
    frostFreeDays: 140,
    soilType: '沖積土・泥炭土',
    mainCrops: ['小麦', '馬鈴薯', '玉ねぎ', 'キャベツ', 'アスパラガス'],
    challenges: [
      '冬期の厳しい寒さ',
      '泥炭地の地盤沈下',
      '大消費地への物流コスト',
    ],
    description:
      '札幌から車で40分。石狩平野の肥沃な土壌を活かした都市近郊型農業が盛ん。',
  },
}

export const BUYERS: Record<string, Buyer[]> = {
  kokufu: [
    {
      id: 'kokufu_1',
      name: '道の駅 飛騨古川いぶし',
      type: 'direct_sales',
      coordinates: { latitude: 36.2406, longitude: 137.2678 },
      distance: '3km',
      demandCrops: ['飛騨ねぎ', '飛騨紅かぶ', 'ほうれん草', 'トマト'],
      priceLevel: '中〜高',
      contact: '登録制・毎朝9時までに納品',
      matchScore: 92,
    },
    {
      id: 'kokufu_2',
      name: '高山グリーンホテル',
      type: 'hotel',
      coordinates: { latitude: 36.14, longitude: 137.26 },
      distance: '12km',
      demandCrops: ['地元野菜全般', '季節の山菜'],
      priceLevel: '高',
      contact: '仕入れ担当: 料理長直通',
      matchScore: 88,
    },
    {
      id: 'kokufu_3',
      name: '飛騨高山まちの博物館カフェ',
      type: 'restaurant',
      coordinates: { latitude: 36.14, longitude: 137.25 },
      distance: '10km',
      demandCrops: ['有機野菜', '珍しい品種'],
      priceLevel: '高',
      contact: '週1回のサンプル持ち込みOK',
      matchScore: 85,
    },
    {
      id: 'kokufu_4',
      name: 'JA飛騨 野菜集荷場',
      type: 'ja',
      coordinates: { latitude: 36.22, longitude: 137.24 },
      distance: '8km',
      demandCrops: ['規格品全般'],
      priceLevel: '中',
      contact: '組合員登録が必要',
      matchScore: 75,
    },
    {
      id: 'kokufu_5',
      name: '飛騨高山宮川朝市',
      type: 'direct_sales',
      coordinates: { latitude: 36.14, longitude: 137.26 },
      distance: '11km',
      demandCrops: ['観光客向け野菜', '加工品'],
      priceLevel: '中〜高',
      contact: '出店登録制・観光シーズン有利',
      matchScore: 82,
    },
  ],
  naganuma: [
    {
      id: 'naganuma_1',
      name: '道の駅 マオイの丘公園',
      type: 'direct_sales',
      coordinates: { latitude: 43.02, longitude: 141.7 },
      distance: '2km',
      demandCrops: ['季節野菜全般', 'アスパラガス'],
      priceLevel: '中',
      contact: '生産者登録制・年会費あり',
      matchScore: 90,
    },
    {
      id: 'naganuma_2',
      name: '札幌中央卸売市場',
      type: 'market',
      coordinates: { latitude: 43.06, longitude: 141.35 },
      distance: '35km',
      demandCrops: ['規格品大量出荷'],
      priceLevel: '中',
      contact: '卸業者を通じて出荷',
      matchScore: 78,
    },
    {
      id: 'naganuma_3',
      name: '北海道レストラン「ミルクレア」',
      type: 'restaurant',
      coordinates: { latitude: 43.06, longitude: 141.35 },
      distance: '40km（札幌市内）',
      demandCrops: ['有機野菜', '寒締め野菜', '珍しい品種'],
      priceLevel: '高',
      contact: 'シェフとの契約栽培可',
      matchScore: 95,
    },
    {
      id: 'naganuma_4',
      name: '長沼町農産物直売所「かあさんの店」',
      type: 'direct_sales',
      coordinates: { latitude: 43.01, longitude: 141.69 },
      distance: '1km',
      demandCrops: ['地元野菜全般', '加工品'],
      priceLevel: '中',
      contact: '地元優先・観光客も多い',
      matchScore: 88,
    },
    {
      id: 'naganuma_5',
      name: '新千歳空港 空弁・土産物店',
      type: 'supermarket',
      coordinates: { latitude: 42.78, longitude: 141.68 },
      distance: '20km',
      demandCrops: ['ブランド野菜', '加工品', 'ギフト用'],
      priceLevel: '高',
      contact: '加工業者との連携が必要',
      matchScore: 72,
    },
    {
      id: 'naganuma_6',
      name: 'コープさっぽろ 産直コーナー',
      type: 'supermarket',
      coordinates: { latitude: 43.06, longitude: 141.35 },
      distance: '各店舗',
      demandCrops: ['有機・減農薬野菜'],
      priceLevel: '中〜高',
      contact: '生産者登録制・品質基準あり',
      matchScore: 85,
    },
  ],
}

export function getLocation(id: string): Location | undefined {
  return LOCATIONS[id]
}

export function getLocationNames(): string[] {
  return Object.values(LOCATIONS).map((loc) => loc.name)
}

export function getBuyersForLocation(locationId: string): Buyer[] {
  return BUYERS[locationId] || []
}
