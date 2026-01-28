import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  // No server-side protection for admin routes - handled by client-side auth

  // Protect account routes - require Supabase auth EXCEPT for guest order tracking
  if (request.nextUrl.pathname.startsWith("/account")) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow access to /account/orders with email parameter for guest order tracking
    const isOrdersPageWithEmail = 
      request.nextUrl.pathname === "/account/orders" && 
      request.nextUrl.searchParams.has("email")
    
    const isOrderDetailsPage = /^\/account\/orders\/[\w-]+$/.test(request.nextUrl.pathname)

    if (!user && !isOrdersPageWithEmail && !isOrderDetailsPage) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      // Include full path with query parameters for redirect
      url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
