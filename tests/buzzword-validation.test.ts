import { describe, expect, it } from 'vitest'
import { validateBuzzwordSubmission } from '../src/lib/validation/buzzword'

const validSubmission = {
  phrase: 'Strategically Leverage Dynamic Synergies',
  fullSentence: 'We need to strategically leverage the dynamic synergies across every department.',
  role: 'CEO',
  score: 92,
}

describe('validateBuzzwordSubmission', () => {
  it('accepts a generated buzzword submission', () => {
    expect(validateBuzzwordSubmission(validSubmission)).toEqual({ success: true, data: validSubmission })
  })

  it.each([
    null,
    { ...validSubmission, phrase: '' },
    { ...validSubmission, phrase: 'x'.repeat(201) },
    { ...validSubmission, fullSentence: 'x'.repeat(1001) },
    { ...validSubmission, role: 'ADMIN' },
    { ...validSubmission, score: -1 },
    { ...validSubmission, score: 101 },
    { ...validSubmission, score: 92.5 },
  ])('rejects malformed or unbounded input', (submission) => {
    expect(validateBuzzwordSubmission(submission).success).toBe(false)
  })
})
