import type { User } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Auth 세션 저장소
let currentSession: { access_token: string; refresh_token: string; user: any } | null = null

// 저장된 세션 복원
const savedSession = localStorage.getItem('supabase_session')
if (savedSession) {
  try {
    currentSession = JSON.parse(savedSession)
  } catch (e) {
    localStorage.removeItem('supabase_session')
  }
}

function saveSession(session: typeof currentSession) {
  currentSession = session
  if (session) {
    localStorage.setItem('supabase_session', JSON.stringify(session))
  } else {
    localStorage.removeItem('supabase_session')
  }
}

// Auth API 헤더
function getAuthHeaders(accessToken?: string) {
  return {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${accessToken || supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }
}

// 회원가입
export async function signUp(email: string, password: string, name: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      email,
      password,
      data: {
        name: name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
      }
    })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error_description || data.msg || 'Signup failed')
  }

  if (data.access_token) {
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user
    })
  }

  return data
}

// 로그인
export async function signIn(email: string, password: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error_description || data.msg || 'Login failed')
  }

  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user
  })

  return data
}

// 로그아웃
export async function signOut() {
  if (currentSession?.access_token) {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: getAuthHeaders(currentSession.access_token)
    })
  }
  saveSession(null)
}

// 현재 세션 가져오기
export function getSession() {
  return currentSession
}

// 현재 사용자 프로필 가져오기
export async function getCurrentUser(): Promise<User | null> {
  if (!currentSession?.access_token) {
    return null
  }

  try {
    // Auth 사용자 확인
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: getAuthHeaders(currentSession.access_token)
    })

    if (!authRes.ok) {
      saveSession(null)
      return null
    }

    const authUser = await authRes.json()

    // public.users 테이블에서 프로필 가져오기
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${authUser.id}&select=*`,
      {
        headers: {
          ...getAuthHeaders(currentSession.access_token),
          'Accept': 'application/vnd.pgrst.object+json'
        }
      }
    )

    if (!profileRes.ok) {
      // users 테이블에 프로필이 없으면 기본 정보 반환
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        avatar: authUser.user_metadata?.avatar_url || '',
        roles: [],
        joinDate: authUser.created_at
      } as unknown as User
    }

    const data = await profileRes.json()

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || '',
      roles: data.roles || [],
      joinDate: data.join_date,
      phone: data.phone,
      birthdate: data.birthdate,
      interests: data.interests,
      isProfileComplete: data.is_profile_complete
    } as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Auth 상태 변경 리스너 (간단한 폴링 방식)
type AuthCallback = (user: User | null) => void
const authListeners: AuthCallback[] = []

export function onAuthStateChange(callback: AuthCallback) {
  authListeners.push(callback)

  // 초기 상태 전달
  getCurrentUser().then(callback)

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          const idx = authListeners.indexOf(callback)
          if (idx > -1) authListeners.splice(idx, 1)
        }
      }
    }
  }
}

// 세션 변경 시 리스너들에게 알림
async function notifyAuthChange() {
  const user = await getCurrentUser()
  authListeners.forEach(cb => cb(user))
}

// 로그인/로그아웃 후 리스너 알림 (내부용)
export async function _notifyAuthListeners() {
  await notifyAuthChange()
}
