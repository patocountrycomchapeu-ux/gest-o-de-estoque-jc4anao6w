import { apiFetch } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  nome?: string
  full_name?: string
}

export interface AuthSession {
  access_token: string
  user: AuthUser
}

export class AuthService {
  async signUp(email: string, password: string, fullName: string) {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      })
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data && data.token) {
        localStorage.setItem('jwt_token', data.token)
        const user = data.user || { id: data.userId || '1', email }
        return {
          data: {
            session: { access_token: data.token, user },
            user,
          },
          error: null,
        }
      }
      throw new Error('Invalid credentials')
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  async resetPassword(email: string) {
    try {
      const data = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  async resendConfirmationEmail(email: string) {
    return { error: null }
  }

  async updatePassword(password: string) {
    try {
      const data = await apiFetch('/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  async signOut() {
    localStorage.removeItem('jwt_token')
    return { error: null }
  }

  async getSession(): Promise<{ data: { session: AuthSession | null }; error: any }> {
    try {
      const token = localStorage.getItem('jwt_token')
      if (!token) return { data: { session: null }, error: null }

      const data = await apiFetch('/auth/me')
      const user = data.user || data
      return { data: { session: { access_token: token, user } }, error: null }
    } catch (error) {
      return { data: { session: null }, error }
    }
  }
}

export const authService = new AuthService()
