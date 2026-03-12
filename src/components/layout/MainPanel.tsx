import { useNoteStore } from '../../store/useNoteStore'
import { SearchBar } from '../search/SearchBar'
import { NoteList } from '../notes/NoteList'
import { NoteEditor } from '../notes/NoteEditor'

export function MainPanel() {
  const activeNoteId = useNoteStore(s => s.activeNoteId)

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {!activeNoteId && <SearchBar />}
      {activeNoteId ? <NoteEditor /> : <NoteList />}
    </div>
  )
}
