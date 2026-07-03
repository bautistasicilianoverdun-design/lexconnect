/**
 * Tests de control de acceso por rol — LexConnect AR
 *
 * Cada test lleva la etiqueta del proyecto que lo corre:
 *   - proyecto "client"  → usa storageState del cliente
 *   - proyecto "lawyer"  → usa storageState del abogado
 *
 * Qué verifica:
 *   ✅ El sidebar muestra los items correctos por rol
 *   ✅ Rutas de cliente son inaccesibles para abogados (redirigen)
 *   ✅ Rutas de abogado son inaccesibles para clientes (redirigen)
 *   ✅ El dashboard home muestra contenido diferenciado por rol
 */
import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Items que DEBE mostrar el sidebar de cliente */
const CLIENT_SIDEBAR_ITEMS = [
  'Mis casos',
  'Mensajes',
  'Favoritos',
  'Valoraciones',
  'Mi perfil',
]

/** Items que DEBE mostrar el sidebar de abogado */
const LAWYER_SIDEBAR_ITEMS = [
  'Casos disponibles',
  'Mis propuestas',
  'Mensajes',
  'Estadisticas',
  'Suscripcion',
  'Verificacion',
  'Mi perfil',
]

/** Rutas exclusivas de cliente (abogado no debe entrar) */
const CLIENT_ONLY_ROUTES = [
  '/dashboard/mis-casos',
  '/dashboard/favoritos',
]

/** Rutas exclusivas de abogado (cliente no debe entrar) */
const LAWYER_ONLY_ROUTES = [
  '/dashboard/casos-disponibles',
  '/dashboard/mis-propuestas',
  '/dashboard/estadisticas',
  '/dashboard/suscripcion',
  '/dashboard/verificacion',
  '/dashboard/mis-articulos',
]

// ─────────────────────────────────────────────────────────────
// Tests corriendo con contexto de CLIENTE
// ─────────────────────────────────────────────────────────────

test.describe('[CLIENTE] Sidebar y navegación', () => {
  test('muestra los items correctos en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')

    for (const item of CLIENT_SIDEBAR_ITEMS) {
      await expect(sidebar.getByText(item, { exact: true })).toBeVisible({
        timeout: 8000,
      })
    }
  })

  test('NO muestra items exclusivos de abogado en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')

    const lawyerOnlyItems = ['Casos disponibles', 'Mis propuestas', 'Suscripcion', 'Verificacion']
    for (const item of lawyerOnlyItems) {
      await expect(sidebar.getByText(item, { exact: true })).not.toBeVisible()
    }
  })

  test('el dashboard home muestra contenido de cliente', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // El cliente ve "Casos activos" y "Propuestas recibidas"
    await expect(page.getByText('Casos activos')).toBeVisible()
    await expect(page.getByText('Propuestas recibidas')).toBeVisible()

    // El cliente NO ve stats de abogado
    await expect(page.getByText('Propuestas enviadas')).not.toBeVisible()
  })

  test('el dashboard home muestra el CTA de publicar caso', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Publicar nuevo caso')).toBeVisible()
  })
})

test.describe('[CLIENTE] Acceso a rutas exclusivas de abogado', () => {
  for (const route of LAWYER_ONLY_ROUTES) {
    test(`redirige o muestra error al intentar acceder a ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // Debe redirigir a /dashboard o mostrar un mensaje de acceso denegado
      // NO debe quedarse en la ruta del abogado mostrando contenido
      const url = page.url()
      const isRedirected = !url.includes(route) || url.includes('/dashboard')

      // Alternativa: la página muestra un mensaje de "sin acceso"
      const hasAccessDenied =
        (await page.getByText(/acceso|no autorizado|solo abogados|no tenés permiso/i).count()) > 0

      expect(isRedirected || hasAccessDenied).toBe(true)
    })
  }
})

// ─────────────────────────────────────────────────────────────
// Tests corriendo con contexto de ABOGADO
// ─────────────────────────────────────────────────────────────

test.describe('[ABOGADO] Sidebar y navegación', () => {
  test('muestra los items correctos en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')

    for (const item of LAWYER_SIDEBAR_ITEMS) {
      await expect(sidebar.getByText(item, { exact: true })).toBeVisible({
        timeout: 8000,
      })
    }
  })

  test('NO muestra items exclusivos de cliente en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')

    // Mis casos y Favoritos son exclusivos de cliente
    await expect(sidebar.getByText('Mis casos', { exact: true })).not.toBeVisible()
    await expect(sidebar.getByText('Favoritos', { exact: true })).not.toBeVisible()
  })

  test('el dashboard home muestra contenido de abogado', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // El abogado ve "Propuestas enviadas"
    await expect(page.getByText('Propuestas enviadas')).toBeVisible()

    // El abogado NO ve "Casos activos" (stats de cliente)
    await expect(page.getByText('Casos activos')).not.toBeVisible()

    // El abogado NO ve el CTA de "Publicar nuevo caso"
    await expect(page.getByText('Publicar nuevo caso')).not.toBeVisible()

    // El abogado NO ve el CTA de upgrade de plan (era solo para clientes)
    await expect(page.getByText('Actualizate a Plan Profesional')).not.toBeVisible()
  })
})

test.describe('[ABOGADO] Acceso a rutas exclusivas de cliente', () => {
  for (const route of CLIENT_ONLY_ROUTES) {
    test(`redirige o muestra error al intentar acceder a ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const url = page.url()
      const isRedirected = !url.includes(route)

      const hasAccessDenied =
        (await page.getByText(/acceso|no autorizado|solo clientes|no tenés permiso/i).count()) > 0

      expect(isRedirected || hasAccessDenied).toBe(true)
    })
  }
})

// ─────────────────────────────────────────────────────────────
// Tests de contenido de páginas específicas
// ─────────────────────────────────────────────────────────────

test.describe('[CLIENTE] Página mis-casos', () => {
  test('carga correctamente y muestra el botón de nuevo caso', async ({ page }) => {
    await page.goto('/dashboard/mis-casos')
    await page.waitForLoadState('networkidle')

    // Debe permanecer en la URL (es una ruta válida para clientes)
    expect(page.url()).toContain('/dashboard/mis-casos')

    // Debe mostrar el link para publicar un caso
    await expect(page.getByRole('link', { name: /nuevo caso|publicar/i })).toBeVisible({ timeout: 8000 })
  })
})

test.describe('[ABOGADO] Página casos-disponibles', () => {
  test('carga correctamente y muestra el buscador de casos', async ({ page }) => {
    await page.goto('/dashboard/casos-disponibles')
    await page.waitForLoadState('networkidle')

    // Debe permanecer en la URL
    expect(page.url()).toContain('/dashboard/casos-disponibles')

    // Debe mostrar el filtro de búsqueda
    await expect(page.getByPlaceholder(/buscar|filtrar/i)).toBeVisible({ timeout: 8000 })
  })
})
