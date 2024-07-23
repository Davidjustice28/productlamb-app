import { useEffect, useRef, useState } from "react"
import { PLBaseModal, PLModalFooter } from "../base"
import { ManualTaskData } from "~/types/component.types"
import { GeneratedTask } from "@prisma/client"

export function PLEditTaskModal({open, onSubmit, setOpen, task, authToken, setTask}: {open: boolean, setOpen: (open: boolean) => void, onSubmit?: (data: GeneratedTask[]) => void, task: GeneratedTask| null, authToken: string, setTask: (task: GeneratedTask| null) => void}) {
  const formRef = useRef<HTMLFormElement>(null)
  const pointsInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
  const reasonInputRef = useRef<HTMLTextAreaElement>(null)
  const categoryInputRef = useRef<HTMLSelectElement>(null)
  const [loading, setLoading] = useState(false)

  const getFormData = () => {
    const form = new FormData(formRef.current!)
    const data = Object.fromEntries(form.entries())

    return data as unknown as ManualTaskData & {id: string| number}
  }

  const onClose = () => {
    setTask(null)
    if (open) {
      setOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (pointsInputRef.current?.value === '' || pointsInputRef.current?.value === '0') return
    const data = getFormData()
    await fetch('/api/backlog', {
      method: 'POST',
      headers: {
        'Authorization': `${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then(async res => {
      const data = await res.json()
      console.log(data)
      if (res.ok && onSubmit) onSubmit(data.tasks)
    })
    setLoading(false)
    onClose()
  }

  useEffect(() => {
    if (task) {
      pointsInputRef.current!.value = (task?.points || '1').toString()
      titleInputRef.current!.value = task.title
      descriptionInputRef.current!.value = task.description
      reasonInputRef.current!.value = task.reason
      categoryInputRef.current!.value = task.category
    }
  }, [task])

  
  return (
    <PLBaseModal open={open} onClose={onClose} title="Edit task" setOpen={setOpen}>
      <form className="relative p-6 flex-auto rounded px-8 pt-6 pb-2 w-full flex flex-col gap-2" method="POST" ref={formRef}>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Title</label>
        <input ref={titleInputRef} type="text" name="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Description</label>
        <textarea ref={descriptionInputRef} name="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Reason</label>
        <textarea ref={reasonInputRef} name="reason" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700 resize-none"></textarea>
        <div className="flex justify-between gap-5 items-end">
          <div className="w-2/3">
            <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Points</label>
            <input name="points" type="number" ref={pointsInputRef} min={1} max={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700"></input>
          </div>
        </div>
        <label className="block text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">Category</label>
        <select ref={categoryInputRef} name="category" className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-800 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline border-gray-300 dark:bg-transparent dark:border-neutral-700">
          <option value="feature">Feature</option>
          <option value="bug">Bug</option>
          <option value="chore">Chore</option>
          <option value="other">Other</option>
        </select>
        <input type="hidden" name="action" value="update"/>
        <input type="hidden" name="id" value={task?.id}/>
      </form>
      <PLModalFooter closeText="Cancel" submitText="Update" onClose={onClose} onSubmit={handleSubmit}/>
    </PLBaseModal>
  )
}