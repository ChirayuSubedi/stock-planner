import { Suspense } from 'react'
import LoginClient from '@/components/auth/LoginClient'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function AnmeldungSeite() {
  const supabase = createServiceClient()
  
  // Fetch actual product count from database
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  return (
    <Suspense fallback={null}>
      <LoginClient produktAnzahl={count ?? 0} />
    </Suspense>
  )
}
