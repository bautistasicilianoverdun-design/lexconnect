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
- Dashboard inicio diferenciado por rol (abogado vs cliente)
- Asistente IA para consultas legales
- Clasificación automática de casos con OpenAI
- Componente FavoriteButton
- Estudios jurídicos (listado y detalle)
- Página de precios y cómo funciona
- Deploy en Vercel
- Notificaciones en tiempo real (Supabase Realtime — tabla `notifications` en publicación `supabase_realtime`)
- Página mis-propuestas (dashboard del abogado — ve sus propuestas enviadas con estado)
- Panel de administración (`/dashboard/admin`) con 4 secciones: estadísticas, usuarios, casos, suscripciones
- Verificación de matrícula (`/dashboard/verificacion`): ~45 colegios de abogados argentinos, CPACF automático, resto manual
- Upload de documentos a casos (`case_documents` table + Storage bucket `case-documents`)
  - Componente `CaseDocumentsSection` integrado en mis-casos y detalle de caso
- Sistema de valoraciones mutuas (`/dashboard/valoraciones`):
  - Cliente valora abogado, abogado valora cliente
  - Se revelan cuando ambos valoran, o automáticamente a los 7 días
  - Bloqueo permanente tras revelación
  - SQL: `supabase-reviews-migration.sql` (columnas + RPC functions)
  - Funciones PostgreSQL: `reveal_mutual_reviews(p_case_id)` y `lock_expired_reviews()`
- Integración MercadoPago para suscripciones de abogados (`/api/mercadopago/`, `/dashboard/suscripcion`)
- Blog / artículos de abogados (implementado)
- Link de videollamada del abogado (Zoom/Meet/Calendly):
  - Abogado configura su link en `/dashboard/perfil` → campo "Videollamada"
  - Botón Video en el chat abre el link en nueva pestaña (azul si hay link, gris si no)
  - SQL pendiente: `ALTER TABLE lawyer_profiles ADD COLUMN IF NOT EXISTS videocall_link TEXT;`

### 🚧 Pendiente / En construcción
- Cargar credenciales reales de MercadoPago en Vercel env vars
- Configurar webhook MP: `https://lexconnect-two.vercel.app/api/mercadopago/webhook`
- Cambiar rol a `admin` en Supabase para probar panel admin
- Perfil público del abogado mejorado (valoraciones públicas, estadísticas)
- Videollamadas nativas integradas (WebRTC / Daily.co) — fase 2
- Panel de administración: gestión de casos y suscripciones (completar)
- Verificación de matrícula: revisor manual en panel admin

---

## Columnas agregadas a tablas existentes (migraciones aplicadas)

| Tabla | Columna | Tipo | Notas |
|-------|---------|------|-------|
| `lawyer_profiles` | `bar_association` | TEXT | Colegio de abogados |
| `lawyer_profiles` | `matricula_tomo` | TEXT | |
| `lawyer_profiles` | `matricula_folio` | TEXT | |
| `lawyer_profiles` | `verification_status` | TEXT | pending/verified/rejected/suspended |
| `lawyer_profiles` | `verification_submitted_at` | TIMESTAMPTZ | |
| `lawyer_profiles` | `verification_notes` | TEXT | |
| `lawyer_profiles` | `videocall_link` | TEXT | SQL pendiente: `ALTER TABLE lawyer_profiles ADD COLUMN IF NOT EXISTS videocall_link TEXT;` |
| `reviews` | `reviewer_role` | TEXT | 'client' \| 'lawyer' |
| `reviews` | `reviewee_id` | UUID | FK auth.users |
| `reviews` | `is_revealed` | BOOLEAN | default false |
| `reviews` | `revealed_at` | TIMESTAMPTZ | |
| `reviews` | `reveal_deadline` | TIMESTAMPTZ | 7 días tras cierre |
| `reviews` | `is_locked` | BOOLEAN | default false |
| `subscriptions` | múltiples | — | Ver `supabase-subscriptions-migration.sql` |

---

## Archivos SQL de migración (aplicar en Supabase SQL Editor)

- `supabase-reviews-migration.sql` — columnas reviews + RPC functions + RLS
- `supabase-subscriptions-migration.sql` — tabla subscriptions + columnas MP en lawyer_profiles
- `supabase-case-documents-migration.sql` — tabla case_documents (si existe)
- SQL inline: `ALTER TABLE lawyer_profiles ADD COLUMN IF NOT EXISTS videocall_link TEXT;` — **PENDIENTE**

---

## Reglas de desarrollo CRÍTICAS

> **NUNCA usar Edit tool en archivos .tsx/.ts grandes** — trunca el archivo en Windows mount.
> Siempre usar bash heredoc o Python read-full-file → modify in memory → write-full-file.

```bash
# Patrón seguro para modificar TSX:
python3 - << 'PYEOF'
with open('/path/to/file.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(OLD, NEW)
with open('/path/to/file.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
PYEOF
```

- **git**: rama `master` (no `main`). Usar `git add -A` (Windows interpreta `[id]` como glob).
- **git index.lock**: si aparece, el usuario lo elimina desde Windows terminal.
- **Supabase joins**: devuelven arrays → siempre `Array.isArray(data) ? data[0] : data`.
- **Supabase Realtime**: las tablas deben estar explícitamente en la publicación `supabase_realtime` (Database → Publications → supabase_realtime → toggle).
- **Dev server**: corre en puerto `3001` (`npm run dev`).

---

## Reglas importantes

1. **No hardcodear credenciales** — siempre usar variables de entorno
2. **No saltear RLS** — las queries de Supabase respetan automáticamente al usuario autenticado
3. **Siempre manejar errores** de Supabase — verificar `error` antes de usar `data`
4. **Tipado estricto** — usar los tipos de `src/types/index.ts`, no `any`
5. **Formato de fechas en español argentino**: `toLocaleDateString('es-AR', ...)`
6. **Moneda**: pesos argentinos (ARS)
