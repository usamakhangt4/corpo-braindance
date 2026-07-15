export type BuzzwordRole = 'ceo' | 'sales' | 'tech'

export interface BuzzwordData {
  phrase: string
  fullSentence: string
  role: BuzzwordRole
  score: number
}

export interface DossierEntry extends BuzzwordData {
  id: string
  filedAt: string
  source: 'dossier'
}
