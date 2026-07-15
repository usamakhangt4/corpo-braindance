import { describe, expect, it } from 'vitest'
import { fileBuzzword, generateBuzzword, rankHallEntries, toggleLocalVote } from '../src/lib/buzzwords/lab'

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

  it('files unique phrases to the local dossier', () => {
    const buzzword = generateBuzzword('tech', () => 0)
    const first = fileBuzzword([], buzzword)
    const duplicate = fileBuzzword(first.entries, buzzword)

    expect(first.added).toBe(true)
    expect(first.entries).toHaveLength(1)
    expect(first.entries[0]).toMatchObject({ ...buzzword, source: 'dossier' })
    expect(duplicate).toEqual({ added: false, entries: first.entries })
  })

  it('toggles and switches a browser-local vote', () => {
    const promoted = toggleLocalVote({}, 'boardroom-singularity', 'promote')
    const cleared = toggleLocalVote(promoted, 'boardroom-singularity', 'promote')
    const fired = toggleLocalVote(promoted, 'boardroom-singularity', 'fire')

    expect(promoted).toEqual({ 'boardroom-singularity': 'promote' })
    expect(cleared).toEqual({})
    expect(fired).toEqual({ 'boardroom-singularity': 'fire' })
  })

  it('merges filed phrases into the curated hall and applies local votes', () => {
    const filed = fileBuzzword([], generateBuzzword('sales', () => 0)).entries
    const votes = toggleLocalVote({}, filed[0].id, 'promote')
    const ranking = rankHallEntries(filed, votes)
    const localEntry = ranking.find((entry) => entry.id === filed[0].id)

    expect(ranking.length).toBeGreaterThan(filed.length)
    expect(localEntry).toMatchObject({ source: 'dossier', votes: 1, userVote: 'promote' })
    expect(ranking.map((entry) => entry.votes)).toEqual(
      [...ranking.map((entry) => entry.votes)].sort((left, right) => right - left),
    )
  })
})
