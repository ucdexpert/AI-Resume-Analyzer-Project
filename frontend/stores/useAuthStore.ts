import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  name: string
  email: string
  analysis_count: number
}

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: (token, user) => set({
        token,
        user,
        isLoggedIn: true
      }),

      logout: () => {
        set({
          token: null,
          user: null,
          isLoggedIn: false
        });
        // Clear storage manually just in case
        localStorage.removeItem('auth-storage');
      },
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore
