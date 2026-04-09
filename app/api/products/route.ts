import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { NewProduct } from '@/types/product'

// GET /api/products — alle Produkte alphabetisch sortiert
export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ fehler: error.message }, { status: 500 })
  }

  // Supabase liefert numeric(10,2)-Spalten als Strings — hier normalisieren
  const normalized = (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    daily_usage_shop:   Number(row.daily_usage_shop ?? 0),
    daily_usage_amazon: Number(row.daily_usage_amazon ?? 0),
  }))

  return NextResponse.json(normalized)
}

// POST /api/products — neues Produkt anlegen
export async function POST(request: NextRequest) {
  let body: Partial<NewProduct>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fehler: 'Ungültiger JSON-Body' }, { status: 400 })
  }

  const validierungsFehler = validiereProdukt(body)
  if (validierungsFehler) {
    return NextResponse.json({ fehler: validierungsFehler }, { status: 422 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('products')
    .insert(body as NewProduct)
    .select()
    .single()

  if (error) {
    const status = error.code === '23505' ? 409 : 500 // 23505 = unique_violation (SKU bereits vorhanden)
    return NextResponse.json({ fehler: error.message }, { status })
  }

  return NextResponse.json(data, { status: 201 })
}

// ---------------------------------------------------------------------------
// Eingabe-Validierung
// ---------------------------------------------------------------------------

function validiereProdukt(body: Partial<NewProduct>): string | null {
  if (!body.name?.trim()) return 'Produktname ist erforderlich'
  if (!body.sku?.trim())  return 'SKU ist erforderlich'

  const ganzzahlFelder: (keyof NewProduct)[] = [
    'stock_shop', 'stock_amazon', 'stock_transit', 'stock_production',
    'lead_time_produktion', 'lead_time_qi', 'lead_time_verladung',
    'lead_time_import', 'lead_time_verzollung', 'lead_time_restocking',
    'safety_stock',
  ]

  for (const feld of ganzzahlFelder) {
    const wert = body[feld]
    if (wert === undefined || wert === null) return `${feld} ist erforderlich`
    if (!Number.isInteger(wert) || (wert as number) < 0) {
      return `${feld} muss eine nicht-negative ganze Zahl sein`
    }
  }

  for (const feld of ['daily_usage_shop', 'daily_usage_amazon'] as const) {
    const wert = body[feld]
    if (wert === undefined || wert === null) return `${feld} ist erforderlich`
    if (typeof wert !== 'number' || wert < 0) {
      return `${feld} muss eine nicht-negative Zahl sein`
    }
  }

  return null
}
