export type BuzzwordRole = 'ceo' | 'sales' | 'tech'
export type VoteAction = 'promote' | 'fire'

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

export interface HallEntry {
  id: string
  phrase: string
  meaning: string
  role: BuzzwordRole
  score: number
  baseVotes: number
  source: 'curated' | 'dossier'
  filedAt?: string
}

export interface RankedHallEntry extends HallEntry {
  votes: number
  userVote: VoteAction | null
}

export type LocalVotes = Record<string, VoteAction>
