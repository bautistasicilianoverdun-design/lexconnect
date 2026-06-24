@AGENTS.md

# LexConnect AR — Guía del proyecto para Claude

## ¿Qué es este proyecto?

**LexConnect AR** es un marketplace legal argentino donde clientes publican casos legales y abogados verificados envían propuestas. Incluye mensajería en tiempo real, sistema de valoraciones, perfiles públicos de abogados y estudios jurídicos, y (próximamente) suscripciones de pago para abogados.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Deploy | Vercel |
| Formularios | React Hook Form + Zod |
| Animaciones | Framer Motion |
| Íconos | Lucide React |
| Fechas | date-fns |
| IA | OpenAI SDK (clasificación de casos) |
| Dev server | Puerto 3001 (`npm run dev`) |

---

## Tipos de usuario

| Rol | Descripción |
|-----|-------------|
| `client` | Publica casos, busca abogados, envía mensajes |
| `lawyer` | Envía propuestas a casos, tiene perfil público, paga suscripción |
| `firm_admin` | Administra un estudio jurídico |
| `admin` | Administración de la plataforma |

El rol se define en el registro y se guarda en `profiles.role`. Los abogados tienen además una fila en `lawyer_profiles`.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/              # Login y registro (layout sin header)
│   │   ├── iniciar-sesion/
│   │   └── registro/
│   ├── api/                 # API routes
│   │   └── cases/route.ts
│   ├── auth/callback/       # OAuth callback de Supabase
│   ├── abogados/            # Listado y perfil público de abogados
│   ├── casos/               # Listado, detalle y nuevo caso
│   ├── estudios/            # Listado y perfil de estudios jurídicos
│   ├── dashboard/           # Panel privado (requiere auth)
│   │   ├── layout.tsx       # Shell del dashboard con sidebar
│   │   ├── page.tsx         # Página principal del dashboard
│   │   ├── casos-disponibles/
│   │   ├── configuracion/
│   │   ├── estadisticas/
│   │   ├── favoritos/
│   │   ├── mensajes/        # Chat en tiempo real (Supabase Realtime)
│   │   ├── mis-casos/
│   │   ├── mis-propuestas/
│   │   └── perfil/
│   ├── asistente/           # Asistente IA para consultas legales
│   ├── como-funciona/
│   └── precios/
├── components/
│   ├── ui/                  # Componentes base reutilizables (Button, Card, Input, etc.)
│   ├── dashboard/           # Componentes del panel privado
│   ├── landing/             # Componentes de la landing
│   └── layout/              # Header y Footer globales
├── lib/
│   ├── supabase/
│   │   ├── server.ts        # Cliente Supabase para Server Components
│   │   └── client.ts        # Cliente Supabase para Client Components
│   ├── ai/
│   │   └── classify-case.ts # Clasificación automática de casos con OpenAI
│   └── utils.ts             # cn() y utilidades
└── types/
    └── index.ts             # Todos los tipos TypeScript del dominio
```

---

## Convenciones de código

### Server vs Client components
- **Server Components** (default): para páginas que leen datos de Supabase. Usar `createClient()` de `@/lib/supabase/server`.
- **Client Components** (`'use client'`): solo cuando se necesita estado, efectos o interactividad. Usar `createClient()` de `@/lib/supabase/client`.
- Las mutaciones van en archivos `actions.ts` como Server Actions (`'use server'`).

### Patrón de autenticación
```typescript
// En Server Components:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/iniciar-sesion')
```

### Consultas a Supabase
- Siempre tipear los resultados usando los tipos de `@/types`
- Usar `.select()` con joins explícitos cuando se necesitan relaciones
- RLS está activo en todas las tablas principales — las queries respetan el usuario autenticado automáticamente

### Componentes UI
- Están en `src/components/ui/` (Button, Card, Input, Badge, Avatar, StarRating)
- Usar `cn()` de `@/lib/utils` para combinar clases de Tailwind
- Estilo general: bordes `border-slate-200`, fondos `bg-white`, texto principal `text-slate-900`
- Border radius generoso: `rounded-2xl` para cards, `rounded-xl` para elementos medianos

### Formularios
- React Hook Form + Zod para validación
- Server Actions para submit (no fetch manual)

---

## Base de datos — Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Extiende `auth.users`. Un perfil por usuario. |
| `lawyer_profiles` | Datos profesionales del abogado (1:1 con profiles) |
| `legal_cases` | Casos publicados por clientes |
| `case_proposals` | Propuestas de abogados a casos |
| `conversations` | Conversaciones entre cliente y abogado |
| `messages` | Mensajes dentro de una conversación |
| `reviews` | Valoraciones de clientes a abogados |
| `client_favorites` | Abogados guardados como favoritos |
| `notifications` | Notificaciones del sistema |
| `law_firms` | Estudios jurídicos |
| `legal_categories` | Categorías de derecho (laboral, civil, penal, etc.) |
| `provinces` | Provincias argentinas |
| `subscriptions` | Suscripciones de abogados (Stripe / MercadoPago) |

---

## ENUMs importantes

```typescript
UserRole: 'client' | 'lawyer' | 'firm_admin' | 'admin'
CaseStatus: 'open' | 'in_progress' | 'closed' | 'archived'
UrgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
VerificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended'
PlanType: 'free' | 'professional' | 'premium' | 'firm'
MessageType: 'text' | 'file' | 'system'
```

---

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY  (para clasificación de casos)
```

---

## Estado actual del proyecto

### ✅ Implementado
- Autenticación completa (registro con rol, login, OAuth callback)
- Perfil público de abogados con slug
- Listado y búsqueda de abogados
- Publicación y detalle de casos legales
- Sistema de propuestas de abogados
- Chat en tiempo real (Supabase Realtime con optimistic updates)
- Dashboard: estadísticas, mis casos, casos disponibles, favoritos, perfil, configuración
- Asistente IA para consultas legales
- Clasificación automática de casos con OpenAI
- Componente FavoriteButton
- Estudios jurídicos (listado y detalle)
- Página de precios y cómo funciona
- Deploy en Vercel

### 🚧 Pendiente / En construcción
- Integración de pagos (Stripe y/o MercadoPago) para suscripciones de abogados
- Página de mis-propuestas (dashboard del abogado)
- Sistema de notificaciones en tiempo real
- Videollamadas integradas
- Blog / artículos de abogados
- Panel de administración
- Verificación de matrícula de abogados
- Upload de documentos a casos

---

## Reglas importantes

1. **No hardcodear credenciales** — siempre usar variables de entorno
2. **No saltear RLS** — las queries de Supabase respetan automáticamente al usuario autenticado
3. **Siempre manejar errores** de Supabase — verificar `error` antes de usar `data`
4. **Tipado estricto** — usar los tipos de `src/types/index.ts`, no `any`
5. **Formato de fechas en español argentino**: `toLocaleDateString('es-AR', ...)`
6. **Moneda**: pesos argentinos (ARS)
