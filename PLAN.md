# Implementation Plan: APE Mobile App (React Native + Expo)

## Overview

APE (Agri-Tech Planning Engine) is a Japanese agricultural management mobile application that helps farmers make data-driven decisions about crop selection, understand soil conditions, find buyers, simulate profits, and track market prices. The app follows a "Market-In" approach - finding buyers first, then planning what to grow.

## Requirements

### Functional Requirements
- **Onboarding Flow**: 3-screen setup (profile, labor resources, crop interests)
- **Home Dashboard**: Greeting, monthly profit summary, community topics
- **Land Match (Soil Analysis)**: Satellite map, polygon selection, soil estimation, crop recommendations
- **Buyer/Demand Map**: Interactive map with restaurant/hotel/chain pins, filters, buyer details
- **Simulator (Finance/Risk)**: Revenue/cash flow toggle, monthly charts, what-if analysis
- **Market (Price Data)**: Category tabs, market selection, price trends, item-by-item pricing

### Non-Functional Requirements
- Japanese language UI (with i18n support for future)
- Mobile-first, iOS and Android support
- Offline-capable for field use
- Performance: < 3s initial load, < 100ms interactions
- Accessibility: WCAG 2.1 AA compliance

## Architecture

### Tech Stack Decisions

| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | Expo SDK 52+ | Managed workflow, EAS Build, OTA updates |
| Navigation | Expo Router v4 | File-based routing, deep linking, type-safe |
| Styling | NativeWind v4 | Tailwind CSS for RN, design system consistency |
| State | Zustand | Simple, TypeScript-friendly, no boilerplate |
| Charts | Victory Native | Best RN chart library, SVG-based |
| Maps | react-native-maps | Google Maps/Apple Maps, polygon support |
| Forms | React Hook Form + Zod | Validation, performance |
| API | TanStack Query | Caching, offline, background sync |
| Storage | MMKV | Fast key-value storage for persistence |

### Project Structure

```
ape-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry point (splash/auth check)
│   ├── (auth)/                   # Auth group
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── _layout.tsx
│   │   ├── profile.tsx           # Screen 1: Farm profile
│   │   ├── labor.tsx             # Screen 2: Labor resources
│   │   └── crops.tsx             # Screen 3: Crop interests
│   └── (tabs)/                   # Main app tabs
│       ├── _layout.tsx           # Tab navigator
│       ├── index.tsx             # Home dashboard
│       ├── land-match.tsx        # Soil analysis
│       ├── map.tsx               # Buyer/demand map
│       ├── simulator.tsx         # Finance/risk simulator
│       └── market.tsx            # Price data
├── src/
│   ├── components/               # Shared components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── charts/               # Chart components
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── CashFlowChart.tsx
│   │   │   └── PriceTrendChart.tsx
│   │   ├── maps/                 # Map components
│   │   │   ├── SatelliteMap.tsx
│   │   │   ├── BuyerMap.tsx
│   │   │   ├── MapMarker.tsx
│   │   │   └── PolygonSelector.tsx
│   │   └── layout/               # Layout components
│   │       ├── Header.tsx
│   │       ├── TabBar.tsx
│   │       └── SafeArea.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── onboarding/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── LaborSelector.tsx
│   │   │   ├── CropSelector.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   ├── dashboard/
│   │   │   ├── GreetingCard.tsx
│   │   │   ├── ProfitSummaryCard.tsx
│   │   │   ├── CommunityTopics.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── land-match/
│   │   │   ├── SoilAnalysisCard.tsx
│   │   │   ├── CropRecommendations.tsx
│   │   │   ├── IoTUpsellBanner.tsx
│   │   │   └── FieldSelector.tsx
│   │   ├── buyer-map/
│   │   │   ├── BuyerFilterChips.tsx
│   │   │   ├── CropFilterInput.tsx
│   │   │   ├── BuyerDetailCard.tsx
│   │   │   └── BulkDealCTA.tsx
│   │   ├── simulator/
│   │   │   ├── ViewToggle.tsx
│   │   │   ├── CashFlowSection.tsx
│   │   │   ├── AlertBanner.tsx
│   │   │   ├── WhatIfSection.tsx
│   │   │   └── RiskToggle.tsx
│   │   └── market/
│   │       ├── CategoryTabs.tsx
│   │       ├── MarketSelector.tsx
│   │       ├── PriceChart.tsx
│   │       └── PriceList.tsx
│   ├── stores/                   # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useOnboardingStore.ts
│   │   ├── useFarmStore.ts
│   │   ├── useSimulatorStore.ts
│   │   └── useMarketStore.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocation.ts
│   │   ├── useOffline.ts
│   │   └── useTheme.ts
│   ├── services/                 # API services
│   │   ├── api.ts                # Base API client
│   │   ├── authService.ts
│   │   ├── cropService.ts
│   │   ├── soilService.ts
│   │   ├── buyerService.ts
│   │   ├── marketService.ts
│   │   └── simulatorService.ts
│   ├── types/                    # TypeScript types
│   │   ├── crop.ts
│   │   ├── location.ts
│   │   ├── soil.ts
│   │   ├── buyer.ts
│   │   ├── market.ts
│   │   ├── simulator.ts
│   │   └── index.ts
│   ├── constants/                # App constants
│   │   ├── colors.ts
│   │   ├── theme.ts
│   │   ├── crops.ts              # Crop master data
│   │   ├── locations.ts          # Location data
│   │   └── markets.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Currency, date, number formatters
│   │   ├── calculations.ts       # Profit, cashflow calculations
│   │   ├── validators.ts         # Zod schemas
│   │   └── storage.ts            # MMKV helpers
│   └── i18n/                     # Internationalization
│       ├── index.ts
│       └── locales/
│           └── ja.json
├── assets/                       # Static assets
│   ├── images/
│   │   ├── crops/                # Crop icons
│   │   ├── avatars/              # Default avatars
│   │   └── onboarding/           # Onboarding illustrations
│   └── fonts/
├── app.json                      # Expo config
├── tailwind.config.js            # NativeWind config
├── tsconfig.json
├── package.json
└── babel.config.js
```

