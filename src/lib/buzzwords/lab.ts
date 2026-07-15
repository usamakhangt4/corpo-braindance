import { BUZZWORD_DATA } from '../constants/buzzwords'
import { CURATED_HALL_ENTRIES } from '../constants/hall-of-shame'
import type {
  BuzzwordData,
  BuzzwordRole,
  DossierEntry,
  HallEntry,
  LocalVotes,
  RankedHallEntry,
  VoteAction,
} from '../types/buzzword'

type RandomSource = () => number

const pick = <T>(items: readonly T[], random: RandomSource): T =>
  items[Math.min(Math.floor(random() * items.length), items.length - 1)]

const titleCase = (value: string): string =>
  value.replace(/\w\S*/g, (token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())

const createDossierId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `dossier-${crypto.randomUUID()}`
  }

  return `dossier-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function generateBuzzword(role: BuzzwordRole = 'ceo', random: RandomSource = Math.random): BuzzwordData {
  const source = BUZZWORD_DATA[role]
  const adverb = pick(source.adverbs, random)
  const verb = pick(source.verbs, random)
  const adjective = pick(source.adjectives, random)
  const noun = pick(source.nouns, random)
  const template = pick(source.templates, random)

  return {
    phrase: titleCase(`${adverb} ${verb} ${adjective} ${noun}`),
    fullSentence: template(`${adverb} ${verb} the ${adjective} ${noun}`),
    role,
    score: Math.floor(random() * 20) + 80,
  }
}

export function fileBuzzword(
  entries: DossierEntry[],
  buzzword: BuzzwordData,
): { added: boolean; entries: DossierEntry[] } {
  const duplicate = entries.some(
    (entry) => entry.phrase === buzzword.phrase && entry.fullSentence === buzzword.fullSentence,
  )

  if (duplicate) {
    return { added: false, entries }
  }

  const nextEntry: DossierEntry = {
    ...buzzword,
    id: createDossierId(),
    filedAt: new Date().toISOString(),
    source: 'dossier',
  }

  return { added: true, entries: [nextEntry, ...entries].slice(0, 20) }
}

export function toggleLocalVote(votes: LocalVotes, entryId: string, action: VoteAction): LocalVotes {
  if (votes[entryId] === action) {
    const nextVotes = { ...votes }
    delete nextVotes[entryId]
    return nextVotes
  }

  return { ...votes, [entryId]: action }
}

export function rankHallEntries(dossier: DossierEntry[], localVotes: LocalVotes): RankedHallEntry[] {
  const dossierEntries: HallEntry[] = dossier.map((entry) => ({
    id: entry.id,
    phrase: entry.phrase,
    meaning: entry.fullSentence,
    role: entry.role,
    score: entry.score,
    baseVotes: 0,
    source: 'dossier',
    filedAt: entry.filedAt,
  }))

  return [...CURATED_HALL_ENTRIES, ...dossierEntries]
    .map((entry) => {
      const userVote = localVotes[entry.id] ?? null
      const localDelta = userVote === 'promote' ? 1 : userVote === 'fire' ? -1 : 0

      return {
        ...entry,
        votes: entry.baseVotes + localDelta,
        userVote,
      }
    })
    .sort((left, right) => right.votes - left.votes || right.score - left.score || left.id.localeCompare(right.id))
}
