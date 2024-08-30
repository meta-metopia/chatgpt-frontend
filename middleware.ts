import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

const auth = NextAuth(authConfig).auth

function middleware(request: Request) {
  // If we reach here, the user is authenticated. Now apply the custom header logic.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  // Return the response with the added header
  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export default auth(middleware)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
