/**
 * Tests de control de acceso — contexto CLIENTE
 * Corre con storageState del cliente (proyecto "client")
 */
import { test, expect } from '@playwright/test'

const CLIENT_SIDEBAR_ITEMS = ['Mis casos', 'Mensajes', 'Favoritos', 'Valoraciones', 'Mi perfil']

const LAWYER_ONLY_ROUTES = [
  '/dashboard/casos-disponibles',
  '/dashboard/mis-propuestas',
  '/dashboard/estadisticas',
  '/dashboard/suscripcion',
  '/dashboard/verificacion',
  '/dashboard/mis-articulos',
]

test.describe('[CLIENTE] Sidebar y navegación', () => {
  test('muestra los items correctos en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')
    for (const item of CLIENT_SIDEBAR_ITEMS) {
      await expect(sidebar.getByText(item, { exact: true })).toBeVisible({ timeout: 8000 })
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

    await expect(page.getByText('Casos activos')).toBeVisible()
    await expect(page.getByText('Propuestas recibidas', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Propuestas enviadas', { exact: true })).not.toBeVisible()
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

      const url = page.url()
      const isRedirected = !url.includes(route) || url.includes('/dashboard')
      const hasAccessDenied =
        (await page.getByText(/acceso|no autorizado|solo abogados|no tenés permiso/i).count()) > 0

      expect(isRedirected || hasAccessDenied).toBe(true)
    })
  }
})

test.describe('[CLIENTE] Página mis-casos', () => {
  test('carga correctamente y muestra el botón de nuevo caso', async ({ page }) => {
    await page.goto('/dashboard/mis-casos')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/mis-casos')
    await expect(page.getByRole('link', { name: /nuevo caso|publicar/i }).first()).toBeVisible({ timeout: 8000 })
  })
})
