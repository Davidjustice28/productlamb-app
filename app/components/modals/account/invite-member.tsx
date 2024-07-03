import React from "react";
import { PLBaseModal, PLModalFooter } from "../base";
  
export function PLInviteMemberModal({ isOpen, onSubmit, setIsOpen}: { isOpen: boolean, onSubmit: (email: string) => void, setIsOpen: (isOpen: boolean) => void}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const handleAdd = () => {
    const value = inputRef.current?.value
    if (!value) return
    onSubmit(value)
  }
  return (
    <PLBaseModal open={isOpen} setOpen={setIsOpen} title="Invite Team Member">
      <div className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full flex flex-col gap-2">
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Email Address</label>
        <input 
          ref={inputRef}
          type="email"
          placeholder="elonmusk@email.com" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"
        />
      </div>
      <PLModalFooter onSubmit={handleAdd} submitText="Add" onClose={() => setIsOpen(false)}/>
    </PLBaseModal>
  )
} 