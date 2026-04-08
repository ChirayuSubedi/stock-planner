import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { password } = body
  const appPassword  = process.env.APP_PASSWORD

  if (!appPassword) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (!password || password !== appPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('stock_session', appPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}