## Data Models (TypeScript Interfaces)

### Crop Types

```typescript
// src/types/crop.ts

export type Season = 'summer' | 'winter'
export type WaterRequirement = '低' | '中' | '高'
export type FrostTolerance = '低' | '中' | '高' | '極高'
export type Difficulty = 1 | 2 | 3 | 4 | 5

export interface TemperatureRange {
  min: number
  max: number
}

export interface SoilPHRange {
  min: number
  max: number
}

export interface Crop {
  id: string
  name: string
  nameEn: string
  season: Season
  category: string
  plantingMonths: number[]
  harvestMonths: number[]
  optimalTemp: TemperatureRange
  frostTolerance: FrostTolerance
  revenuePerUnit: number      // Per 10a in JPY
  costPerUnit: number         // Per 10a in JPY
  difficulty: Difficulty
  waterRequirement: WaterRequirement
  suitableSoilPH: SoilPHRange
  rotationAvoid: string[]
  description: string
  iconUrl?: string
}

export interface CropSuitability {
  cropId: string
  suitabilityScore: number    // 0-100
  successRate: number         // 0-100
  phMatch: '○' | '△' | '×'
  drainageMatch: '○' | '△' | '×'
  organicMatch: '○' | '△' | '×'
  recommendation: string
}
```

### Location Types

```typescript
// src/types/location.ts

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  id: string
  name: string
  prefecture: string
  city: string
  area: string
  coordinates: Coordinates
  elevation: number           // meters
  climateZone: string
  annualTemp: number          // Celsius
  annualRainfall: number      // mm
  snowDays: number
  frostFreeDays: number
  soilType: string
  mainCrops: string[]
  challenges: string[]
  description: string
}

export interface Field {
  id: string
  name: string
  locationId: string
  polygon: Coordinates[]      // For map polygon
  areaSize: number            // In 10a units
  soilProfileId?: string
}
```

### Soil Types

