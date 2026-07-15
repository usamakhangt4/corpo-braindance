import { BUZZWORD_DATA, ROLE_LABELS } from '../constants/buzzwords'
import type { BuzzwordData, BuzzwordRole, DossierEntry } from '../types/buzzword'

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

export function formatDossier(entries: DossierEntry[]): string {
  if (entries.length === 0) return ''

  const recordLabel = entries.length === 1 ? 'RECORD' : 'RECORDS'
  const records = entries
    .map((entry, index) =>
      [
        `${String(index + 1).padStart(2, '0')} // ${ROLE_LABELS[entry.role]} // ${entry.score}%`,
        entry.phrase,
        `"${entry.fullSentence}"`,
      ].join('\n'),
    )
    .join('\n\n')

  return `CORPO // BRAINDANCE\nNEURAL DOSSIER // ${entries.length} ${recordLabel}\n\n${records}`
}
