import { MercadoPagoConfig, Preference, PreApproval, PreApprovalPlan } from 'mercadopago'

// Cliente singleton
let _client: MercadoPagoConfig | null = null

export function getMPClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MP_ACCESS_TOKEN
    if (!token) throw new Error('MP_ACCESS_TOKEN no configurado')
    _client = new MercadoPagoConfig({ accessToken: token, options: { timeout: 10000 } })
  }
  return _client
}

// Planes de suscripcion
export const MP_PLANS = {
  professional: {
    label: 'Profesional',
    amount: 30000,
    currency: 'ARS',
    description: 'Plan Profesional LexConnect — acceso completo para abogados',
    features: [
      'Propuestas ilimitadas',
      'Perfil verificado destacado',
      'Estadísticas avanzadas',
      'Soporte prioritario',
    ],
  },
  premium: {
    label: 'Premium',
    amount: 45000,
    currency: 'ARS',
    description: 'Plan Premium LexConnect — máxima visibilidad',
    features: [
      'Todo lo del plan Profesional',
      'Posición destacada en búsquedas',
      'Badge Premium en el perfil',
      'Acceso anticipado a nuevas funciones',
    ],
  },
  firm: {
    label: 'Estudio',
    amount: 70000,
    currency: 'ARS',
    description: 'Plan Estudio LexConnect — para estudios jurídicos',
    features: [
      'Hasta 5 abogados del estudio',
      'Perfil de estudio jurídico',
      'Panel de administración del estudio',
      'Facturación unificada',
    ],
  },
} as const

export type PlanKey = keyof typeof MP_PLANS

export { Preference, PreApproval, PreApprovalPlan }
