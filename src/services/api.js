const API_BASE_URL = (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8787'
    : (import.meta.env.VITE_API_BASE_URL || '')
).replace(/\/+$/, '')

const resolveApiUrl = (path) => {
  if (!path || typeof path !== 'string') {
    return API_BASE_URL
  }

  if (/^https?:\/\//i.test(path) || path.startsWith('//')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!API_BASE_URL) {
    return normalizedPath
  }

  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${API_BASE_URL}${normalizedPath.slice('/api'.length)}`
  }

  return `${API_BASE_URL}${normalizedPath}`
}

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(resolveApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Erro ao comunicar com o servidor.'
    try {
      const errorPayload = await response.json()
      if (errorPayload?.message) {
        message = errorPayload.message
      }
    } catch {
      // Keep default message when response is not JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
