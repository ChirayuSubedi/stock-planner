import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { UpdateProduct } from '@/types/product'

type Params = { params: { id: string } }

// PATCH /api/products/[id] — partial update
export async function PATCH(request: NextRequest, { params }: Params) {
  let body: UpdateProduct
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 422 })
  }

  const supabase = createServiceClient()
  const { data, error, count } = await supabase
    .from('products')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  console.log('[PATCH]', params.id, { data: !!data, error: error?.message, count })

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

// DELETE /api/products/[id]
export async function DELETE(_: NextRequest, { params }: Params) {
  const supabase = createServiceClient()

  // Use .select() to see what was actually deleted
  const { data, error, count } = await supabase
    .from('products')
    .delete()
    .eq('id', params.id)
    .select()

  console.log('[DELETE]', params.id, { deletedRows: data?.length, error: error?.message, count })

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Produkt nicht gefunden oder Löschung blockiert' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}

