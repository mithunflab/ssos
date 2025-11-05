import { createClient } from '@supabase/supabase-js'
import type { User, Profile } from '@/types/database'

type CacheItem<T> = {
  data: T
  timestamp: number
}

class DataCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private maxAge: number // milliseconds

  constructor(maxAgeSeconds = 60) {
    this.maxAge = maxAgeSeconds * 1000
  }

  set<T>(key: string, data: T) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  clear() {
    this.cache.clear()
  }

  clearForUser(userId: string) {
    for (const [key] of this.cache) {
      if (key.includes(userId)) {
        this.cache.delete(key)
      }
    }
  }
}

export const globalCache = new DataCache()