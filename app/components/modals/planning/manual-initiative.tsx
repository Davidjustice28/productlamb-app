import React, { useEffect } from "react";
import { PLBaseModal, PLModalFooter } from "../base";
import { useOrganization } from "@clerk/remix";
  
export function PLManualInitiativeModal({ isOpen, onSubmit, setIsOpen}: { isOpen: boolean, onSubmit: (initiative: string) => void, setIsOpen: (isOpen: boolean) => void}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [initiative, setInitiative] = React.useState<string>('')
  const onClose = () => {
    inputRef.current!.value = ''
    setIsOpen(false)
  }

  function handleSubmit() {
    if (!inputRef.current?.value) return
    onSubmit(inputRef.current.value)
  }

  return (
    <PLBaseModal open={isOpen} setOpen={setIsOpen} title="Preferred Initiative" onClose={onClose}>
      <div className="relative p-6 flex-auto rounded px-8 pt-6 w-full flex flex-col gap-2">
        {/* <p className="text-red-500 dark:text-red-400 text-sm mt-2">What is your overall goal or mission for this sprint?</p> */}
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">What is your overall goal or mission for the next sprint?</label>
        <input 
          ref={inputRef}
          type="initiative"
          placeholder="What is your overall goal or mission for this sprint?" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 invalid:border-red-600 invalid:border-2"
        />
        
      </div>
      <PLModalFooter submitText="Send" onClose={onClose} onSubmit={handleSubmit}/>
    </PLBaseModal>
  )
} 