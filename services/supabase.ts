const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// REST API 직접 호출용 헬퍼
const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

export async function supabaseGet<T>(table: string, query: string = ''): Promise<T[]> {
  const url = `${supabaseUrl}/rest/v1/${table}${query ? '?' + query : ''}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`Supabase GET error: ${res.status}`)
  }
  return res.json()
}

export async function supabaseGetSingle<T>(table: string, query: string): Promise<T | null> {
  const url = `${supabaseUrl}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    headers: { ...headers, 'Accept': 'application/vnd.pgrst.object+json' }
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
    headers,
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
    headers,
    body: JSON.stringify(data)
  })
  return res.ok
}

export async function supabaseDelete(table: string, query: string): Promise<boolean> {
  const url = `${supabaseUrl}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers
  })
  return res.ok
}
