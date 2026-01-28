"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("Processing...")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get the code from URL params
        const code = searchParams.get("code")
        
        if (code) {
          console.log("Processing auth callback with code:", code)
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            setError("Failed to confirm email: " + error.message)
            console.error("Auth error:", error)
            setTimeout(() => {
              router.push("/login")
            }, 2000)
            return
          }

          setStatus("Email confirmed! Redirecting...")
          setTimeout(() => {
            router.push("/account")
          }, 1000)
        } else {
          setError("No code provided")
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Callback error:", err)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error ? "Error" : "Processing..."}
        </h1>
        <p className="text-muted-foreground">
          {error ? error : status}
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processing...</h1>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
