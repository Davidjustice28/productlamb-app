import React from 'react';
import { PLStickyNote } from './sticky-note';

export const PLNotesDropBox = ({ notes }: {notes: {id: number, text: string}[]}) => {
  return (
    <div
      className='g grid grid-cols-3 gap-4 w-full h-full p-2'
    >
     {notes.map((note, i) => <PLStickyNote key={i} text={note.text} id={note.id}/>)}
    </div>
  );
};