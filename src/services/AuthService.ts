import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

export class AuthService {
  async signUp(email: string, password: string, fullName: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/` },
    })
  }

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async signOut() {
    return supabase.auth.signOut()
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: any }> {
    return supabase.auth.getSession()
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
