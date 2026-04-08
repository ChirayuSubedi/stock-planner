import { NextRequest, NextResponse } from 'next/server'

/** Paths that never require authentication. */
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Validate session cookie
  const session  = request.cookies.get('stock_session')?.value
  const password = process.env.APP_PASSWORD

  if (!password) {
    // APP_PASSWORD not set — fail open with a console warning (dev only)
    console.warn('[stock-planner] APP_PASSWORD env var is not set. Auth is disabled.')
    return NextResponse.next()
  }

  if (!session || session !== password) {
    const loginUrl = new URL('/login', request.url)
    // Preserve intended destination so we can redirect after login
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
