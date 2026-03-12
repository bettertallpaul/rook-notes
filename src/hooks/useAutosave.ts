import { useEffect, useRef } from 'react'

export function useAutosave(
  content: string,
  onSave: (content: string) => void,
  delay = 800
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedRef = useRef(content)

  useEffect(() => {
    if (content === savedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      savedRef.current = content
      onSave(content)
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content, onSave, delay])
}
