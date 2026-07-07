/**
 * Global setup de Playwright
 * Crea usuarios de test en Supabase via Admin API (email_confirm: true)
 * y arma los perfiles con el rol correcto.
 * Se ejecuta UNA VEZ antes de todos los tests.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEST_CLIENT_EMAIL = process.env.TEST_CLIENT_EMAIL!
const TEST_CLIENT_PASSWORD = process.env.TEST_CLIENT_PASSWORD!
const TEST_LAWYER_EMAIL = process.env.TEST_LAWYER_EMAIL!
const TEST_LAWYER_PASSWORD = process.env.TEST_LAWYER_PASSWORD!

async function globalSetup() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.test')
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n🔧 Configurando usuarios de test...')

  // ── Crear / recuperar usuario cliente ───────────────────────
  const { data: clientData, error: clientError } = await supabase.auth.admin.createUser({
    email: TEST_CLIENT_EMAIL,
    password: TEST_CLIENT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Test Cliente E2E', role: 'client' },
  })

  if (clientError && clientError.message !== 'User already registered') {
    throw new Error(`Error creando usuario cliente: ${clientError.message}`)
  }

  // Si ya existía, buscarlo
  let clientId = clientData?.user?.id
  if (!clientId) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    clientId = existing?.users?.find((u) => u.email === TEST_CLIENT_EMAIL)?.id
  }

  if (!clientId) throw new Error('No se pudo obtener el ID del usuario cliente')

  // Upsert en profiles con rol client
  const { error: clientProfileError } = await supabase.from('profiles').upsert(
    {
      id: clientId,
      full_name: 'Test Cliente E2E',
      role: 'client',
      email: TEST_CLIENT_EMAIL,
    },
    { onConflict: 'id' }
  )
  if (clientProfileError) {
    console.warn('⚠️  No se pudo upsert profile cliente:', clientProfileError.message)
  }

  console.log('✅ Usuario cliente listo:', TEST_CLIENT_EMAIL)

  // ── Crear / recuperar usuario abogado ───────────────────────
  const { data: lawyerData, error: lawyerError } = await supabase.auth.admin.createUser({
    email: TEST_LAWYER_EMAIL,
    password: TEST_LAWYER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Test Abogado E2E', role: 'lawyer' },
  })

  if (lawyerError && lawyerError.message !== 'User already registered') {
    throw new Error(`Error creando usuario abogado: ${lawyerError.message}`)
  }

  let lawyerId = lawyerData?.user?.id
  if (!lawyerId) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    lawyerId = existing?.users?.find((u) => u.email === TEST_LAWYER_EMAIL)?.id
  }

  if (!lawyerId) throw new Error('No se pudo obtener el ID del usuario abogado')

  // Upsert en profiles con rol lawyer
  const { error: lawyerProfileError } = await supabase.from('profiles').upsert(
    {
      id: lawyerId,
      full_name: 'Test Abogado E2E',
      role: 'lawyer',
      email: TEST_LAWYER_EMAIL,
    },
    { onConflict: 'id' }
  )
  if (lawyerProfileError) {
    console.warn('⚠️  No se pudo upsert profile abogado:', lawyerProfileError.message)
  }

  // Upsert en lawyer_profiles
  const { error: lawyerProfError } = await supabase.from('lawyer_profiles').upsert(
    {
      user_id: lawyerId,
      slug: 'test-abogado-e2e',
      specialties: ['civil'],
      verification_status: 'verified',
    },
    { onConflict: 'user_id' }
  )
  if (lawyerProfError) {
    console.warn('⚠️  No se pudo upsert lawyer_profile:', lawyerProfError.message)
  }

  console.log('✅ Usuario abogado listo:', TEST_LAWYER_EMAIL)
  console.log('🚀 Setup completo — arrancando tests\n')
}

export default globalSetup
