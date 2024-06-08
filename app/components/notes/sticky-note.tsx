import React from 'react';
import { PLIconButton } from '../buttons/icon-button';

export const PLStickyNote = ({ id, text }: {id: number, text: string}) => {
  const formRef = React.useRef<HTMLFormElement>(null);

  const deleteNote = () => {
    formRef.current?.submit();
  };

  return (
    <div
      className='p-3 bg-[#FFF9C4] text-black text-sm shadow-md dark:bg-neutral-900 dark:text-neutral-400 font-bold max-h-40 group'
    >
      <div className='justify-between flex flex-col h-full'>
        <p>{text}</p>
        <div className='justify-end gap-2 group-hover:visible invisible'>
          <PLIconButton icon='ri-delete-bin-6-line' onClick={deleteNote} colorClasses='bg-transparent' />
        </div>
      </div>
      <form method='POST' ref={formRef}>
        <input type='hidden' name='id' value={id} />
        <input type='hidden' name='delete_note' />
      </form>
    </div>
  );
};