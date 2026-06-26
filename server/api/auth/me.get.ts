export default defineEventHandler(async (event) => {
  const user = event.context.user
  return createSuccessResponse({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url,
    created_at: user.created_at,
  })
})
