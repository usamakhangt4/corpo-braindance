import type { BUZZWORD_ROLES, TECH_FIELDS } from '../constants/buzzwords'

export type BuzzwordRole = (typeof BUZZWORD_ROLES)[number]
export type TechField = (typeof TECH_FIELDS)[number]['id']
export type GenerationVoice = BuzzwordRole | 'random'
export type GenerationField = TechField | 'all'

export interface BuzzwordData {
  phrase: string
  fullSentence: string
  role: BuzzwordRole
  field: TechField
  score: number
}

export interface DossierEntry extends BuzzwordData {
  id: string
  filedAt: string
  source: 'dossier'
}
