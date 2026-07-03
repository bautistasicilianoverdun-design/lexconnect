/**
 * Tests de flujos del cliente — LexConnect AR
 * Corre con storageState del cliente (proyecto "client")
 */
import { test, expect } from '@playwright/test'

test.describe('[CLIENTE] Perfil público de abogado', () => {
  test('puede ver el listado de abogados', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/abogados')
    // La página tiene al menos el heading
    await expect(page.getByRole('heading', { name: /abogados/i })).toBeVisible({ timeout: 8000 })
  })

  test('el botón "Enviar mensaje" inicia una conversación', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    // Click al primer perfil de abogado disponible
    const firstLawyerLink = page.locator('a[href^="/abogados/"]').first()
    await expect(firstLawyerLink).toBeVisible({ timeout: 8000 })
    await firstLawyerLink.click()
    await page.waitForLoadState('networkidle')

    // El perfil tiene el botón de mensaje
    const msgBtn = page.getByRole('button', { name: /enviar mensaje/i })
    await expect(msgBtn).toBeVisible({ timeout: 8000 })
    await msgBtn.click()

    // Debe redirigir a mensajes
    await page.waitForURL(/\/dashboard\/mensajes/, { timeout: 12000 })
    expect(page.url()).toContain('/dashboard/mensajes')
  })
})

test.describe('[CLIENTE] Publicar caso', () => {
  test('puede acceder al formulario de nuevo caso', async ({ page }) => {
    await page.goto('/casos/nuevo')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/casos/nuevo')
    await expect(page.getByRole('heading', { name: /publicar|nuevo caso/i })).toBeVisible({ timeout: 8000 })
  })

  test('el formulario tiene todos los campos requeridos', async ({ page }) => {
    await page.goto('/casos/nuevo')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('input[name="title"], input[placeholder*="título" i]').first()).toBeVisible({ timeout: 8000 })
    await expect(page.locator('textarea').first()).toBeVisible()
  })

  test('el parámetro ?abogado= muestra el banner de abogado preseleccionado', async ({ page }) => {
    // Ir a /abogados primero para obtener un slug real
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    const firstLink = page.locator('a[href^="/abogados/"]').first()
    const href = await firstLink.getAttribute('href')
    if (!href) return

    const slug = href.replace('/abogados/', '')
    await page.goto(`/casos/nuevo?abogado=${slug}`)
    await page.waitForLoadState('networkidle')

    // Debe aparecer el banner "Caso dirigido a"
    await expect(page.getByText(/caso dirigido a/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('[CLIENTE] Mensajes', () => {
  test('puede acceder a la bandeja de mensajes', async ({ page }) => {
    await page.goto('/dashboard/mensajes')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/mensajes')
  })
})

test.describe('[CLIENTE] Favoritos', () => {
  test('puede ver la página de favoritos', async ({ page }) => {
    await page.goto('/dashboard/favoritos')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/favoritos')
  })
})

test.describe('[CLIENTE] Configuración', () => {
  test('puede acceder a configuración', async ({ page }) => {
    await page.goto('/dashboard/configuracion')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/configuracion')
  })
})
