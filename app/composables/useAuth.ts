interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const token = useState<string | null>('token', () => null)
  const loading = useState('auth-loading', () => false)

  const _fetch = (url: string, opts?: any) =>
    $fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        ...opts?.headers,
      },
    })

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res: any = await _fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      token.value = res.data.access_token
      user.value = {
        id: res.data.user_id,
        email: res.data.email,
        name: res.data.email.split('@')[0],
      }
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, name: string) {
    loading.value = true
    try {
      const res: any = await _fetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return null
    try {
      const res: any = await _fetch('/api/auth/me')
      user.value = res.data
      return res.data
    } catch {
      user.value = null
      token.value = null
      return null
    }
  }

  async function logout() {
    try {
      await _fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      token.value = null
    }
  }

  return { user, token, loading, login, register, fetchUser, logout }
}
