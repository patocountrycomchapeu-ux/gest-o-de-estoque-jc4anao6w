import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, AuthUser, AuthSession } from '@/services/AuthService'

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await authService.signUp(email, password, fullName)
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signIn(email, password)
    if (!error && data?.user) {
      setSession(data.session)
      setUser(data.user)
      import('@/lib/api').then(({ apiFetch }) => {
        apiFetch('/logs-acesso', {
          method: 'POST',
          body: JSON.stringify({
            usuario_id: data.user.id,
            acao: 'Login',
            user_agent: navigator.userAgent,
          }),
        }).catch(console.error)
      })
    }
    return { error }
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    setSession(null)
    setUser(null)
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email)
    return { error }
  }

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await authService.resendConfirmationEmail(email)
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await authService.updatePassword(password)
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        resetPassword,
        resendConfirmationEmail,
        updatePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
