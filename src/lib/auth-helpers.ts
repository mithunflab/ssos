export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return

  const maxAge = 60 * 60 * 24 * 7 // 7 days
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
  document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

export const clearAuthCookies = () => {
  if (typeof window === 'undefined') return

  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export const getAuthCookies = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return {
    accessToken: cookies['sb-access-token'] || null,
    refreshToken: cookies['sb-refresh-token'] || null,
  }
}
