import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { MainPanel } from './components/layout/MainPanel'
import { useNoteStore } from './store/useNoteStore'
import { trackEvent } from './lib/growthbook'

export function App() {
  const fetchNotes = useNoteStore(s => s.fetchNotes)
  const loaded = useNoteStore(s => s.loaded)

  useEffect(() => {
    trackEvent('session_start')
    trackEvent('page_view')
  }, [])

  useEffect(() => {
    fetchNotes()
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      if (e.data === 'changed') fetchNotes()
    }
    return () => es.close()
  }, [fetchNotes])

  if (!loaded) return <div className="flex h-screen items-center justify-center text-zinc-400">Loading…</div>

  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden">
      <Sidebar />
      <MainPanel />
    </div>
  )
}
