import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET'
  const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const appPasswordSet = !!process.env.APP_PASSWORD

  let count: number | null = null
  let dbError: string | null = null

  try {
    const supabase = createServiceClient()
    const { count: c, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    count = c
    dbError = error?.message ?? null
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'unknown error'
  }

  return NextResponse.json({
    supabase_url: url,
    service_role_key_set: keySet,
    app_password_set: appPasswordSet,
    product_count: count,
    db_error: dbError,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