```typescript
// src/types/soil.ts

export interface SoilMetric {
  value: number
  optimal: number
  unit: string
  label: string
  description: string
}

export interface SoilMetrics {
  pH: SoilMetric
  EC: SoilMetric
  CEC: SoilMetric
  organicMatter: SoilMetric
  nitrogen: SoilMetric
  phosphorus: SoilMetric
  potassium: SoilMetric
  calcium: SoilMetric
  magnesium: SoilMetric
  drainage: SoilMetric
}

export interface SoilProfile {
  id: string
  locationId: string
  name: string
  soilType: string
  metrics: SoilMetrics
  overallScore: number        // 0-100
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  lastUpdated: string         // ISO date
  source: 'satellite' | 'iot' | 'manual'
}
```

### Buyer Types

```typescript
// src/types/buyer.ts

export type BuyerType =
  | 'restaurant'
  | 'hotel'
  | 'chain_hq'
  | 'direct_sales'
  | 'ja'
  | 'market'
  | 'supermarket'

export interface Buyer {
  id: string
  name: string
  type: BuyerType
  coordinates: Coordinates
  distance: string            // "5km"
  demandCrops: string[]
  priceLevel: '低' | '中' | '中〜高' | '高'
  contact: string
  matchScore: number          // 0-100
  monthlyVolume?: number      // kg
  description?: string
}

export interface BuyerFilter {
  types: BuyerType[]
  crops: string[]
  maxDistance?: number
  minMatchScore?: number
}
```

### Simulator Types

```typescript
// src/types/simulator.ts

export type ViewMode = 'revenue' | 'cashflow'

export interface MonthlyData {
  month: number               // 1-12
  income: number
  expense: number
  cashflow: number
  cumulative: number
}

export interface RiskScenario {
  id: string
  name: string                // "台風", "猛暑"
  impactPercent: number       // -30, -10
  enabled: boolean
}

export interface SimulationResult {
  summerCropId: string
  winterCropId: string
  areaSize: number            // In 10a
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  monthlyData: MonthlyData[]
  riskAdjustedProfit: number
  alerts: SimulationAlert[]
}

export interface SimulationAlert {
  type: 'warning' | 'danger' | 'info'
  month: number
  message: string             // Japanese
}
```

### Market Types

```typescript
// src/types/market.ts

export type MarketCategory = 'vegetables' | 'fruits' | 'other'

export interface Market {
  id: string
  name: string                // "大阪本場"
  location: string
}

export interface PricePoint {
  date: string                // ISO date
  price: number               // JPY per kg
}

export interface CropPrice {
  cropId: string
  cropName: string
  marketId: string
  currentPrice: number
  previousPrice: number
  changePercent: number
  unit: string                // "kg"
  history: PricePoint[]
  threeYearAverage: PricePoint[]
}
```

### User Types

```typescript
// src/types/user.ts

export type LaborType = 'solo' | 'partner' | 'family_employees'
export type WorkHoursType = 'full_time' | 'part_time'

export interface UserProfile {
  id: string
  farmName: string
  avatarUrl?: string
  laborType: LaborType
  workHours: WorkHoursType
  interestedCrops: string[]   // Crop IDs
  locationId?: string
  fields: Field[]
  createdAt: string
  onboardingCompleted: boolean
}

export interface OnboardingState {
  step: 1 | 2 | 3
  profile: Partial<UserProfile>
}
```

## Navigation Structure

```
Root (_layout.tsx)
├── index.tsx (Splash/Auth Check)
├── (auth)
│   └── login.tsx
├── (onboarding)
│   ├── profile.tsx     → /onboarding/profile
│   ├── labor.tsx       → /onboarding/labor
│   └── crops.tsx       → /onboarding/crops
└── (tabs)
    ├── index.tsx       → /home (Tab 1)
    ├── land-match.tsx  → /land-match (Tab 2)
    ├── map.tsx         → /map (Tab 3)
    ├── simulator.tsx   → /simulator (Tab 4)
    └── market.tsx      → /market (Tab 5)
```

## Implementation Phases

### Phase 1: Project Setup & Foundation (Days 1-2)

| Step | File | Action |
|------|------|--------|
| 1 | `ape-mobile/` | Initialize Expo project with `npx create-expo-app@latest ape-mobile --template tabs` |
| 2 | `package.json` | Install all dependencies (NativeWind, Zustand, Victory Native, react-native-maps, etc.) |
| 3 | `tailwind.config.js`, `babel.config.js` | Configure NativeWind |
| 4 | `src/constants/colors.ts` | Define White & Green color palette |
| 5 | `src/types/*.ts` | Create all TypeScript type definitions |
| 6 | `src/components/ui/*.tsx` | Create base UI components (Button, Card, Input, Chip, Avatar, Badge) |

