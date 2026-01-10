import { create } from 'zustand'

type Role = 'guest' | 'admin'

interface AuthState {
  role: Role
  initialized: boolean
  initFromCookie: () => void
  login: (username: string, password: string) => boolean
  quickAdminLogin: () => void
  logout: () => void
}

const COOKIE_KEY = 'psm_admin_auth'

const readRoleFromCookie = (): Role => {
  if (typeof document === 'undefined') return 'guest'
  const cookies = document.cookie.split(';').map(c => c.trim())
  const hit = cookies.find(c => c.startsWith(`${COOKIE_KEY}=`))
  if (!hit) return 'guest'
  const value = hit.split('=')[1]
  return value === '1' ? 'admin' : 'guest'
}

const writeRoleToCookie = (role: Role) => {
  if (typeof document === 'undefined') return
  if (role === 'admin') {
    document.cookie = `${COOKIE_KEY}=1; path=/; max-age=${60 * 60 * 24 * 7}`
  } else {
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`
  }
}

const useAuthStore = create<AuthState>((set) => ({
  role: 'guest',
  initialized: false,
  initFromCookie: () => {
    const role = readRoleFromCookie()
    set({ role, initialized: true })
  },
  login: (username, password) => {
    if (username === 'admin' && password === 'admin') {
      writeRoleToCookie('admin')
      set({ role: 'admin' })
      return true
    }
    return false
  },
  quickAdminLogin: () => {
    writeRoleToCookie('admin')
    set({ role: 'admin' })
  },
  logout: () => {
    writeRoleToCookie('guest')
    set({ role: 'guest' })
  },
}))

export default useAuthStore

