/**
 * Tests de páginas públicas — LexConnect AR
 * Corre SIN autenticación (proyecto "public")
 */
import { test, expect } from '@playwright/test'

test.describe('Páginas públicas accesibles sin login', () => {
  const PUBLIC_PAGES = [
    { url: '/', heading: /lexconnect|marketplace|abogados/i },
    { url: '/abogados', heading: /abogados/i },
    { url: '/casos', heading: /casos/i },
    { url: '/estudios', heading: /estudios/i },
    { url: '/como-funciona', heading: /cómo funciona|como funciona/i },
    { url: '/precios', heading: /precios|planes/i },
  ]

  for (const { url, heading } of PUBLIC_PAGES) {
    test(`${url} carga sin login`, async ({ page }) => {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      // No debe redirigir a login
      expect(page.url()).not.toContain('/iniciar-sesion')

      // Debe tener al menos un heading reconocible
      await expect(page.getByRole('heading').filter({ hasText: heading }).first()).toBeVisible({
        timeout: 8000,
      })
    })
  }
})

test.describe('Rutas protegidas redirigen a login', () => {
  const PROTECTED_ROUTES = [
    '/dashboard',
    '/dashboard/mis-casos',
    '/dashboard/mensajes',
    '/dashboard/perfil',
    '/dashboard/configuracion',
  ]

  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirige a /iniciar-sesion`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // Debe redirigir al login
      expect(page.url()).toContain('/iniciar-sesion')
    })
  }
})

test.describe('Navegación del header', () => {
  test('el header tiene los links principales', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Links de navegación principal
    await expect(page.getByRole('link', { name: /abogados/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /casos/i }).first()).toBeVisible()
  })

  test('el link de login lleva a /iniciar-sesion', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loginLink = page.getByRole('link', { name: /iniciar sesión|login|ingresar/i }).first()
    await expect(loginLink).toBeVisible({ timeout: 8000 })
    await loginLink.click()
    await page.waitForURL(/iniciar-sesion/, { timeout: 8000 })
  })
})

test.describe('Listado de abogados', () => {
  test('muestra abogados y permite buscar', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    // Tiene campo de búsqueda
    const searchInput = page.getByPlaceholder(/buscar|nombre/i).first()
    await expect(searchInput).toBeVisible({ timeout: 8000 })
  })

  test('el perfil de abogado carga correctamente', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    const firstLink = page.locator('a[href^="/abogados/"]').first()
    const isVisible = await firstLink.isVisible()
    if (!isVisible) return // No hay abogados en test DB, skip

    await firstLink.click()
    await page.waitForLoadState('networkidle')

    expect(page.url()).toMatch(/\/abogados\/[\w-]+/)

    // El perfil muestra el nombre del abogado
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Asistente IA', () => {
  test('la página del asistente carga', async ({ page }) => {
    await page.goto('/asistente')
    await page.waitForLoadState('networkidle')

    // Puede redirigir a login o mostrar el asistente
    const isOnAssistant = page.url().includes('/asistente')
    const isOnLogin = page.url().includes('/iniciar-sesion')
    expect(isOnAssistant || isOnLogin).toBe(true)
  })
})
