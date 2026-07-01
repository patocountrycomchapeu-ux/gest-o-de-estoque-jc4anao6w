const API_URL = import.meta.env.VITE_API_URL || '/api'

export const camelToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      acc[snakeKey] = camelToSnake(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

export const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = snakeToCamel(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt_token')

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Convert request body from snake_case to camelCase for the Java API
  let reqOptions = { ...options, headers }
  if (
    options.body &&
    typeof options.body === 'string' &&
    headers.get('Content-Type')?.includes('application/json')
  ) {
    try {
      const parsed = JSON.parse(options.body)
      reqOptions.body = JSON.stringify(snakeToCamel(parsed))
    } catch {
      /* intentionally ignored */
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, reqOptions)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      localStorage.removeItem('jwt_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    throw new Error(errorData.message || `${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null
  const data = await response.json()

  // Convert response from camelCase to snake_case for the frontend UI model
  return camelToSnake(data)
}