### Phase 2: State Management & Data Layer (Days 3-4)

| Step | File | Action |
|------|------|--------|
| 7 | `src/stores/*.ts` | Create Zustand stores (auth, onboarding, farm, simulator, market) |
| 8 | `src/constants/crops.ts` | Port Python crop data to TypeScript (18 crops) |
| 9 | `src/constants/locations.ts` | Port Python location data to TypeScript |
| 10 | `src/utils/calculations.ts` | Implement profit, cashflow, suitability calculations |
| 11 | `src/utils/formatters.ts` | Create Japanese currency, date, percentage formatters |

### Phase 3: Onboarding Flow (Days 5-6)

| Step | File | Action |
|------|------|--------|
| 12 | `app/(onboarding)/_layout.tsx` | Create stack navigator with progress indicator |
| 13 | `src/features/onboarding/ProgressIndicator.tsx` | 3-step progress dots |
| 14 | `app/(onboarding)/profile.tsx` | Farm name input with avatar picker |
| 15 | `app/(onboarding)/labor.tsx` | Labor type selection + work hours toggle |
| 16 | `app/(onboarding)/crops.tsx` | Multi-select crop grid |

### Phase 4: Tab Navigation & Home Dashboard (Days 7-8)

| Step | File | Action |
|------|------|--------|
| 17 | `app/(tabs)/_layout.tsx` | Bottom tab navigator with 5 tabs |
| 18 | `src/features/dashboard/GreetingCard.tsx` | Personalized greeting with avatar |
| 19 | `src/features/dashboard/ProfitSummaryCard.tsx` | Monthly profit display (¥320,000, +12%) |
| 20 | `src/features/dashboard/CommunityTopics.tsx` | Farmer tips and weather alerts |
| 21 | `app/(tabs)/index.tsx` | Assemble Home dashboard |

### Phase 5: Land Match / Soil Analysis (Days 9-11)

| Step | File | Action |
|------|------|--------|
| 22 | `src/components/maps/SatelliteMap.tsx` | react-native-maps with satellite view |
| 23 | `src/components/maps/PolygonSelector.tsx` | Touch-based polygon drawing |
| 24 | `src/features/land-match/SoilAnalysisCard.tsx` | Soil type, sunlight level display |
| 25 | `src/features/land-match/IoTUpsellBanner.tsx` | "Satellite estimate only" warning with CTA |
| 26 | `src/features/land-match/CropRecommendations.tsx` | Crop list with suitability scores |
| 27 | `app/(tabs)/land-match.tsx` | Assemble Land Match screen |

### Phase 6: Buyer/Demand Map (Days 12-14)

| Step | File | Action |
|------|------|--------|
| 28 | `src/components/maps/BuyerMap.tsx` | Map with colored markers |
| 29 | `src/components/maps/MapMarker.tsx` | Custom markers for buyer types |
| 30 | `src/features/buyer-map/BuyerFilterChips.tsx` | [All] [Restaurants] [Hotels] [Chain HQ] toggles |
| 31 | `src/features/buyer-map/CropFilterInput.tsx` | Chip input for crop filters |
| 32 | `src/features/buyer-map/BuyerDetailCard.tsx` | Bottom sheet with buyer info + bulk deal CTA |
| 33 | `app/(tabs)/map.tsx` | Assemble Buyer Map screen |

### Phase 7: Finance Simulator (Days 15-17)

| Step | File | Action |
|------|------|--------|
| 34 | `src/components/charts/LineChart.tsx` | Victory Native line chart wrapper |
| 35 | `src/components/charts/BarChart.tsx` | Victory Native bar chart wrapper |
| 36 | `src/components/charts/CashFlowChart.tsx` | Combined bar + line chart |
| 37 | `src/features/simulator/ViewToggle.tsx` | Revenue Summary / Cash Flow toggle |
| 38 | `src/features/simulator/AlertBanner.tsx` | Red warning for cash shortage |
| 39 | `src/features/simulator/WhatIfSection.tsx` | Risk toggles (typhoon -30%, heat -10%) |
| 40 | `app/(tabs)/simulator.tsx` | Assemble Simulator screen |

