import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSchema = (name: string) => readFileSync(join(process.cwd(), 'supabase', 'schema', name), 'utf8')
const readMigration = () =>
  readFileSync(join(process.cwd(), 'supabase', 'migrations', '202607150001_harden_auth_and_votes.sql'), 'utf8')
const readSource = (path: string) => readFileSync(join(process.cwd(), 'src', ...path.split('/')), 'utf8')

describe('database authorization schema', () => {
  it('does not grant every authenticated user broad buzzword updates', () => {
    const schema = readSchema('buzzwords.sql')

    expect(schema).not.toContain('USING (auth.role() = \'authenticated\')')
    expect(schema).toContain('REVOKE UPDATE ON TABLE public.buzzwords FROM authenticated')
  })

  it('restricts the email resolver to the service role', () => {
    const schema = readSchema('profiles.sql')

    expect(schema).toContain("SET search_path = ''")
    expect(schema).toContain('REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM PUBLIC')
    expect(schema).toContain('REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM anon, authenticated')
    expect(schema).toContain('GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO service_role')
  })

  it('ships the authorization changes in the deployable migration', () => {
    const migration = readMigration()

    expect(migration).toContain('REVOKE UPDATE ON TABLE public.buzzwords FROM authenticated')
    expect(migration).toContain('REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM anon, authenticated')
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO service_role')
    expect(migration).toContain('USING (auth.uid() = user_id)')
  })

  it('resolves username sign-in through a server-only service-role client', () => {
    const action = readSource('app/actions/auth.ts')
    const serviceClient = readSource('lib/supabase/service.ts')

    expect(action).toContain("from '@/lib/supabase/service'")
    expect(action).toContain("const INVALID_CREDENTIALS = 'Invalid email, username, or password.'")
    expect(action).not.toMatch(/return\s*\{[^}]*email/u)
    expect(serviceClient).toContain("import 'server-only'")
    expect(serviceClient).toContain('process.env.SUPABASE_SERVICE_ROLE_KEY')
  })
})
