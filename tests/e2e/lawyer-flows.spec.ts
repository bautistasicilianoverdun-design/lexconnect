/**
 * Tests de flujos del abogado — LexConnect AR
 * Corre con storageState del abogado (proyecto "lawyer")
 */
import { test, expect } from '@playwright/test'

test.describe('[ABOGADO] Casos disponibles', () => {
  test('puede ver y filtrar casos disponibles', async ({ page }) => {
    await page.goto('/dashboard/casos-disponibles')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/casos-disponibles')

    // Tiene campo de búsqueda
    const searchInput = page.getByPlaceholder(/buscar|filtrar/i).first()
    await expect(searchInput).toBeVisible({ timeout: 8000 })
  })

  test('puede buscar casos por texto', async ({ page }) => {
    await page.goto('/dashboard/casos-disponibles')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/buscar|filtrar/i).first()
    await searchInput.fill('laboral')
    // Esperar que la lista reaccione (debounce)
    await page.waitForTimeout(600)
    // No debe crashear
    expect(page.url()).toContain('/dashboard/casos-disponibles')
  })
})

test.describe('[ABOGADO] Mis propuestas', () => {
  test('puede acceder a mis propuestas', async ({ page }) => {
    await page.goto('/dashboard/mis-propuestas')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/mis-propuestas')
    await expect(page.getByRole('heading', { name: /propuestas/i })).toBeVisible({ timeout: 8000 })
  })
})

test.describe('[ABOGADO] Perfil público propio', () => {
  test('puede ir al perfil público desde el dashboard', async ({ page }) => {
    await page.goto('/dashboard/perfil')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/perfil')
  })

  test('el perfil público de abogado carga correctamente', async ({ page }) => {
    // Obtener el slug del abogado logueado desde la página de perfil
    await page.goto('/abogados')
    await page.waitForLoadState('networkidle')

    const firstLink = page.locator('a[href^="/abogados/"]').first()
    await expect(firstLink).toBeVisible({ timeout: 8000 })
    await firstLink.click()
    await page.waitForLoadState('networkidle')

    // El perfil debe mostrar los datos principales
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })
})

test.describe('[ABOGADO] Estadísticas', () => {
  test('puede acceder a estadísticas', async ({ page }) => {
    await page.goto('/dashboard/estadisticas')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/estadisticas')
  })
})

test.describe('[ABOGADO] Verificación de matrícula', () => {
  test('puede acceder a verificación', async ({ page }) => {
    await page.goto('/dashboard/verificacion')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/verificacion')
  })
})

test.describe('[ABOGADO] Suscripción', () => {
  test('puede acceder a suscripción', async ({ page }) => {
    await page.goto('/dashboard/suscripcion')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/suscripcion')
  })
})

test.describe('[ABOGADO] Mensajes', () => {
  test('puede acceder a la bandeja de mensajes', async ({ page }) => {
    await page.goto('/dashboard/mensajes')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/dashboard/mensajes')
  })
})

test.describe('[ABOGADO] Link de videollamada en chat', () => {
  test('el botón de video aparece en la pantalla de mensajes', async ({ page }) => {
    await page.goto('/dashboard/mensajes')
    await page.waitForLoadState('networkidle')

    // Si hay conversaciones, verificar que existe el botón de video
    // (puede estar en gris si no hay link configurado, pero debe existir)
    const hasConversations = (await page.locator('[data-conv], .conversation-item, [href*="conv="]').count()) > 0
    if (hasConversations) {
      const firstConv = page.locator('[data-conv], .conversation-item').first()
      await firstConv.click()
      await page.waitForTimeout(500)
      // El botón de video debe existir en el header del chat
      const videoBtn = page.getByRole('button', { name: /video|videollamada/i })
      await expect(videoBtn).toBeVisible({ timeout: 5000 })
    }
  })
})
