export default defineNuxtRouteMiddleware(async () => {
  const { user, token, fetchUser } = useAuth()

  if (!token.value) {
    return navigateTo('/auth/login')
  }

  if (!user.value) {
    try {
      await fetchUser()
    } catch {
      return navigateTo('/auth/login')
    }
  }
})
