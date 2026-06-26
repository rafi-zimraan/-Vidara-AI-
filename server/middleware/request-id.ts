export default defineEventHandler((event) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  event.context.requestId = requestId
  setHeader(event, 'x-request-id', requestId)
})
