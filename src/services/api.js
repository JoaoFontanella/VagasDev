export const apiRequest = async (path, options = {}) => {
  const response = await fetch(path, {
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
