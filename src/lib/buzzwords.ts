import { BUZZWORD_DATA } from './constants/buzzwords'
import type { BuzzwordData, BuzzwordRole } from './types/buzzword'

type BuzzwordSource = (typeof BUZZWORD_DATA)[keyof typeof BUZZWORD_DATA]

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const titleCase = (str: string): string =>
  str.replace(/\w\S*/g, (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())

export function generateBuzzword(role: BuzzwordRole = 'ceo'): BuzzwordData {
  const source: BuzzwordSource = BUZZWORD_DATA[role] ?? BUZZWORD_DATA.ceo

  const adv = pick(source.adverbs)
  const verb = pick(source.verbs)
  const adj = pick(source.adjectives)
  const noun = pick(source.nouns)

  const phrase = titleCase(`${adv} ${verb} ${adj} ${noun}`)

  // Pick a random template and inject the phrase (lowercased for the middle of sentences)
  const sentenceTemplate = pick(source.templates)
  const fullSentence = sentenceTemplate(`${adv} ${verb} the ${adj} ${noun}`)

  return {
    phrase,
    fullSentence,
    role: role.toUpperCase(),
    score: Math.floor(Math.random() * 20) + 80, // Random score between 80-99
  }
}
