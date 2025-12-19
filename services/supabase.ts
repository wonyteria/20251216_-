const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// REST API 직접 호출용 헬퍼
function getHeaders() {
  const savedSession = localStorage.getItem('supabase_session')
  let accessToken = supabaseAnonKey
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession)
      if (session.access_token) {
        accessToken = session.access_token
      }
    } catch (e) {
      console.error('Error parsing session for headers', e)
    }
  }

  return {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
}

export async function supabaseGet<T>(table: string, query: string = ''): Promise<T[]> {
  const url = `${supabaseUrl}/rest/v1/${table}${query ? '?' + query : ''}`
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) {
    throw new Error(`Supabase GET error: ${res.status}`)
  }
  return res.json()
}

export async function supabaseGetSingle<T>(table: string, query: string): Promise<T | null> {
  const url = `${supabaseUrl}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    headers: { ...getHeaders(), 'Accept': 'application/vnd.pgrst.object+json' }
  })
  if (res.status === 406) return null // Not found
  if (!res.ok) {
    throw new Error(`Supabase GET error: ${res.status}`)
  }
  return res.json()
}

export async function supabasePost<T>(table: string, data: any): Promise<T> {
  const url = `${supabaseUrl}/rest/v1/${table}`
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    throw new Error(`Supabase POST error: ${res.status}`)
  }
  const result = await res.json()
  return Array.isArray(result) ? result[0] : result
}

export async function supabasePatch(table: string, query: string, data: any): Promise<boolean> {
  const url = `${supabaseUrl}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  return res.ok
}

export async function supabaseDelete(table: string, query: string): Promise<boolean> {
  const url = `${supabaseUrl}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders()
  })
  return res.ok
}
