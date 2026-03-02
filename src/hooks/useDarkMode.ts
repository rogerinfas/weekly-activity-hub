'use client'

import { useEffect, useState } from 'react'

export function useDarkMode(storageKey = 'wah-dark') {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem(storageKey)
      : null

    const prefersDark =
      saved !== null
        ? saved === 'true'
        : typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches

    setIsDark(prefersDark)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [storageKey])

  function toggleDark() {
    setIsDark(prev => {
      const next = !prev
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next)
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, String(next))
      }
      return next
    })
  }

  return { isDark, toggleDark }
}

