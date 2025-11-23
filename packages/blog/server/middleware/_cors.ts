// packages/blog/server/middleware/cors.ts
import { defineEventHandler, setHeader, getRequestHeaders } from 'h3'

const ALLOWED_ORIGINS = ['http://localhost:5173', process.env.ADMIN_URL]

export default defineEventHandler(event => {
  const origin = getRequestHeaders(event).origin

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  }

  // 关键：补上 PATCH
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')

  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    return null
  }
})
