import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/auth', '/auth/callback', '/auth/auth-code-error']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip auth check for public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Skip auth check for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // static files
    ) {
        return NextResponse.next()
    }

    // Check for guest mode cookie (set by client)
    const guestMode = request.cookies.get('rewards_guest_mode')?.value === 'true'
    if (guestMode) {
        return NextResponse.next()
    }

    // Create a response to modify
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    console.log('Middleware: Path:', pathname, 'Session:', session?.user?.email ? 'Authenticated' : 'No Session')

    if (!session) {
        // Redirect to login page
        console.log('Middleware: Unauthenticated access, redirecting to /auth')
        const redirectUrl = new URL('/auth', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
