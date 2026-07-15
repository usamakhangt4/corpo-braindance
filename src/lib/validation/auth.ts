export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/

export function isValidUsername(value: unknown): value is string {
  return typeof value === 'string' && USERNAME_PATTERN.test(value)
}

export function isValidSignInIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 3 && value.length <= 254
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 256
}
