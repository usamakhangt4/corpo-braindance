import { describe, expect, it } from 'vitest'
import { getSafeRedirectPath } from '../src/lib/security/redirect'

describe('getSafeRedirectPath', () => {
  it('preserves legitimate same-origin application paths', () => {
    expect(getSafeRedirectPath('/hall-of-shame?sort=top#rankings')).toBe('/hall-of-shame?sort=top#rankings')
  })

  it.each([
    'https://attacker.example/phish',
    '//attacker.example/phish',
    '\\attacker.example/phish',
    '/\\attacker.example/phish',
    'javascript:alert(1)',
    'hall-of-shame',
  ])('rejects unsafe redirect target %s', (target) => {
    expect(getSafeRedirectPath(target)).toBe('/')
  })
})
