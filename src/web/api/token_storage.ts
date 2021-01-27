import LRU from 'lru-cache'

export const tokenStorage = new LRU<string, string>({
  maxAge: 5 * 60 * 1000, // inactive for 5-min
  updateAgeOnGet: true
})
