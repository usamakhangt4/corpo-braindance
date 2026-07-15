import { describe, expect, it } from 'vitest'
import { fileBuzzword, formatSavedBriefs, generateBuzzword } from '../src/lib/buzzwords/lab'

describe('buzzword lab', () => {
  it('generates a complete phrase locally from a selected role', () => {
    const values = [0, 0, 0, 0, 0, 0]
    const result = generateBuzzword('ceo', () => values.shift() ?? 0)

    expect(result).toEqual({
      phrase: 'Holistically Empower Mission-critical Synergies',
      fullSentence: 'Our goal is to holistically empower the mission-critical synergies to drive long-term value.',
      role: 'ceo',
      score: 80,
    })
  })

  it('saves each unique phrase once', () => {
    const buzzword = generateBuzzword('tech', () => 0)
    const first = fileBuzzword([], buzzword)
    const duplicate = fileBuzzword(first.entries, buzzword)

    expect(first.added).toBe(true)
    expect(first.entries).toHaveLength(1)
    expect(first.entries[0]).toMatchObject({ ...buzzword, source: 'dossier' })
    expect(duplicate).toEqual({ added: false, entries: first.entries })
  })

  it('formats saved phrases for clipboard export', () => {
    const filed = fileBuzzword([], generateBuzzword('tech', () => 0)).entries
    const output = formatSavedBriefs(filed)

    expect(output).toContain('CORPO // BRAINDANCE')
    expect(output).toContain('SAVED BRIEFS // 1 ITEM')
    expect(output).toContain('01 // ENGINEERING // 80%')
    expect(output).toContain(filed[0].phrase)
    expect(output).toContain(`“${filed[0].fullSentence}”`)
  })
})
