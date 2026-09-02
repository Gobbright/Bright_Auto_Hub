const DEFAULT_API_URL = import.meta.env.PROD ? 'https://api-brightautohub.gobrightglobal.com/api' : 'http://localhost:5000/api'
const API_URL = String(import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

const request = async (path, options = {}) => {
  const endpoint = path.startsWith('/') ? path : '/' + path
  let response
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Unable to reach Bright Auto Hub API. Check that api-brightautohub.gobrightglobal.com is live and using HTTPS.')
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Unable to complete the request')
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export { API_URL }
