import { useNoteStore } from '../../store/useNoteStore'
import { SearchBar } from '../search/SearchBar'
import { NoteList } from '../notes/NoteList'
import { NoteEditor } from '../notes/NoteEditor'

export function MainPanel() {
  const activeNoteId = useNoteStore(s => s.activeNoteId)

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-gray-50">
      {!activeNoteId && <SearchBar />}
      <div className="mx-3 mb-3 flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden bg-white">
        {activeNoteId ? <NoteEditor /> : <NoteList />}
      </div>
    </div>
  )
}
