import { useRef } from "react"
import { PLBaseModal, PLModalFooter } from "../base"
import { GeneratedTask } from "@prisma/client"
import { ManualTaskData } from "~/types/component.types"

export function PLAddTaskModal({open,onSubmit, setOpen}: {open: boolean, setOpen: (open: boolean) => void, onSubmit?: (data: ManualTaskData) => void}) {
  const formRef = useRef<HTMLFormElement>(null)

  const getFormData = () => {
    const form = new FormData(formRef.current!)
    const data = Object.fromEntries(form.entries())

    return data as unknown as ManualTaskData
  }

  const onClose = () => {
    formRef.current?.reset()
    if (open) {
      setOpen(false)
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(getFormData())
    } else {
      formRef.current?.submit()
    }
    onClose()
  }
  
  return (
    <PLBaseModal open={open} onClose={onClose} title="Add task to sprint" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full flex flex-col gap-2" method="POST" ref={formRef}>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Title</label>
        <input type="text" name="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Description</label>
        <textarea name="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Reason</label>
        <textarea name="reason" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Points</label>
        <input name="points" type="number" min={1} defaultValue={1} max={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Category</label>
        <select name="category" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700">
          <option value="feature">Feature</option>
          <option value="bug">Bug</option>
          <option value="chore">Chore</option>
          <option value="other">Other</option>
        </select>
        <input type="hidden" name="action" value="add"/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Add" onClose={onClose} onSubmit={handleSubmit}/>
    </PLBaseModal>
  )
}