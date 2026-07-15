const FALLBACK_REDIRECT = '/'

export function getSafeRedirectPath(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return FALLBACK_REDIRECT
  }

  try {
    const baseUrl = new URL('https://app.invalid')
    const targetUrl = new URL(candidate, baseUrl)

    if (targetUrl.origin !== baseUrl.origin) {
      return FALLBACK_REDIRECT
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
  } catch {
    return FALLBACK_REDIRECT
  }
}
