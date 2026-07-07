/**
 * Global teardown de Playwright
 * Elimina los usuarios de test creados por global-setup.ts.
 * Se ejecuta UNA VEZ después de todos los tests.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_CLIENT_EMAIL = process.env.TEST_CLIENT_EMAIL!
const TEST_LAWYER_EMAIL = process.env.TEST_LAWYER_EMAIL!

async function globalTeardown() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n🧹 Limpiando usuarios de test...')

  const { data: users } = await supabase.auth.admin.listUsers()
  const testEmails = [TEST_CLIENT_EMAIL, TEST_LAWYER_EMAIL]

  for (const email of testEmails) {
    const user = users?.users?.find((u) => u.email === email)
    if (user) {
      await supabase.auth.admin.deleteUser(user.id)
      console.log('🗑️  Eliminado:', email)
    }
  }

  console.log('✅ Teardown completo\n')
}

export default globalTeardown
