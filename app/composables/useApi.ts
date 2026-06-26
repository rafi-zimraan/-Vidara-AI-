export const useApi = () => {
  const { token } = useAuth()

  const headers = () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token.value) {
      h['Authorization'] = `Bearer ${token.value}`
    }
    return h
  }

  async function get<T>(url: string, query?: Record<string, string>) {
    const qs = query ? '?' + new URLSearchParams(query).toString() : ''
    const res: any = await $fetch(`${url}${qs}`, { headers: headers() })
    return res.data as T
  }

  async function post<T>(url: string, body?: any) {
    const res: any = await $fetch(url, {
      method: 'POST',
      headers: headers(),
      body,
    })
    return res.data as T
  }

  async function patch<T>(url: string, body?: any) {
    const res: any = await $fetch(url, {
      method: 'PATCH',
      headers: headers(),
      body,
    })
    return res.data as T
  }

  async function del(url: string) {
    const res: any = await $fetch(url, {
      method: 'DELETE',
      headers: headers(),
    })
    return res.data
  }

  return { get, post, patch, del }
}
