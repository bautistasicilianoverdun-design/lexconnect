import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type VerifyResult =
  | { status: 'verified'; found_name: string }
  | { status: 'not_found' }
  | { status: 'pending_manual' }
  | { status: 'error'; message: string }

// --------------------------------------------------------------------------
// CPACF scraper (Capital Federal)
// Directorio público: w3.cpacf.org.ar/guiaabo2/guiaabo3.aspx
// Formulario ASPX: necesita ViewState + EventValidation
// --------------------------------------------------------------------------

async function verifyCPACF(tomo: string, folio: string, lastName: string): Promise<VerifyResult> {
  const BASE_URL = 'https://w3.cpacf.org.ar/guiaabo2/guiaabo3.aspx'

  try {
    // Step 1: GET to obtain ViewState and EventValidation
    const getRes = await fetch(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexConnect/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!getRes.ok) {
      return { status: 'pending_manual' }
    }

    const html = await getRes.text()

    // Extract ASP.NET hidden fields
    const viewState = extractHidden(html, '__VIEWSTATE')
    const eventValidation = extractHidden(html, '__EVENTVALIDATION')
    const viewStateGenerator = extractHidden(html, '__VIEWSTATEGENERATOR')

    if (!viewState) {
      return { status: 'pending_manual' }
    }

    // Step 2: POST the search form
    const body = new URLSearchParams({
      '__VIEWSTATE': viewState,
      '__VIEWSTATEGENERATOR': viewStateGenerator ?? '',
      '__EVENTVALIDATION': eventValidation ?? '',
      // Field names from the CPACF form (inspected from source)
      'ctl00$ContentPlaceHolder1$txtApellido': lastName.toUpperCase(),
      'ctl00$ContentPlaceHolder1$txtNombre': '',
      'ctl00$ContentPlaceHolder1$txtTomo': tomo,
      'ctl00$ContentPlaceHolder1$txtFolio': folio,
      'ctl00$ContentPlaceHolder1$btnBuscar': 'Buscar',
    })

    const postRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexConnect/1.0)',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL,
        'Accept': 'text/html,application/xhtml+xml',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    })

    if (!postRes.ok) {
      return { status: 'pending_manual' }
    }

    const resultHtml = await postRes.text()

    // Parse results: CPACF shows a table with rows containing lawyer data
    const names = parseResultNames(resultHtml)

    if (names.length === 0) {
      return { status: 'not_found' }
    }

    // Check if any result surname matches what we expect
    const normalizedLast = normalize(lastName)
    const match = names.find(n => normalize(n).includes(normalizedLast))

    if (match) {
      return { status: 'verified', found_name: match }
    }

    // Found results but name doesn't match
    return { status: 'not_found' }

  } catch (err) {
    console.error('[CPACF]', err)
    return { status: 'pending_manual' }
  }
}

function extractHidden(html: string, name: string): string | null {
  const re = new RegExp(`id="${name}"[^>]*value="([^"]*)"`, 'i')
  const m = html.match(re)
  if (m) return m[1]
  // Try name= variant
  const re2 = new RegExp(`name="${name}"[^>]*value="([^"]*)"`, 'i')
  const m2 = html.match(re2)
  return m2 ? m2[1] : null
}

function parseResultNames(html: string): string[] {
  // CPACF results are in a GridView table — extract text from <td> cells
  // Pattern: cells contain full name in format "APELLIDO, Nombre"
  const names: string[] = []
  // Match table data cells that look like lawyer names
  const tdRe = /<td[^>]*>\s*([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜa-záéíóúñü\s,\.]+?)\s*<\/td>/g
  let match
  while ((match = tdRe.exec(html)) !== null) {
    const text = match[1].trim()
    // A name cell has at least 5 chars and a comma (APELLIDO, Nombre)
    if (text.length > 5 && text.includes(',')) {
      names.push(text)
    }
  }
  return names
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z\s]/g, '')
    .trim()
}

// --------------------------------------------------------------------------
// POST handler
// --------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify authenticated user is a lawyer
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bar_association, tomo, folio, last_name } = await req.json()

  if (!bar_association || !tomo || !folio || !last_name) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  let result: VerifyResult

  switch (bar_association) {
    case 'cpacf':
      result = await verifyCPACF(tomo, folio, last_name)
      break
    case 'casi':
    case 'cac':
    case 'other':
      // No public directory to query — goes to manual admin review
      result = { status: 'pending_manual' }
      break
    default:
      return NextResponse.json({ error: 'Jurisdiccion no válida' }, { status: 400 })
  }

  // Map result to verification_status enum
  const newStatus =
    result.status === 'verified' ? 'verified'
    : result.status === 'not_found' ? 'rejected'
    : 'pending' // pending_manual or error

  // Update lawyer_profiles
  const { error: updateError } = await supabase
    .from('lawyer_profiles')
    .update({
      bar_association,
      matricula_tomo: tomo,
      matricula_folio: folio,
      verification_status: newStatus,
      verification_submitted_at: new Date().toISOString(),
      verification_notes:
        result.status === 'verified'
          ? `Verificado automáticamente contra directorio ${bar_association.toUpperCase()}. Nombre encontrado: ${result.found_name}`
          : result.status === 'not_found'
          ? `No encontrado en directorio ${bar_association.toUpperCase()} con Tomo ${tomo} Folio ${folio}`
          : `Pendiente de revisión manual — no hay directorio público disponible para ${bar_association.toUpperCase()}`,
    })
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Error al guardar verificación' }, { status: 500 })
  }

  return NextResponse.json({ result })
}
