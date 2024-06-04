import { PLBaseModal, PLModalFooter } from "../base"
import { useRef } from "react"

export function PLCreateNoteModal({open, onClose, setOpen}: {open: boolean, onClose?: () => void, setOpen: (open: boolean) => void}) {
  const formRef = useRef<HTMLFormElement>(null)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    formRef.current?.submit()
    setOpen(false)
  }

  return (
    <PLBaseModal open={open} onClose={onClose} title="Create Note" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full" method="POST" ref={formRef}>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2" htmlFor="feedback">Note</label>
        <textarea name="note" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none" id="feedback"/>
        <input type="hidden" name="add_note"/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={onSubmit}/>
    </PLBaseModal>
  )
}