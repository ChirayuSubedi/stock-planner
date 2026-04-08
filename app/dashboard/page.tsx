import { createServiceClient } from '@/lib/supabase-server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Product } from '@/types/product'

export const dynamic = 'force-dynamic'

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

  return <DashboardClient initialProdukte={(data ?? []) as Product[]} />
}
