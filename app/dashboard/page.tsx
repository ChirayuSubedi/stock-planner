import { createServiceClient } from '@/lib/supabase-server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Product } from '@/types/product'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Supabase/PostgREST liefert numeric(10,2)-Spalten als Strings (z. B. "63.33").
 * Ohne Konvertierung schlagen alle Berechnungen in stockMetrics.ts fehl.
 */
function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    ...raw,
    stock_shop:           Number(raw.stock_shop ?? 0),
    stock_amazon:         Number(raw.stock_amazon ?? 0),
    stock_transit:        Number(raw.stock_transit ?? 0),
    stock_production:     Number(raw.stock_production ?? 0),
    lead_time_produktion: Number(raw.lead_time_produktion ?? 0),
    lead_time_qi:         Number(raw.lead_time_qi ?? 0),
    lead_time_verladung:  Number(raw.lead_time_verladung ?? 0),
    lead_time_import:     Number(raw.lead_time_import ?? 0),
    lead_time_verzollung: Number(raw.lead_time_verzollung ?? 0),
    lead_time_restocking: Number(raw.lead_time_restocking ?? 0),
    daily_usage_shop:     Number(raw.daily_usage_shop ?? 0),
    daily_usage_amazon:   Number(raw.daily_usage_amazon ?? 0),
    safety_stock:         Number(raw.safety_stock ?? 0),
  } as Product
}

export default async function DashboardSeite() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-5 shadow">
          <h2 className="font-semibold text-red-800">Datenbankfehler</h2>
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
          <p className="mt-3 text-xs text-red-400">
            Bitte überprüfe deine Supabase-Verbindung in der .env.local.
          </p>
        </div>
      </div>
    )
  }

  const produkte = (data ?? []).map(normalizeProduct)

  return <DashboardClient initialProdukte={produkte} />
}
