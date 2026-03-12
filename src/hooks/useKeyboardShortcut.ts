import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: { meta?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (options.meta && !(e.metaKey || e.ctrlKey)) return
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      e.preventDefault()
      handler()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, handler, options.meta])
}
