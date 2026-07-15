import {
  BUZZWORD_DATA,
  BUZZWORD_ROLES,
  ROLE_LABELS,
  TECH_FIELD_DATA,
  TECH_FIELD_LABELS,
  TECH_FIELDS,
} from '../constants/buzzwords'
import type { BuzzwordData, DossierEntry, GenerationField, GenerationVoice } from '../types/buzzword'

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

export function generateBuzzword(
  selectedRole: GenerationVoice = 'random',
  random: RandomSource = Math.random,
  selectedField: GenerationField = 'all',
): BuzzwordData {
  const role = selectedRole === 'random' ? pick(BUZZWORD_ROLES, random) : selectedRole
  const field = selectedField === 'all' ? pick(TECH_FIELDS, random).id : selectedField
  const voice = BUZZWORD_DATA[role]
  const stack = TECH_FIELD_DATA[field]
  const adverb = pick(voice.adverbs, random)
  const verb = pick(stack.verbs, random)
  const adjective = pick(stack.adjectives, random)
  const noun = pick(stack.nouns, random)
  const template = pick(voice.templates, random)

  return {
    phrase: titleCase(`${adverb} ${verb} ${adjective} ${noun}`),
    fullSentence: template(`${adverb} ${verb} ${adjective} ${noun}`),
    role,
    field,
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

export function formatSavedBriefs(entries: DossierEntry[]): string {
  if (entries.length === 0) return ''

  const itemLabel = entries.length === 1 ? 'ITEM' : 'ITEMS'
  const records = entries
    .map((entry, index) =>
      [
        `${String(index + 1).padStart(2, '0')} // ${ROLE_LABELS[entry.role]} // ${entry.score}%${entry.field ? ` // ${TECH_FIELD_LABELS[entry.field] ?? 'LEGACY STACK'}` : ''}`,
        entry.phrase,
        `“${entry.fullSentence}”`,
      ].join('\n'),
    )
    .join('\n\n')

  return `CORPO // BRAINDANCE\nSAVED BRIEFS // ${entries.length} ${itemLabel}\n\n${records}`
}
