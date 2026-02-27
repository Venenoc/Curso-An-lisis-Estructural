import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si hay error en un flujo de recovery, redirigir con error legible
  if (next.startsWith('/reset-password')) {
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_link`)
  }
  return NextResponse.redirect(`${origin}/login`)
}
