export const BUZZWORD_LIMITS = {
  phrase: 200,
  fullSentence: 1000,
} as const

const VALID_ROLES = new Set(['CEO', 'SALES', 'TECH'])

export interface ValidBuzzwordSubmission {
  phrase: string
  fullSentence: string
  role: 'CEO' | 'SALES' | 'TECH'
  score: number
}

type ValidationResult =
  | { success: true; data: ValidBuzzwordSubmission }
  | { success: false; error: string }

export function validateBuzzwordSubmission(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { success: false, error: 'Invalid buzzword submission.' }
  }

  const candidate = input as Record<string, unknown>
  const { phrase, fullSentence, role, score } = candidate

  if (typeof phrase !== 'string' || phrase.length < 1 || phrase.length > BUZZWORD_LIMITS.phrase) {
    return { success: false, error: `Phrase must be between 1 and ${BUZZWORD_LIMITS.phrase} characters.` }
  }

  if (
    typeof fullSentence !== 'string' ||
    fullSentence.length < 1 ||
    fullSentence.length > BUZZWORD_LIMITS.fullSentence
  ) {
    return {
      success: false,
      error: `Meaning must be between 1 and ${BUZZWORD_LIMITS.fullSentence} characters.`,
    }
  }

  if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
    return { success: false, error: 'Invalid department.' }
  }

  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 100) {
    return { success: false, error: 'Synergy score must be a whole number between 0 and 100.' }
  }

  return {
    success: true,
    data: {
      phrase,
      fullSentence,
      role: role as ValidBuzzwordSubmission['role'],
      score,
    },
  }
}
