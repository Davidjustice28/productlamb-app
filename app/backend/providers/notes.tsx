// context/SidebarContext.tsx
import { useAuth } from '@clerk/remix';
import { ApplicationNote } from '@prisma/client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

const NotesModalContext = createContext<{
  notesModalOpen: boolean;
  toggleNotesModal: (application_id?: number) => void;
  setNotesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notes: ApplicationNote[]
} | undefined>(undefined);

export const NotesModalProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const toggleNotesModal = (application_id?: number) => {
    if (!notesModalOpen && application_id) {
      fetch(`/api/notes/${application_id}`).then((res) => res.json())
      .then(data => {
        setNotes(data.notes)
      }).catch((err) => {
        console.error(err);
        return null
      });
    }
    setNotesModalOpen((prev) => !prev);
  };

  return (
    <NotesModalContext.Provider value={{ notesModalOpen, toggleNotesModal, setNotesModalOpen, notes }}>
      {children}
    </NotesModalContext.Provider>
  );
};

export const useNotesModal = (): {
  notesModalOpen: boolean;
  toggleNotesModal: (application_id?: number) => void;
  setNotesModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notes: ApplicationNote[]
} => {
  const context = useContext(NotesModalContext);
  if (!context) {
    throw new Error('useNotesModal must be used within a NotesModalProvider');
  }
  return context;
};
