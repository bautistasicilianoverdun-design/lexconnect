/**
 * Tests de control de acceso — contexto ABOGADO
 * Corre con storageState del abogado (proyecto "lawyer")
 */
import { test, expect } from '@playwright/test'

const LAWYER_SIDEBAR_ITEMS = [
  'Casos disponibles',
  'Mis propuestas',
  'Mensajes',
  'Estadisticas',
  'Suscripcion',
  'Verificacion',
  'Mi perfil',
]

const CLIENT_ONLY_ROUTES = ['/dashboard/mis-casos', '/dashboard/favoritos']

test.describe('[ABOGADO] Sidebar y navegación', () => {
  test('muestra los items correctos en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')
    for (const item of LAWYER_SIDEBAR_ITEMS) {
      await expect(sidebar.getByText(item, { exact: true })).toBeVisible({ timeout: 8000 })
    }
  })

  test('NO muestra items exclusivos de cliente en el sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')
    await expect(sidebar.getByText('Mis casos', { exact: true })).not.toBeVisible()
    await expect(sidebar.getByText('Favoritos', { exact: true })).not.toBeVisible()
  })

  test('el dashboard home muestra contenido de abogado', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Propuestas enviadas')).toBeVisible()
    await expect(page.getByText('Casos activos')).not.toBeVisible()
    await expect(page.getByText('Publicar nuevo caso')).not.toBeVisible()
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

test.describe('[ABOGADO] Página casos-disponibles', () => {
  test('carga correctamente y muestra el buscador de casos', async ({ page }) => {
    await page.goto('/dashboard/casos-disponibles')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/casos-disponibles')
    await expect(page.getByPlaceholder(/buscar|filtrar/i)).toBeVisible({ timeout: 8000 })
  })
})