### Phase 8: Market Price Data (Days 18-19)

| Step | File | Action |
|------|------|--------|
| 41 | `src/components/charts/PriceTrendChart.tsx` | Current vs 3-year average chart |
| 42 | `src/features/market/CategoryTabs.tsx` | 野菜 / 果物 / その他 tabs |
| 43 | `src/features/market/MarketSelector.tsx` | Dropdown for market selection |
| 44 | `src/features/market/PriceList.tsx` | Item-by-item prices with trend arrows |
| 45 | `app/(tabs)/market.tsx` | Assemble Market screen |

### Phase 9: Integration & Polish (Days 20-22)

| Step | File | Action |
|------|------|--------|
| 46 | `app/_layout.tsx` | Root layout with providers |
| 47 | `app/index.tsx` | Auth check, redirect logic |
| 48 | `src/utils/storage.ts` | MMKV persistence setup |
| 49 | `src/hooks/useOffline.ts` | Network status detection |
| 50 | Various files | Add haptic feedback |

### Phase 10: Testing & Documentation (Days 23-25)

| Step | File | Action |
|------|------|--------|
| 51 | `__tests__/utils/*.test.ts` | Unit tests for calculations and formatters |
| 52 | `__tests__/components/*.test.tsx` | Component tests with RNTL |
| 53 | `__tests__/flows/*.test.tsx` | Integration tests for user flows |
| 54 | `e2e/*.spec.ts` | E2E tests with Detox/Maestro |
| 55 | `README.md` | Setup instructions, architecture docs |

## Testing Strategy

### Unit Tests (80%+ coverage)
- `src/utils/calculations.ts` - Profit, cashflow, suitability calculations
- `src/utils/formatters.ts` - Currency, date formatters
- `src/stores/*.ts` - Zustand store actions

### Integration Tests
- Onboarding flow (profile -> labor -> crops -> tabs)
- Simulator flow (select crops -> view cashflow -> toggle risks)
- Market flow (select category -> select market -> view prices)

### E2E Tests (Detox/Maestro)
- Complete onboarding journey
- Browse buyer map and tap markers
- Run profit simulation with what-if scenarios

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Polygon selector complexity | High | High | Start with simple rectangle selection, iterate to polygon |
| Map performance on low-end devices | Medium | Medium | Cluster markers, lazy load, limit visible markers |
| Victory Native compatibility | Medium | Medium | Have react-native-chart-kit as backup |
| Offline data sync conflicts | Medium | High | Last-write-wins strategy, manual conflict resolution UI |
| Japanese font rendering | Low | Medium | Bundle Noto Sans JP, test on both platforms |
| EAS Build errors | Medium | Medium | Test builds early and often, use development builds |

## Success Criteria

- [ ] All 5 tabs functional with mock data
- [ ] Onboarding flow complete with persistence
- [ ] Maps render with markers and polygon selection
- [ ] Charts display monthly cashflow data
- [ ] Price list shows trend arrows
- [ ] Works offline with cached data
- [ ] < 3s cold start on mid-range devices
- [ ] 80%+ unit test coverage
- [ ] No TypeScript errors
- [ ] Passes accessibility audit (basic)
- [ ] Japanese text renders correctly
- [ ] Builds successfully for iOS and Android

## Key Technical Decisions

1. **Expo over bare React Native**: Simpler setup, OTA updates, EAS Build eliminates native build complexity

2. **NativeWind over React Native Paper**: More flexibility for custom design, smaller bundle, familiar Tailwind syntax

3. **Zustand over Redux**: Simpler API, less boilerplate, excellent TypeScript support, perfect for this app size

4. **Victory Native over react-native-chart-kit**: Better customization, SVG-based (sharper), active maintenance

5. **File-based routing (Expo Router)**: Type-safe navigation, easier to reason about, matches web mental model

6. **MMKV over AsyncStorage**: 30x faster, synchronous API, ideal for frequent reads/writes

7. **TanStack Query for API**: Automatic caching, background refetching, offline support built-in

---

*Plan created: 2026-02-04*
