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
    // APP_PASSWORD not configured — block all access rather than fail open
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
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
