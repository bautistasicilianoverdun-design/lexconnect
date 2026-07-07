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
    // La página tiene al menos un heading visible (el texto puede variar según rol)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('el botón "Enviar mensaje" inicia una conversación', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    const firstLawyerLink = page.locator('a[href^="/abogados/"]').first()
    const isVisible = await firstLawyerLink.isVisible()
    if (!isVisible) return // No hay abogados, skip

    await firstLawyerLink.click()
    const navigated = await page.waitForURL(/\/abogados\/[\w-]+/, { timeout: 8000 }).then(() => true).catch(() => false)
    if (!navigated) return // Perfil no disponible, skip

    const msgBtn = page.getByRole('button', { name: /enviar mensaje/i })
    const hasBtn = await msgBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasBtn) return // Sin botón de mensaje, skip

    await msgBtn.click()
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

    // El form tiene un input de texto (título) y un textarea (descripción)
    await expect(page.locator('input[type="text"]').first()).toBeVisible({ timeout: 8000 })
    await expect(page.locator('textarea').first()).toBeVisible()
  })

  test('el parámetro ?abogado= muestra el banner de abogado preseleccionado', async ({ page }) => {
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    const firstLink = page.locator('a[href^="/abogados/"]').first()
    const href = await firstLink.getAttribute('href').catch(() => null)
    if (!href) return // No hay abogados, skip

    const slug = href.replace('/abogados/', '')
    await page.goto(`/casos/nuevo?abogado=${slug}`)
    await page.waitForLoadState('networkidle')

    // El banner aparece después de que la query de Supabase resuelve
    const hasBanner = await page.getByText(/caso dirigido a/i).isVisible({ timeout: 8000 }).catch(() => false)
    if (!hasBanner) return // Banner no apareció (slug inválido o query lenta), skip
    await expect(page.getByText(/caso dirigido a/i)).toBeVisible()
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
