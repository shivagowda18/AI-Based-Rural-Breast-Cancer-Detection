const BACKEND_URL = 'https://rural-breast-ai-backend.onrender.com'

const allowedRoutes = {
  '/api/health': 'GET',
  '/api/images/upload': 'POST',
  '/api/predict': 'POST',
  '/api/explain': 'POST',
}

export async function onRequest(context) {
  const request = context.request
  const url = new URL(request.url)
  const requiredMethod = allowedRoutes[url.pathname]

  if (!requiredMethod) {
    return new Response('Not Found', { status: 404 })
  }

  if (request.method !== requiredMethod) {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const upstreamUrl = new URL(
    url.pathname + url.search,
    BACKEND_URL
  )

  const upstreamRequest = new Request(
    upstreamUrl.toString(),
    request
  )

  upstreamRequest.headers.delete('cookie')
  upstreamRequest.headers.delete('host')

  try {
    return await fetch(upstreamRequest)
  } catch {
    return new Response(
      JSON.stringify({
        detail: 'AI backend temporarily unavailable',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}