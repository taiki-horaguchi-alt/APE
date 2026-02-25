import type { Field } from './location'

export type LaborType = 'solo' | 'partner' | 'family_employees'
export type WorkHoursType = 'full_time' | 'part_time'

export interface UserProfile {
  id: string
  farmName: string
  avatarUrl?: string
  laborType: LaborType
  workHours: WorkHoursType
  interestedCrops: string[]
  locationId?: string
  fields: Field[]
  createdAt: string
  onboardingCompleted: boolean
}

export interface OnboardingState {
  step: 1 | 2 | 3
  profile: Partial<UserProfile>
}

export const LABOR_TYPE_LABELS: Record<LaborType, string> = {
  solo: '自分ひとり',
  partner: '夫婦/パートナー',
  family_employees: '家族・雇用',
}

export const LABOR_TYPE_ICONS: Record<LaborType, string> = {
  solo: 'person',
  partner: 'people',
  family_employees: 'groups',
}

export const WORK_HOURS_LABELS: Record<WorkHoursType, string> = {
  full_time: '専業',
  part_time: '兼業',
}
