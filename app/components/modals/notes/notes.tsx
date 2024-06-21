import React, { useEffect, useRef } from 'react';
import { useNotesModal } from '~/backend/providers/notes';
import { PLBaseModal, PLModalFooter } from '../base';
import { PLIconButton } from '~/components/buttons/icon-button';

export const PLNotesModal = () => {
  const {notesModalOpen, setNotesModalOpen, notes, setNotes } = useNotesModal()
  const [newNoteView, setNewNoteView] = React.useState(false)

  const toggleNewNoteView = () => {
    setNewNoteView(prev => !prev)
  }

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({note: inputRef.current?.value, action: 'add'}),
    })
    setNewNoteView(false)
    setNotesModalOpen(false)
  }

  const deleteNote = async (id: number) => {
    await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({action: 'delete', note_id: id}),
    })

    setNotesModalOpen(false)
  }

  const cancelNewNote = () => {
    setNewNoteView(false)
    setNotesModalOpen(false)
  }

  useEffect(() => {
    if (!notesModalOpen) {
      setNotes([])
    }
  }, [notesModalOpen])
  
  return (
    <PLBaseModal open={notesModalOpen} onClose={() => setNotesModalOpen(false)} title={newNoteView ? "Make Note": "Application Notes"} setOpen={setNotesModalOpen} size="lg">
      {newNoteView ? (
          <>
            <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full">
              <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2" htmlFor="feedback">Note</label>
              <textarea 
                ref={inputRef}
                name="note" 
                maxLength={100} 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none" 
                id="feedback"
                />
            </div>
            <PLModalFooter closeText="Cancel" submitText="Save" onClose={cancelNewNote} onSubmit={onSubmit}/>
          </>
        )
        : 
        (
          <>
            <div
              className='grid grid-cols-3 gap-6 w-full h-[500px] p-5 overflow-scroll'
            >
            {notes.map((note, i) => <PLStickyNote key={i} text={note.text} deleteNote={() => deleteNote(note.id)}/>)}
            </div>
            <PLModalFooter submitText="Add Note" onClose={() => setNotesModalOpen(false)} submitButtonIconClass='ri-add-line' onSubmit={toggleNewNoteView}/>
          </>
        )
      }
    </PLBaseModal>
  );
};


const PLStickyNote = ({ text, deleteNote }: {text: string, deleteNote: () => void }) => {
  return (
    <div
      className='p-3 bg-[#FFF9C4] text-black text-sm shadow-md dark:bg-[#b485bc] dark:text-black font-extrabold h-56 group'
    >
      <div className='justify-between flex flex-col h-full'>
        <p>{text}</p>
        <div className='justify-end gap-2 group-hover:visible invisible'>
          <PLIconButton icon='ri-delete-bin-6-line' onClick={deleteNote} colorClasses='bg-transparent' />
        </div>
      </div>
    </div>
  );
};