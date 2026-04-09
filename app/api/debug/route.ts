import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error, count } = await supabase
    .from('products')
    .select('id, name, sku', { count: 'exact' })
    .order('name')

  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
    error: error?.message ?? null,
    count,
    products: data,
  })
}
